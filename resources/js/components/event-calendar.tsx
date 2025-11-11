import { Button } from '@/components/ui/button-shad';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { RiCalendarCheckLine } from '@remixicon/react';
import {
    addDays,
    addMonths,
    addWeeks,
    areIntervalsOverlapping,
    endOfDay,
    endOfWeek,
    format,
    isSameMonth,
    isWithinInterval,
    startOfDay,
    startOfWeek,
    subMonths,
    subWeeks,
} from 'date-fns';
import { CalendarX, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AgendaView } from './agenda-view';
import { CalendarDndProvider } from './calendar-dnd-context';
import { AgendaDaysToShow, EventGap, EventHeight, WeekCellsHeight } from './constants';
import { DayView } from './day-view';
import { EventDialog } from './event-dialog';
import { MonthView } from './month-view';
import type { CalendarEvent, CalendarView } from './types';
import { addHoursToDate } from './utils';
import { WeekView } from './week-view';

export interface EventCalendarProps {
    events?: CalendarEvent[];
    onEventAdd?: (event: CalendarEvent) => void;
    onEventUpdate?: (event: CalendarEvent) => void;
    onEventDelete?: (eventId: string) => void;
    className?: string;
    initialView?: CalendarView;
    appointmentTimes?: Record<string, { from: string; to: string; status: string }[]>;
    blockedtimes?: Record<string, { from: string; to: string }[]>;
}

export function EventCalendar({
    events = [],
    onEventAdd,
    onEventUpdate,
    onEventDelete,
    className,
    initialView = 'month',
    appointmentTimes,
    blockedtimes,
}: EventCalendarProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>(initialView);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [isBlockDateDialog, setIsBlockDateDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
    const [isCreateChooserOpen, setIsCreateChooserOpen] = useState(false);
    const [createSource, setCreateSource] = useState<'event_booking' | 'appointment' | 'service_booking' | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                isEventDialogOpen ||
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target instanceof HTMLElement && e.target.isContentEditable)
            ) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'm':
                    setView('month');
                    break;
                case 'w':
                    setView('week');
                    break;
                case 'd':
                    setView('day');
                    break;
                case 'a':
                    setView('agenda');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEventDialogOpen]);

    // Listen for custom events to add new events to the calendar
    useEffect(() => {
        const handleBookingAdded = (e: CustomEvent<CalendarEvent>) => {
            onEventAdd?.(e.detail);
        };

        const handleAppointmentAdded = (e: CustomEvent<CalendarEvent>) => {
            onEventAdd?.(e.detail);
        };

        const handleServiceBookingAdded = (e: CustomEvent<CalendarEvent>) => {
            onEventAdd?.(e.detail);
        };

        window.addEventListener('bookingAdded', handleBookingAdded as EventListener);
        window.addEventListener('appointmentAdded', handleAppointmentAdded as EventListener);
        window.addEventListener('serviceBookingAdded', handleServiceBookingAdded as EventListener);

        return () => {
            window.removeEventListener('bookingAdded', handleBookingAdded as EventListener);
            window.removeEventListener('appointmentAdded', handleAppointmentAdded as EventListener);
            window.removeEventListener('serviceBookingAdded', handleServiceBookingAdded as EventListener);
        };
    }, [onEventAdd]);

    const handlePrevious = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else if (view === 'week') {
            setCurrentDate(subWeeks(currentDate, 1));
        } else if (view === 'day') {
            setCurrentDate(addDays(currentDate, -1));
        } else if (view === 'agenda') {
            setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else if (view === 'week') {
            setCurrentDate(addWeeks(currentDate, 1));
        } else if (view === 'day') {
            setCurrentDate(addDays(currentDate, 1));
        } else if (view === 'agenda') {
            setCurrentDate(addDays(currentDate, AgendaDaysToShow));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event);
        if (typeof event.id === 'string' && event.id.startsWith('blocked-')) {
            setIsBlockDateDialog(true);
            setDialogMode('view');
            setIsEventDialogOpen(true);
            return;
        }

        setDialogMode('view');
        setIsEventDialogOpen(true);
    };

    const handleEventCreate = (startTime: Date) => {
        // Prevent creating an event on a blocked date (especially all-day blocked dates)
        // Proposed event interval (default 1 hour)
        const proposedStart = startTime;
        const proposedEnd = addHoursToDate(startTime, 1);

        const isBlocked = events.some((ev) => {
            if (!ev.id || typeof ev.id !== 'string' || !ev.id.startsWith('blocked-')) return false;

            const evDate = format(new Date(ev.start), 'yyyy-MM-dd');
            const evStartTimeStr = (ev as any).start_time ?? null;
            const evEndTimeStr = (ev as any).end_time ?? null;

            if (evStartTimeStr || evEndTimeStr) {
                const bs = evStartTimeStr || '00:00';
                const be = evEndTimeStr || '23:59';
                const blockedStart = new Date(`${evDate}T${bs}:00`);
                const blockedEnd = new Date(`${evDate}T${be}:00`);
                return areIntervalsOverlapping(
                    { start: proposedStart, end: proposedEnd },
                    { start: blockedStart, end: blockedEnd },
                    { inclusive: true },
                );
            }

            const evStart = startOfDay(new Date(ev.start));
            const evEnd = endOfDay(new Date(ev.end));
            return isWithinInterval(startOfDay(proposedStart), { start: evStart, end: evEnd });
        });

        if (isBlocked) {
            toast.error?.('Cannot create an event on a blocked date/time');
            return;
        }

        // Snap to 15-minute intervals
        const minutes = startTime.getMinutes();
        const remainder = minutes % 15;
        if (remainder !== 0) {
            if (remainder < 7.5) {
                // Round down to nearest 15 min
                startTime.setMinutes(minutes - remainder);
            } else {
                // Round up to nearest 15 min
                startTime.setMinutes(minutes + (15 - remainder));
            }
            startTime.setSeconds(0);
            startTime.setMilliseconds(0);
        }

        const newEvent: CalendarEvent = {
            id: '',
            title: '',
            start: startTime,
            end: addHoursToDate(startTime, 1),
            allDay: false,
        };
        setSelectedEvent(newEvent);
        setDialogMode('edit');
        // Open the chooser to select Booking or Appointment type before opening the dialog
        setCreateSource(null);
        setIsCreateChooserOpen(true);
    };

    const handleEventSave = (event: CalendarEvent) => {
        if (isBlockDateDialog) {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const payload: any = {
                date: (event as any).event_date || format(new Date(event.start), 'yyyy-MM-dd'),
                reason: (event as any).description || (event as any).special_request || 'Blocked Date',
                start_time: (event as any).start_time ?? null,
                end_time: (event as any).end_time ?? null,
            };

            if (event.id && typeof event.id === 'string' && event.id.startsWith('blocked-')) {
                const id = event.id.replace('blocked-', '');
                fetch(`/blocked-dates/update/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        let startVal: Date;
                        let endVal: Date;
                        const hasTimes = data.start_time || data.end_time;
                        if (hasTimes) {
                            const s = data.start_time || '00:00';
                            const e = data.end_time || '23:59';
                            startVal = new Date(`${data.date}T${s}:00`);
                            endVal = new Date(`${data.date}T${e}:00`);
                        } else {
                            startVal = new Date(data.date);
                            endVal = new Date(data.date + 'T23:59:59');
                        }

                        // Update local event state
                        const updatedEvent: CalendarEvent = {
                            ...event,
                            title: data.reason || event.title || 'Blocked Date',
                            description: data.reason || payload.reason,
                            start: startVal,
                            end: endVal,
                            allDay: !hasTimes,
                            color: 'rose',
                        };
                        // attach raw times so the dialog can show them
                        (updatedEvent as any).start_time = data.start_time ?? null;
                        (updatedEvent as any).end_time = data.end_time ?? null;

                        onEventUpdate?.(updatedEvent);
                        toast(`Blocked date updated`, { description: format(new Date(updatedEvent.start), 'MMM d, yyyy'), position: 'top-center' });
                    })
                    .catch((err) => {
                        console.error('Error updating blocked date', err);
                        toast.error?.('Failed to update blocked date');
                    })
                    .finally(() => {
                        setIsEventDialogOpen(false);
                        setSelectedEvent(null);
                        setIsBlockDateDialog(false);
                    });
            } else {
                // Create new blocked date
                fetch('/blocked-dates/store', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
                })
                    .then(async (res) => {
                        const text = await res.text();
                        let data: any = null;
                        try {
                            data = text ? JSON.parse(text) : null;
                        } catch (parseErr) {
                            console.warn('Non-JSON response creating blocked date:', text);
                        }

                        if (!res.ok) {
                            console.error('Create blocked date returned non-OK status', res.status, text);
                        }

                        // Prefer server-returned values, fall back to payload when missing
                        const dateVal = (data && data.date) || payload.date;
                        const s =
                            (data && ((data.start_time ?? data.start_time === null) ? data.start_time : undefined)) ?? payload.start_time ?? null;
                        const e = (data && ((data.end_time ?? data.end_time === null) ? data.end_time : undefined)) ?? payload.end_time ?? null;
                        const hasTimes = Boolean(s || e);

                        let startVal: Date;
                        let endVal: Date;
                        if (hasTimes) {
                            const ss = s || '00:00';
                            const ee = e || '23:59';
                            startVal = new Date(`${dateVal}T${ss}:00`);
                            endVal = new Date(`${dateVal}T${ee}:00`);
                        } else {
                            startVal = new Date(dateVal);
                            endVal = new Date(dateVal + 'T23:59:59');
                        }

                        const newEvent: CalendarEvent = {
                            id: data && data.date_id ? `blocked-${data.date_id}` : `blocked-${Math.random().toString(36).substring(2, 11)}`,
                            title: data && data.reason ? data.reason : payload.reason || 'Blocked Date',
                            description: (data && data.reason) || payload.reason || '',
                            start: startVal,
                            end: endVal,
                            allDay: !hasTimes,
                            color: 'rose',
                        };
                        (newEvent as any).start_time = s ?? null;
                        (newEvent as any).end_time = e ?? null;

                        onEventAdd?.(newEvent);

                        if (res.ok) {
                            toast('Blocked date added', { description: format(new Date(newEvent.start), 'MMM d, yyyy'), position: 'top-center' });
                        } else {
                            toast.error?.('Failed to create blocked date');
                        }
                    })
                    .catch((err) => {
                        // Network or parsing errors
                        console.error('Error creating blocked date', err);
                        // Fallback: create an event locally from the payload so it appears on the calendar
                        try {
                            const dateVal = payload.date;
                            const s = payload.start_time ?? null;
                            const e = payload.end_time ?? null;
                            const hasTimes = Boolean(s || e);
                            let startVal: Date;
                            let endVal: Date;
                            if (hasTimes) {
                                const ss = s || '00:00';
                                const ee = e || '23:59';
                                startVal = new Date(`${dateVal}T${ss}:00`);
                                endVal = new Date(`${dateVal}T${ee}:00`);
                            } else {
                                startVal = new Date(dateVal);
                                endVal = new Date(dateVal + 'T23:59:59');
                            }

                            const newEvent: CalendarEvent = {
                                id: `blocked-${Math.random().toString(36).substring(2, 11)}`,
                                title: payload.reason || 'Blocked Date',
                                description: payload.reason || '',
                                start: startVal,
                                end: endVal,
                                allDay: !hasTimes,
                                color: 'rose',
                            };
                            (newEvent as any).start_time = s ?? null;
                            (newEvent as any).end_time = e ?? null;

                            onEventAdd?.(newEvent);
                            toast('Blocked date added (offline)', {
                                description: format(new Date(newEvent.start), 'MMM d, yyyy'),
                                position: 'top-center',
                            });
                        } catch (fallbackErr) {
                            console.error('Fallback failed creating blocked date event', fallbackErr);
                            toast.error?.('Failed to create blocked date');
                        }
                    })
                    .finally(() => {
                        setIsEventDialogOpen(false);
                        setSelectedEvent(null);
                        setIsBlockDateDialog(false);
                    });
            }
            return;
        }

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        const overlapsBlocked = events.some((ev) => {
            if (!ev.id || typeof ev.id !== 'string' || !ev.id.startsWith('blocked-')) return false;

            const evDate = format(new Date(ev.start), 'yyyy-MM-dd');
            const evStartTimeStr = (ev as any).start_time ?? null;
            const evEndTimeStr = (ev as any).end_time ?? null;

            if (evStartTimeStr || evEndTimeStr) {
                const bs = evStartTimeStr || '00:00';
                const be = evEndTimeStr || '23:59';
                const blockedStart = new Date(`${evDate}T${bs}:00`);
                const blockedEnd = new Date(`${evDate}T${be}:00`);
                return areIntervalsOverlapping({ start: eventStart, end: eventEnd }, { start: blockedStart, end: blockedEnd }, { inclusive: true });
            }

            const evStart = startOfDay(new Date(ev.start));
            const evEnd = endOfDay(new Date(ev.end));
            return isWithinInterval(startOfDay(eventStart), { start: evStart, end: evEnd });
        });

        if (overlapsBlocked) {
            toast.error?.('Cannot create or update an event on a blocked date');
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
            setIsBlockDateDialog(false);
            return;
        }

        if (event.id) {
            onEventUpdate?.(event);
            // Show toast notification when an event is updated
            toast(`Event "${event.title}" updated`, {
                description: format(new Date(event.start), 'MMM d, yyyy'),
                position: 'top-center',
            });
        } else {
            onEventAdd?.({
                ...event,
                id: Math.random().toString(36).substring(2, 11),
            });
            // Show toast notification when an event is added
            toast(`Event "${event.title}" added`, {
                description: format(new Date(event.start), 'MMM d, yyyy'),
                position: 'top-center',
            });
        }
        setIsEventDialogOpen(false);
        setSelectedEvent(null);
        setIsBlockDateDialog(false);
    };

    const handleEventDelete = (eventId: string) => {
        const deletedEvent = events.find((e) => e.id === eventId);

        // Call onEventDelete for all events (including blocked dates)
        onEventDelete?.(eventId);

        setIsEventDialogOpen(false);
        setSelectedEvent(null);
        setIsBlockDateDialog(false);

        // Show toast notification when an event is deleted
        if (deletedEvent) {
            toast(`Event "${deletedEvent.title}" deleted`, {
                description: format(new Date(deletedEvent.start), 'MMM d, yyyy'),
                position: 'top-center',
            });
        }
    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        const eventStart = new Date(updatedEvent.start);
        const eventEnd = new Date(updatedEvent.end);

        const conflictsWithBlocked = (events || []).some((ev) => {
            if (!ev.id || typeof ev.id !== 'string' || !ev.id.startsWith('blocked-')) return false;

            const evDate = format(new Date(ev.start), 'yyyy-MM-dd');
            const evStartTimeStr = (ev as any).start_time ?? null;
            const evEndTimeStr = (ev as any).end_time ?? null;

            if (evStartTimeStr || evEndTimeStr) {
                const bs = evStartTimeStr || '00:00';
                const be = evEndTimeStr || '23:59';
                const blockedStart = new Date(`${evDate}T${bs}:00`);
                const blockedEnd = new Date(`${evDate}T${be}:00`);
                return areIntervalsOverlapping({ start: eventStart, end: eventEnd }, { start: blockedStart, end: blockedEnd }, { inclusive: true });
            }

            const evStartDay = startOfDay(new Date(ev.start));
            const evEndDay = endOfDay(new Date(ev.end));
            return isWithinInterval(startOfDay(eventStart), { start: evStartDay, end: evEndDay });
        });

        if (conflictsWithBlocked) {
            toast.error?.('Cannot move event into a blocked date/time');
            return;
        }

        onEventUpdate?.(updatedEvent);
        toast(`Event "${updatedEvent.title}" moved`, {
            description: format(new Date(updatedEvent.start), 'MMM d, yyyy'),
            position: 'top-center',
        });
    };

    const viewTitle = useMemo(() => {
        if (view === 'month') {
            return format(currentDate, 'MMMM yyyy');
        } else if (view === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = endOfWeek(currentDate, { weekStartsOn: 0 });
            if (isSameMonth(start, end)) {
                return format(start, 'MMMM yyyy');
            } else {
                return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
            }
        } else if (view === 'day') {
            return (
                <>
                    <span className="min-[480px]:hidden" aria-hidden="true">
                        {format(currentDate, 'MMM d, yyyy')}
                    </span>
                    <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
                        {format(currentDate, 'MMMM d, yyyy')}
                    </span>
                    <span className="max-md:hidden">{format(currentDate, 'EEE MMMM d, yyyy')}</span>
                </>
            );
        } else if (view === 'agenda') {
            // Show the month range for agenda view
            const start = currentDate;
            const end = addDays(currentDate, AgendaDaysToShow - 1);

            if (isSameMonth(start, end)) {
                return format(start, 'MMMM yyyy');
            } else {
                return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
            }
        } else {
            return format(currentDate, 'MMMM yyyy');
        }
    }, [currentDate, view]);

    return (
        <div
            className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
            style={
                {
                    '--event-height': `${EventHeight}px`,
                    '--event-gap': `${EventGap}px`,
                    '--week-cells-height': `${WeekCellsHeight}px`,
                } as React.CSSProperties
            }
        >
            <CalendarDndProvider onEventUpdate={handleEventUpdate}>
                <div className={cn('flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between sm:p-4', className)}>
                    <div className="flex items-center gap-1 sm:gap-4">
                        <Button variant="outline" className="max-[479px]:aspect-square max-[479px]:p-0!" onClick={handleToday}>
                            <RiCalendarCheckLine className="min-[480px]:hidden" size={16} aria-hidden="true" />
                            <span className="max-[479px]:sr-only">Today</span>
                        </Button>
                        <div className="flex items-center sm:gap-2">
                            <Button variant="ghost" size="icon" onClick={handlePrevious} aria-label="Previous">
                                <ChevronLeftIcon size={16} aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Next">
                                <ChevronRightIcon size={16} aria-hidden="true" />
                            </Button>
                        </div>
                        <h2 className="text-sm font-semibold sm:text-lg md:text-xl">{viewTitle}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="secondary"
                            className="max-[479px]:aspect-square max-[479px]:p-0!"
                            size="sm"
                            onClick={() => {
                                setSelectedEvent(null);
                                setIsBlockDateDialog(true);
                                setIsEventDialogOpen(true);
                            }}
                        >
                            <CalendarX className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                            <span className="max-sm:sr-only">Block Date</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                                    <span>
                                        <span className="min-[480px]:hidden" aria-hidden="true">
                                            {view.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="max-[479px]:sr-only">{view.charAt(0).toUpperCase() + view.slice(1)}</span>
                                    </span>
                                    <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-32">
                                <DropdownMenuItem onClick={() => setView('month')}>
                                    Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setView('week')}>
                                    Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setView('day')}>
                                    Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setView('agenda')}>
                                    Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            className="max-[479px]:aspect-square max-[479px]:p-0!"
                            size="sm"
                            variant="brand"
                            onClick={() => {
                                setSelectedEvent(null);
                                setCreateSource(null);
                                setIsCreateChooserOpen(true);
                                setDialogMode('edit');
                            }}
                        >
                            <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                            <span className="max-sm:sr-only">New event</span>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    {view === 'month' && (
                        <MonthView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {view === 'week' && (
                        <WeekView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {view === 'day' && (
                        <DayView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {view === 'agenda' && <AgendaView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} />}
                </div>

                <EventDialog
                    event={selectedEvent}
                    isOpen={isEventDialogOpen}
                    onClose={() => {
                        setIsEventDialogOpen(false);
                        setSelectedEvent(null);
                        setIsBlockDateDialog(false);
                    }}
                    onSave={handleEventSave}
                    onDelete={handleEventDelete}
                    mode={isBlockDateDialog ? 'blockDate' : 'event'}
                    dialogMode={dialogMode}
                    forceSource={(createSource as any) || undefined}
                    appointmentTimes={appointmentTimes}
                    blockedtimes={blockedtimes}
                />
                {isCreateChooserOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreateChooserOpen(false)} />
                        <div className="relative w-full max-w-sm rounded bg-white p-4 shadow-lg dark:bg-gray-600">
                            <h3 className="mb-2 text-lg font-medium dark:text-gray-100">Create new</h3>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="brand"
                                    className="bg-accent2"
                                    onClick={() => {
                                        setCreateSource('event_booking');
                                        setIsCreateChooserOpen(false);
                                        setIsEventDialogOpen(true);
                                    }}
                                >
                                    Event Booking
                                </Button>
                                <Button
                                    variant="brand"
                                    className="bg-accent2"
                                    onClick={() => {
                                        setCreateSource('appointment');
                                        setIsCreateChooserOpen(false);
                                        setIsEventDialogOpen(true);
                                    }}
                                >
                                    Appointment
                                </Button>
                                <Button
                                    variant="brand"
                                    className="bg-accent2"
                                    onClick={() => {
                                        setCreateSource('service_booking');
                                        setIsCreateChooserOpen(false);
                                        setIsEventDialogOpen(true);
                                    }}
                                >
                                    Service Booking
                                </Button>
                                <Button variant="secondary" onClick={() => setIsCreateChooserOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CalendarDndProvider>
        </div>
    );
}
