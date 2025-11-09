import { EventCalendar } from '@/components';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import type { CalendarEvent } from '../components/types';

export default function Component() {
    const { bookingEvents, appointmentEvents, blockedDates, serviceBookings } = usePage().props;

    const appointmentTimes = useMemo(() => {
        const times: Record<string, { from: string; to: string; status: string }[]> = {};
        Object.entries(appointmentEvents || {}).forEach(([dateKey, appts]) => {
            times[dateKey] = (appts as any[]).map((appt: any) => ({
                from: appt.appointment_time_from,
                to: appt.appointment_time_to,
                status: appt.status || 'reserved',
            }));
        });
        return times;
    }, [appointmentEvents]);

    const blockedtimes = useMemo(() => {
        const times: Record<string, { from: string; to: string }[]> = {};
        Object.entries(blockedDates || {}).forEach(([dateKey, blocks]) => {
            times[dateKey] = (blocks as any[]).map((blk: any) => ({
                from: blk.start_time || '00:00',
                to: blk.end_time || '23:59',
            }));
        });
        return times;
    }, [blockedDates]);
    const initialEvents = useMemo<CalendarEvent[]>(() => {
        const allEvents: CalendarEvent[] = [];

        Object.entries(bookingEvents || {}).forEach(([dateKey, bookings]) => {
            ((bookings as any[]) || []).forEach((booking: any, index: number) => {
                let startDate: Date;
                let endDate: Date;

                try {
                    let datePart: string;
                    if (dateKey.includes('T')) {
                        datePart = parseISO(dateKey).toISOString().split('T')[0];
                    } else if (dateKey.includes(' ')) {
                        datePart = dateKey.split(' ')[0];
                    } else {
                        datePart = dateKey;
                    }
                    const timeFrom = booking.event_time_from || '00:00';
                    const timeTo = booking.event_time_to || '00:00';

                    const cleanTimeFrom = timeFrom.split(':').slice(0, 2).join(':');
                    const cleanTimeTo = timeTo.split(':').slice(0, 2).join(':');

                    const startStr = `${datePart}T${cleanTimeFrom}:00`;
                    const endStr = `${datePart}T${cleanTimeTo}:00`;

                    startDate = new Date(startStr);
                    endDate = new Date(endStr);

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn(`Invalid date for booking ${booking.booking_id} on ${dateKey}: start=${startStr}, end=${endStr}`);
                        return;
                    }

                    const isAllDay = (cleanTimeFrom === '00:00' && cleanTimeTo === '00:00') || (cleanTimeFrom === '07:00' && cleanTimeTo === '22:00');
                    const color =
                        booking.status === 'completed'
                            ? 'emerald'
                            : booking.status === 'confirmed'
                              ? 'emerald'
                              : booking.status === 'cancelled'
                                ? 'rose'
                                : 'amber';
                    const isStrikethrough = booking.status === 'completed';

                    const event: CalendarEvent = {
                        id: `booking-${booking.booking_id}`,
                        title: booking.event_name || 'Unnamed Booking',
                        description: `Guests: ${booking.guest_count || 'N/A'}
Contact: ${booking.contact_name} (${booking.contact_number || 'N/A'})
Transaction: ${booking.transaction_number || 'N/A'}
`,
                        start: startDate,
                        end: endDate,
                        allDay: isAllDay,
                        start_time: cleanTimeFrom,
                        end_time: cleanTimeTo,
                        color,
                        location: [booking.street_address, booking.city, booking.province].filter(Boolean).join(', ') || '',
                        isStrikethrough,
                    };

                    allEvents.push(event);
                } catch (error) {
                    console.error(`Error processing booking ${booking.booking_id}:`, error, booking);
                }
            });
        });

        // Process appointments (unchanged)
        Object.entries(appointmentEvents || {}).forEach(([dateKey, appts]) => {
            ((appts as any[]) || []).forEach((appt: any, index: number) => {
                try {
                    let datePart: string;
                    if (dateKey.includes('T')) {
                        datePart = parseISO(dateKey).toISOString().split('T')[0];
                    } else if (dateKey.includes(' ')) {
                        datePart = dateKey.split(' ')[0];
                    } else {
                        datePart = dateKey;
                    }
                    const timeFrom = appt.appointment_time_from || '00:00';
                    const timeTo = appt.appointment_time_to || '00:00';

                    const cleanTimeFrom = timeFrom.split(':').slice(0, 2).join(':');
                    const cleanTimeTo = timeTo.split(':').slice(0, 2).join(':');

                    const startStr = `${datePart}T${cleanTimeFrom}:00`;
                    const endStr = `${datePart}T${cleanTimeTo}:00`;

                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn(`Invalid date for appointment ${appt.appointment_id} on ${dateKey}: start=${startStr}, end=${endStr}`);
                        return;
                    }

                    const isAllDay = (cleanTimeFrom === '00:00' && cleanTimeTo === '00:00') || (cleanTimeFrom === '07:00' && cleanTimeTo === '22:00');
                    const isStrikethrough = appt.status === 'completed';

                    const event: CalendarEvent = {
                        id: `appointment-${appt.appointment_id}`,
                        title: appt.purpose || 'Unnamed Appointment',
                        description: `Contact: ${appt.contact_name} (${appt.contact_phone || appt.contact_email || 'N/A'})
Status: ${appt.status || 'reserved'}
`,
                        start: startDate,
                        end: endDate,
                        allDay: isAllDay,
                        start_time: cleanTimeFrom,
                        end_time: cleanTimeTo,
                        color: 'sky',
                        location: '',
                        isStrikethrough,
                    };

                    allEvents.push(event);
                } catch (error) {
                    console.error(`Error processing appointment ${appt.appointment_id}:`, error, appt);
                }
            });
        });

        Object.entries(serviceBookings || {}).forEach(([dateKey, services]) => {
            ((services as any[]) || []).forEach((service: any) => {
                try {
                    let datePart: string;
                    if (dateKey.includes('T')) {
                        datePart = parseISO(dateKey).toISOString().split('T')[0];
                    } else if (dateKey.includes(' ')) {
                        datePart = dateKey.split(' ')[0];
                    } else {
                        datePart = dateKey;
                    }
                    const rawStartTime = service.start_time?.toString().trim() || '00:00';
                    const rawEndTime = service.end_time?.toString().trim() || '00:00';
                    const returnDateRaw = service.return_date ? format(parseISO(service.return_date), 'yyyy-MM-dd') : null; // Format for description

                    const startTime = rawStartTime === '' ? '00:00' : rawStartTime;
                    const endTime = rawEndTime === '' ? '00:00' : rawEndTime;

                    const cleanStartTime = startTime.split(':').slice(0, 2).join(':');
                    const cleanEndTime = endTime.split(':').slice(0, 2).join(':');

                    const startStr = `${datePart}T${cleanStartTime}:00`;
                    const endStr = `${datePart}T${cleanEndTime}:00`;

                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn(
                            `Invalid date for service booking ${service.service_booking_id} on ${dateKey}: start=${startStr}, end=${endStr}`,
                        );
                        return;
                    }

                    const hasTimes = !!(cleanStartTime !== '00:00' || cleanEndTime !== '00:00');
                    const isAllDay = !hasTimes || (cleanStartTime === '00:00' && cleanEndTime === '00:00');

                    const color =
                        service.status === 'completed'
                            ? 'emerald'
                            : service.status === 'confirmed'
                              ? 'emerald'
                              : service.status === 'cancelled'
                                ? 'rose'
                                : 'amber';
                    const isStrikethrough = service.status === 'completed';

                    const descriptionParts = [
                        service.description || '',
                        service.comment || '',
                        `Total: $${service.total_amount || 'N/A'}, Paid: $${service.paid_amount || 'N/A'}`,
                    ].filter(Boolean);
                    const description = descriptionParts.length > 0 ? descriptionParts.join('. ') : 'Service booking details.';

                    const event: CalendarEvent = {
                        id: `service-${service.service_booking_id}`,
                        title: service.title || service.service_name || 'Unnamed Service Booking',
                        description: `${service.description || ''}
${service.comment || ''}
Total: ₱${service.total_amount || 'N/A'}
Paid: ₱${service.paid_amount || 'N/A'}`.trim(),
                        start: startDate,
                        end: endDate,
                        allDay: isAllDay,
                        start_time: hasTimes ? cleanStartTime : undefined,
                        end_time: hasTimes ? cleanEndTime : undefined,
                        color: 'violet',
                        location: '',
                        isStrikethrough,
                        ...(service.return_date && { return_date: service.return_date }),
                    };

                    allEvents.push(event);
                } catch (error) {
                    console.error(`Error processing service booking ${service.service_booking_id}:`, error, service);
                }
            });
        });

        Object.entries(blockedDates || {}).forEach(([dateKey, blocks]) => {
            ((blocks as any[]) || []).forEach((blk: any) => {
                try {
                    let datePart: string;
                    if (dateKey.includes('T')) {
                        datePart = parseISO(dateKey).toISOString().split('T')[0];
                    } else if (dateKey.includes(' ')) {
                        datePart = dateKey.split(' ')[0];
                    } else {
                        datePart = dateKey;
                    }

                    const hasTimes = !!(blk.start_time || blk.end_time);
                    let startDate: Date;
                    let endDate: Date;
                    let cleanStartTime: string | undefined;
                    let cleanEndTime: string | undefined;

                    if (hasTimes) {
                        const rawStart = (blk.start_time || '').toString().trim();
                        const rawEnd = (blk.end_time || '23:59').toString().trim();
                        cleanStartTime = rawStart === '' ? '00:00' : rawStart.split(':').slice(0, 2).join(':');
                        cleanEndTime = rawEnd === '' ? '23:59' : rawEnd.split(':').slice(0, 2).join(':');

                        startDate = new Date(`${datePart}T${cleanStartTime}:00`);
                        endDate = new Date(`${datePart}T${cleanEndTime}:00`);
                    } else {
                        startDate = new Date(`${datePart}T00:00:00`);
                        endDate = new Date(`${datePart}T23:59:59`);
                    }

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn(`Invalid blocked date ${blk.date_id} on ${dateKey}: start=${startDate}, end=${endDate}`);
                        return;
                    }

                    const event: CalendarEvent = {
                        id: `blocked-${blk.date_id}`,
                        title: blk.reason || 'Blocked Date',
                        description: blk.reason || '',
                        start: startDate,
                        end: endDate,
                        allDay: !hasTimes, // Strictly boolean
                        start_time: cleanStartTime, // string | undefined
                        end_time: cleanEndTime, // string | undefined
                        color: 'rose',
                        location: '',
                    };

                    allEvents.push(event);
                } catch (error) {
                    console.error(`Error processing blocked date ${blk.date_id}:`, error, blk);
                }
            });
        });

        allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

        return allEvents;
    }, [bookingEvents, appointmentEvents, blockedDates, serviceBookings]);

    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

    const handleEventAdd = (event: CalendarEvent) => {
        setEvents((prev) => [...prev, event]);
    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        const updatedEventWithTimes = {
            ...updatedEvent,
            start_time: format(new Date(updatedEvent.start), 'HH:mm'),
            end_time: format(new Date(updatedEvent.end), 'HH:mm'),
        };
        setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEventWithTimes : event)));

        if (typeof updatedEvent.id === 'string') {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            if (updatedEvent.id.startsWith('booking-')) {
                const bookingId = updatedEvent.id.replace('booking-', '');
                const payload = {
                    event_date: format(new Date(updatedEvent.start), 'yyyy-MM-dd'),
                    event_time_from: format(new Date(updatedEvent.start), 'HH:mm'),
                    event_time_to: format(new Date(updatedEvent.end), 'HH:mm'),
                };

                fetch(`/booking-calendar/${bookingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
                })
                    .then((res) => {
                        if (!res.ok) throw new Error('Failed to update booking');
                        return res.json();
                    })
                    .then((data) => {})
                    .catch((err) => {
                        console.error('Error updating booking', err);
                        // Optionally show a toast or revert change
                    });
            } else if (updatedEvent.id.startsWith('appointment-')) {
                const appointmentId = updatedEvent.id.replace('appointment-', '');
                const payload = {
                    appointment_date: format(new Date(updatedEvent.start), 'yyyy-MM-dd'),
                    appointment_time_from: format(new Date(updatedEvent.start), 'HH:mm'),
                    appointment_time_to: format(new Date(updatedEvent.end), 'HH:mm'),
                };

                fetch(`/update-appointment-calendar/${appointmentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
                })
                    .then((res) => {
                        if (!res.ok) throw new Error('Failed to update appointment');
                        return res.json();
                    })
                    .then((data) => {})
                    .catch((err) => {
                        console.error('Error updating appointment', err);
                    });
            } else if (updatedEvent.id.startsWith('service-')) {
                const serviceBookingId = updatedEvent.id.replace('service-', '');
                const payload = {
                    date: format(new Date(updatedEvent.start), 'yyyy-MM-dd'),
                    start_time: format(new Date(updatedEvent.start), 'HH:mm'),
                    end_time: format(new Date(updatedEvent.end), 'HH:mm'),
                };

                fetch(`/service-booking-calendar/${serviceBookingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
                })
                    .then((res) => {
                        if (!res.ok) throw new Error('Failed to update service booking');
                        return res.json();
                    })
                    .then((data) => {})
                    .catch((err) => {
                        console.error('Error updating service booking', err);
                    });
            } else if (updatedEvent.id.startsWith('blocked-')) {
                const blockedDateId = updatedEvent.id.replace('blocked-', '');
                const payload = {
                    date: format(new Date(updatedEvent.start), 'yyyy-MM-dd'),
                    start_time: format(new Date(updatedEvent.start), 'HH:mm'),
                    end_time: format(new Date(updatedEvent.end), 'HH:mm'),
                };

                fetch(`/blocked-date-calendar/${blockedDateId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
                })
                    .then((res) => {
                        if (!res.ok) throw new Error('Failed to update blocked date');
                        return res.json();
                    })
                    .then((data) => {})
                    .catch((err) => {
                        console.error('Error updating blocked date', err);
                    });
            }
        }
    };

    const handleEventDelete = async (eventId: string) => {
        // Persist delete to server if this is an appointment or booking
        if (typeof eventId === 'string') {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            if (eventId.startsWith('appointment-')) {
                const appointmentId = eventId.replace('appointment-', '');

                try {
                    const res = await fetch(`/update-appointment-calendar/${appointmentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf,
                        },
                    });
                    if (!res.ok) throw new Error('Failed to delete appointment');
                    const data = await res.json();
                    // Remove from local state
                    setEvents(events.filter((event) => event.id !== eventId));
                } catch (err) {
                    console.error('Error deleting appointment', err);
                    throw err; // Re-throw to prevent dialog close
                }
            } else if (eventId.startsWith('booking-')) {
                const bookingId = eventId.replace('booking-', '');

                try {
                    const res = await fetch(`/booking-calendar/${bookingId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf,
                        },
                    });
                    if (!res.ok) throw new Error('Failed to delete booking');
                    const data = await res.json();
                    // Remove from local state
                    setEvents(events.filter((event) => event.id !== eventId));
                } catch (err) {
                    console.error('Error deleting booking', err);
                    throw err; // Re-throw to prevent dialog close
                }
            } else if (eventId.startsWith('service-')) {
                const serviceBookingId = eventId.replace('service-', '');

                try {
                    const res = await fetch(`/service-booking-calendar/${serviceBookingId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf,
                        },
                    });
                    if (!res.ok) throw new Error('Failed to delete service booking');
                    const data = await res.json();
                    // Remove from local state
                    setEvents(events.filter((event) => event.id !== eventId));
                } catch (err) {
                    console.error('Error deleting service booking', err);
                    throw err; // Re-throw to prevent dialog close
                }
            } else if (eventId.startsWith('blocked-')) {
                const blockedDateId = eventId.replace('blocked-', '');

                try {
                    const res = await fetch(`/blocked-dates/destroy/${blockedDateId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf,
                        },
                    });
                    if (!res.ok) throw new Error('Failed to delete blocked date');
                    const data = await res.json();
                    // Remove from local state
                    setEvents(events.filter((event) => event.id !== eventId));
                } catch (err) {
                    console.error('Error deleting blocked date', err);
                    throw err; // Re-throw to prevent dialog close
                }
            } else {
                // For other event types, just remove from local state
                setEvents(events.filter((event) => event.id !== eventId));
            }
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Calendar',
            href: '/event-calendar',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex">
                    <div className="space-y-2">
                        <h6 className="mb-2 font-semibold">Legend</h6>
                        <div className="flex gap-4 space-y-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border border-emerald-300 bg-emerald-100"></div>
                                    <span className="text-sm">Confirmed Events</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border border-amber-300 bg-amber-100"></div>
                                    <span className="text-sm">Pending Events</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border border-sky-300 bg-sky-100"></div>
                                    <span className="text-sm">Appointments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border border-violet-300 bg-violet-100"></div>
                                    <span className="text-sm">Service Bookings</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border border-rose-300 bg-rose-100"></div>
                                    <span className="text-sm">Decline Events</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100"></div>
                                    <span className="text-sm">Block Dates</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <EventCalendar
                    events={events}
                    onEventAdd={handleEventAdd}
                    onEventUpdate={handleEventUpdate}
                    onEventDelete={handleEventDelete}
                    appointmentTimes={appointmentTimes}
                    blockedtimes={blockedtimes}
                />
            </div>
        </AppLayout>
    );
}
