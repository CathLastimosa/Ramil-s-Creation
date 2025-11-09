import { DefaultEndHour, DefaultStartHour, EndHour, StartHour } from '@/components/constants';
import { Button } from '@/components/ui/button-shad';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { RiCalendarLine, RiDeleteBinLine } from '@remixicon/react';
import { format, isBefore } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { CalendarEvent, EventColor } from './types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AppointmentTime {
    from: string;
    to: string;
    status: string;
}

interface BlockedTime {
    from: string;
    to: string;
}

interface PageProps {
    appointmentTimes: Record<string, AppointmentTime[]>;
    blockedtimes: Record<string, BlockedTime[]>;
}

interface EventDialogProps {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    onDelete: (id: string) => void;
    mode?: 'event' | 'blockDate';
    dialogMode?: 'view' | 'edit';
    // When creating a new event, caller can force the form to show booking or appointment fields
    forceSource?: 'booking' | 'appointment';
    appointmentTimes?: Record<string, AppointmentTime[]>;
    blockedtimes?: Record<string, BlockedTime[]>;
}

export function EventDialog({
    event,
    isOpen,
    onClose,
    onSave,
    onDelete,
    mode = 'event',
    dialogMode = 'view',
    forceSource,
    appointmentTimes,
    blockedtimes,
}: EventDialogProps) {
    // Generic field,s (kept for generic events only)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState(`${DefaultStartHour.toString().padStart(2, '0')}:00`);
    const [endTime, setEndTime] = useState(`${DefaultEndHour.toString().padStart(2, '0')}:00`);
    const [allDay, setAllDay] = useState(false);
    const [location, setLocation] = useState('');
    const [color, setColor] = useState<EventColor>('sky');
    const [error, setError] = useState<string | null>(null);

    // Blocked date times
    const [blockStartTime, setBlockStartTime] = useState('00:00');
    const [blockEndTime, setBlockEndTime] = useState('23:59');
    const [blockAllDay, setBlockAllDay] = useState(true);

    // Service booking return date
    const [returnDate, setReturnDate] = useState<Date | undefined>();

    // Booking-specific
    const [eventName, setEventName] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [specialRequest, setSpecialRequest] = useState('');
    const [createdAtStr, setCreatedAtStr] = useState('');

    // Event booking form state
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [relatedServices, setRelatedServices] = useState<any[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('1');
    const [totalAmount, setTotalAmount] = useState('');

    // Contact / appointment fields
    const [contactNameField, setContactNameField] = useState('');
    const [contactNumberField, setContactNumberField] = useState('');
    const [contactEmailField, setContactEmailField] = useState('');
    const [streetAddressField, setStreetAddressField] = useState('');
    const [cityField, setCityField] = useState('');
    const [provinceField, setProvinceField] = useState('');
    const [statusField, setStatusField] = useState('');
    const [purposeField, setPurposeField] = useState('');

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setDescription(event.description || '');
            setStartDate(new Date(event.start));
            setEndDate(new Date(event.end));
            setAllDay(event.allDay || false);
            setLocation(event.location || '');
            setColor((event.color as EventColor) || 'sky');

            // Clear booking/appointment fields
            setEventName('');
            setGuestCount('');
            setSpecialRequest('');
            setCreatedAtStr('');
            setContactNameField('');
            setContactNumberField('');
            setContactEmailField('');
            setStreetAddressField('');
            setCityField('');
            setProvinceField('');
            setStatusField('');
            setPurposeField('');

            // Populate based on id prefix
            if (typeof event.id === 'string' && event.id.startsWith('booking-')) {
                const anyE = event as any;
                setEventName(anyE.event_name || event.title || '');
                setGuestCount(anyE.guest_count ? String(anyE.guest_count) : '');
                setSpecialRequest(anyE.special_request || '');
                setCreatedAtStr(anyE.created_at ? format(new Date(anyE.created_at), 'PPP p') : '');
                setContactNameField(anyE.contact_name || '');
                setContactNumberField(anyE.contact_number || anyE.contact_phone || '');
                setContactEmailField(anyE.contact_email || '');
                setStreetAddressField(anyE.street_address || '');
                setCityField(anyE.city || '');
                setProvinceField(anyE.province || '');
                setStatusField(anyE.status || '');
            } else if (typeof event.id === 'string' && event.id.startsWith('appointment-')) {
                const anyE = event as any;
                setContactNameField(anyE.contact_name || '');
                setContactNumberField(anyE.contact_phone || anyE.contact_number || '');
                setContactEmailField(anyE.contact_email || '');
                setPurposeField(anyE.purpose || '');
                setStatusField(anyE.status || '');
            }

            setError(null);
            // If viewing an existing blocked date, try to populate times
            if (typeof event.id === 'string' && event.id.startsWith('blocked-')) {
                const anyE = event as any;
                if (anyE.start_time) setBlockStartTime(anyE.start_time);
                if (anyE.end_time) setBlockEndTime(anyE.end_time);
                // if no times are present, consider it all-day
                if (!anyE.start_time && !anyE.end_time) setBlockAllDay(true);
                else setBlockAllDay(false);
            }
        } else {
            // reset
            setTitle('');
            setDescription('');
            setStartDate(new Date());
            setEndDate(new Date());
            setStartTime(`${DefaultStartHour.toString().padStart(2, '0')}:00`);
            setEndTime(`${DefaultEndHour.toString().padStart(2, '0')}:00`);
            setAllDay(false);
            setLocation('');
            setColor('sky');
            setEventName('');
            setGuestCount('');
            setSpecialRequest('');
            setCreatedAtStr('');
            setContactNameField('');
            setContactNumberField('');
            setContactEmailField('');
            setStreetAddressField('');
            setCityField('');
            setProvinceField('');
            setStatusField('');
            setPurposeField('');
            setPackages([]);
            setSelectedPackage(null);
            setRelatedServices([]);
            setSelectedServices([]);
            setPaymentMethod('1');
            setTotalAmount('');
            setError(null);
            setEventBookingData('package_id', null);
            setEventBookingData('selected_services', []);
            setBlockStartTime('00:00');
            setBlockEndTime('23:59');
            setBlockAllDay(true);
            resetBlockDate();
            resetEventBooking();
        }
    }, [event]);

    const formatTimeForInput = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = Math.floor(date.getMinutes() / 15) * 15;
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // keep start/end time inputs in sync when event changes
        if (event) {
            setStartTime(formatTimeForInput(new Date(event.start)));
            setEndTime(formatTimeForInput(new Date(event.end)));
        }
    }, [event]);

    const timeOptions = useMemo(() => {
        const options: Array<{ value: string; label: string }> = [];
        for (let hour = StartHour; hour <= EndHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                const value = `${formattedHour}:${formattedMinute}`;
                const date = new Date(2000, 0, 1, hour, minute);
                const label = format(date, 'h:mm a');
                options.push({ value, label });
            }
        }
        return options;
    }, []);

    const format12Hour = (time: string | null | undefined) => {
        if (!time) return '-';
        const [h, m] = time.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
    };

    // Determine form source: prefer explicit forceSource (used when creating a new event),
    // otherwise infer from event id prefix when editing existing events
    const inferredSource =
        typeof event?.id === 'string' && event.id.startsWith('booking-')
            ? 'booking'
            : typeof event?.id === 'string' && event.id.startsWith('appointment-')
              ? 'appointment'
              : null;

    const source = (forceSource as any) || inferredSource;

    const handleSave = () => {
        let start = new Date(startDate);
        let end = new Date(endDate);

        if (mode === 'blockDate') {
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
        } else {
            if (!allDay) {
                const [sH = 0, sM = 0] = startTime.split(':').map(Number);
                const [eH = 0, eM = 0] = endTime.split(':').map(Number);
                if (sH < StartHour || sH > EndHour || eH < StartHour || eH > EndHour) {
                    setError(`Selected time must be between ${StartHour}:00 and ${EndHour}:00`);
                    return;
                }
                start.setHours(sH, sM, 0, 0);
                end.setHours(eH, eM, 0, 0);
            } else {
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
            }
        }

        if (isBefore(end, start)) {
            setError('End date cannot be before start date');
            return;
        }

        const payload: any = {
            id: event?.id || '',
            title: eventName || title || '(no title)',
            description,
            start,
            end,
            allDay,
            location,
            color,
        };

        // Attach booking fields when source is booking or creating booking
        if (source === 'booking' || (event && (event as any).event_name)) {
            payload.event_name = eventBookingData.event_name || eventName || payload.title;
            payload.event_date = eventBookingData.event_date || format(start, 'yyyy-MM-dd');
            payload.event_time_from = eventBookingData.event_time_from || format(start, 'HH:mm');
            payload.event_time_to = eventBookingData.event_time_to || format(end, 'HH:mm');
            payload.guest_count = eventBookingData.guest_count ? Number(eventBookingData.guest_count) : guestCount ? Number(guestCount) : undefined;
            payload.special_request = eventBookingData.special_request || specialRequest;
            payload.contact_name = eventBookingData.contact_name || contactNameField;
            payload.contact_number = eventBookingData.contact_number || contactNumberField;
            payload.contact_email = eventBookingData.contact_email || contactEmailField;
            payload.street_address = eventBookingData.street_address || streetAddressField;
            payload.city = eventBookingData.city || cityField;
            payload.province = eventBookingData.province || provinceField;
            payload.total_amount = eventBookingData.total_amount || totalAmount;
            payload.payment_method = eventBookingData.payment_method || paymentMethod;
            payload.status = statusField;
        }

        // Attach appointment fields when source is appointment
        if (source === 'appointment' || (event && (event as any).purpose)) {
            payload.appointment_date = format(start, 'yyyy-MM-dd');
            payload.appointment_time_from = format(start, 'HH:mm');
            payload.appointment_time_to = format(end, 'HH:mm');
            payload.contact_name = contactNameField;
            payload.contact_phone = contactNumberField;
            payload.contact_email = contactEmailField;
            payload.purpose = purposeField;
            payload.status = statusField;
        }

        // Block date payload
        if (mode === 'blockDate') {
            payload.date = blockDateData.date || format(start, 'yyyy-MM-dd');
            payload.reason = blockDateData.reason?.trim() || 'Unavailable';

            if (blockAllDay) {
                // For a full-day block, set all-day times
                payload.start_time = '00:00';
                payload.end_time = '23:59';
            } else {
                // Use the selected start and end times
                payload.start_time = blockDateData.start_time || blockStartTime || null;
                payload.end_time = blockDateData.end_time || blockEndTime || null;
            }
        }

        onSave(payload);
    };

    const handleDelete = async () => {
        if (!event?.id) return;
        try {
            await onDelete(event.id);
        } catch (err) {
            console.error('Delete failed, keeping dialog open', err);
            return; // Don't close dialog on error
        }
    };

    const colorOptions: Array<{
        value: EventColor;
        label: string;
        bgClass: string;
        borderClass: string;
    }> = [
        { value: 'sky', label: 'Sky', bgClass: 'bg-sky-400', borderClass: 'border-sky-400' },
        { value: 'amber', label: 'Amber', bgClass: 'bg-amber-400', borderClass: 'border-amber-400' },
        { value: 'violet', label: 'Violet', bgClass: 'bg-violet-400', borderClass: 'border-violet-400' },
        { value: 'rose', label: 'Rose', bgClass: 'bg-rose-400', borderClass: 'border-rose-400' },
        { value: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-400', borderClass: 'border-emerald-400' },
        { value: 'orange', label: 'Orange', bgClass: 'bg-orange-400', borderClass: 'border-orange-400' },
    ];

    const {
        data: serviceBookingData,
        setData: setServiceBookingData,
        post: postServiceBookingData,
        processing: processingServiceBookingData,
        errors: errorsServiceBookingData,
        reset: resetServiceBookingData,
    } = useForm({
        title: '',
        service_name: '',
        description: '',
        comment: '',
        contact_name: '',
        contact_number: '',
        contact_email: '',
        date: '',
        return_date: '',
        start_time: '',
        end_time: '',
        total_amount: '',
        paid_amount: '',
        status: 'confirmed',
    });

    const {
        data: appointmentData,
        setData: setAppointmentData,
        post: postAppointmentData,
        processing: processingAppointment,
        errors: errorsAppointment,
        reset: resetAppointment,
    } = useForm({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        purpose: '',
        appointment_date: '',
        appointment_time_from: '',
        appointment_time_to: '',
        status: 'reserved',
    });

    const {
        data: blockDateData,
        setData: setBlockDateData,
        post: postBlockDateData,
        processing: processingBlockDate,
        errors: errorsBlockDate,
        reset: resetBlockDate,
    } = useForm({
        date: '',
        reason: '',
        start_time: '',
        end_time: '',
    });

    const {
        data: eventBookingData,
        setData: setEventBookingData,
        put: putEventBookingData,
        processing: processingEventBooking,
        errors: errorsEventBooking,
        reset: resetEventBooking,
    } = useForm<{
        package_id: string | null;
        selected_services: string[];
        event_name: string;
        event_date: string;
        event_time_from: string;
        event_time_to: string;
        guest_count: string;
        special_request: string;
        contact_name: string;
        contact_email: string;
        contact_number: string;
        street_address: string;
        city: string;
        province: string;
        total_amount: string;
        payment_method: string;
    }>({
        package_id: null,
        selected_services: [],
        event_name: '',
        event_date: '',
        event_time_from: '',
        event_time_to: '',
        guest_count: '',
        special_request: '',
        contact_name: '',
        contact_email: '',
        contact_number: '',
        street_address: '',
        city: '',
        province: '',
        total_amount: '',
        payment_method: '1',
    });

    useEffect(() => {
        if (startDate) {
            setServiceBookingData('date', format(startDate, 'yyyy-MM-dd'));
        }
    }, [startDate]);

    useEffect(() => {
        if (returnDate) {
            setServiceBookingData('return_date', format(returnDate, 'yyyy-MM-dd'));
        }
    }, [returnDate]);

    // Initialize appointment date when creating new appointment
    useEffect(() => {
        if (isOpen && mode === 'event' && dialogMode === 'edit' && source === 'appointment' && startDate) {
            setAppointmentData('appointment_date', format(startDate, 'yyyy-MM-dd'));
        }
    }, [isOpen, mode, dialogMode, source, startDate]);

    // Initialize block date when creating new block date
    useEffect(() => {
        if (isOpen && mode === 'blockDate' && dialogMode === 'edit' && startDate) {
            setBlockDateData('date', format(startDate, 'yyyy-MM-dd'));
        }
    }, [isOpen, mode, dialogMode, startDate]);

    // Initialize event booking date when creating new event booking
    useEffect(() => {
        if (isOpen && mode === 'event' && dialogMode === 'edit' && source === 'event_booking' && startDate) {
            setEventBookingData('event_date', format(startDate, 'yyyy-MM-dd'));
            setEventBookingData('event_time_from', startTime);
            setEventBookingData('event_time_to', endTime);
        }
    }, [isOpen, mode, dialogMode, source, startDate, startTime, endTime]);

    // Fetch packages when dialog opens for event_booking
    useEffect(() => {
        if (isOpen && source === 'event_booking') {
            fetch('/booking-calendar/packages')
                .then((res) => res.json())
                .then((data) => setPackages(data))
                .catch((err) => console.error('Failed to fetch packages', err));
        }
    }, [isOpen, source]);

    // Fetch services when package is selected
    useEffect(() => {
        if (selectedPackage) {
            fetch(`/booking-calendar/packages/${selectedPackage}/services`)
                .then((res) => res.json())
                .then((data) => {
                    setRelatedServices(data);
                    setSelectedServices(data.map((s: any) => s.services_id));
                    setEventBookingData(
                        'selected_services',
                        data.map((s: any) => s.services_id),
                    );
                })
                .catch((err) => console.error('Failed to fetch services', err));
        } else {
            setRelatedServices([]);
            setSelectedServices([]);
            setEventBookingData('selected_services', []);
        }
    }, [selectedPackage]);

    const handleSubmitServiceBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        await postServiceBookingData('/service-booking-calendar/store', {
            onSuccess: (data: any) => {
                // Server may not return the created resource; fall back to form values
                // and generate an id so the UI can optimistically render the event.
                const svcId = (data && data.service_booking_id) || Math.random().toString(36).substring(2, 11);

                const svcDate = (data && data.date) || serviceBookingData.date || format(startDate, 'yyyy-MM-dd');
                const svcStart = (data && data.start_time) || serviceBookingData.start_time || '';
                const svcEnd = (data && data.end_time) || serviceBookingData.end_time || '';

                const startStr = svcStart ? `${svcDate}T${svcStart}:00` : `${svcDate}T00:00:00`;
                const endStr = svcEnd ? `${svcDate}T${svcEnd}:00` : `${svcDate}T23:59:59`;

                const startVal = new Date(startStr);
                const endVal = new Date(endStr);

                const newEvent: CalendarEvent = {
                    // Use `service-` prefix to match page-side rendering/updating logic
                    id: `service-${svcId}`,
                    title:
                        (data && (data.title || data.service_name)) ||
                        serviceBookingData.title ||
                        serviceBookingData.service_name ||
                        'Service Booking',
                    description: (data && data.description) || serviceBookingData.description || '',
                    start: startVal,
                    end: endVal,
                    allDay: !svcStart && !svcEnd,
                    color: 'violet',
                };

                // Dispatch custom event to parent
                window.dispatchEvent(new CustomEvent('serviceBookingAdded', { detail: newEvent }));

                resetServiceBookingData();
                onClose();

                // Show success toast using sonner
                import('sonner').then(({ toast }) => {
                    toast(`Service booking "${newEvent.title}" added`, {
                        description: format(new Date(newEvent.start), 'MMM d, yyyy'),
                        position: 'top-center',
                    });
                });
            },
        });
    };

    const handleSubmitAppointment = async (e: React.FormEvent) => {
        e.preventDefault();

        await postAppointmentData('/appointment-calendar/store', {
            onSuccess: (data: any) => {
                const appointmentId = (data && data.appointment_id) || Math.random().toString(36).substring(2, 11);

                const appointmentDate = (data && data.appointment_date) || appointmentData.appointment_date || format(startDate, 'yyyy-MM-dd');
                const appointmentFrom = (data && data.appointment_time_from) || appointmentData.appointment_time_from || '';
                const appointmentTo = (data && data.appointment_time_to) || appointmentData.appointment_time_to || '';

                const startStr = appointmentFrom ? `${appointmentDate}T${appointmentFrom}:00` : `${appointmentDate}T00:00:00`;
                const endStr = appointmentTo ? `${appointmentDate}T${appointmentTo}:00` : `${appointmentDate}T23:59:59`;

                const startDateObj = new Date(startStr);
                const endDateObj = new Date(endStr);

                const newEvent: CalendarEvent = {
                    id: `appointment-${appointmentId}`,
                    title: (data && data.purpose) || appointmentData.purpose || 'Appointment',
                    description: `Contact: ${(data && data.contact_name) || appointmentData.contact_name || ''} (${(data && data.contact_email) || appointmentData.contact_email || ''})`,
                    start: startDateObj,
                    end: endDateObj,
                    allDay: !appointmentFrom && !appointmentTo,
                    color: 'sky',
                };

                // Dispatch custom event to parent so page-level listeners can add it
                window.dispatchEvent(new CustomEvent('appointmentAdded', { detail: newEvent }));

                resetAppointment();
                onClose();

                // Show success toast using sonner
                import('sonner').then(({ toast }) => {
                    toast(`Appointment "${newEvent.title}" added`, {
                        description: format(new Date(newEvent.start), 'MMM d, yyyy'),
                        position: 'top-center',
                    });
                });
            },
        });
    };

    const handleSubmitEventBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await putEventBookingData('/booking-calendar/store', {
                onSuccess: (data: any) => {
                    const newEvent: CalendarEvent = {
                        id: `booking-${data.booking_id}`,
                        title: eventBookingData.event_name,
                        description: `Guest: ${eventBookingData.guest_count || 0}, Contact: ${eventBookingData.contact_name}`,
                        start: new Date(`${eventBookingData.event_date}T${eventBookingData.event_time_from}:00`),
                        end: new Date(`${eventBookingData.event_date}T${eventBookingData.event_time_to}:00`),
                        allDay: false,
                        color: 'amber',
                    };

                    window.dispatchEvent(new CustomEvent('bookingAdded', { detail: newEvent }));

                    // Reset form
                    setEventName('');
                    setGuestCount('');
                    setSpecialRequest('');
                    setContactNameField('');
                    setContactNumberField('');
                    setContactEmailField('');
                    setStreetAddressField('');
                    setCityField('');
                    setProvinceField('');
                    setSelectedPackage(null);
                    setRelatedServices([]);
                    setSelectedServices([]);
                    setPaymentMethod('1');
                    resetEventBooking();
                    setEventBookingData('package_id', null);
                    setEventBookingData('selected_services', []);

                    onClose();

                    // Show success toast using sonner
                    import('sonner').then(({ toast }) => {
                        toast(`Event booking "${eventBookingData.event_name}" added`, {
                            description: format(new Date(newEvent.start), 'MMM d, yyyy'),
                            position: 'top-center',
                        });
                    });
                },
            });
        } catch (err) {
            console.error('Error creating event booking', err);
        }
    };

    // Render blockDate dialog
    if (mode === 'blockDate') {
        // If editing an existing blocked date, show a view-only dialog (delete-only)
        if (event?.id) {
            return (
                <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{event.description || '-'}</DialogTitle>
                            <DialogDescription>Details for the blocked date (delete to unblock).</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div>
                                <Label>Date</Label>
                                <div className="mt-2">{format(new Date(event.start), 'PPP')}</div>
                            </div>

                            <div>
                                <Label>Time</Label>
                                <div className="mt-1 whitespace-pre-wrap">
                                    {(event as any).start_time === '00:00' && (event as any).end_time === '23:59'
                                        ? 'All day'
                                        : `${format12Hour((event as any).start_time)} - ${format12Hour((event as any).end_time)}`}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex-row sm:justify-between">
                            <Button variant="destructive" size="icon" onClick={handleDelete} aria-label="Delete blocked date">
                                <RiDeleteBinLine size={16} aria-hidden="true" />
                            </Button>

                            <div className="flex flex-1 justify-end gap-2">
                                <Button variant="secondary" onClick={onClose}>
                                    Close
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        }

        // Otherwise this is a new blocked date being created
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Block Date</DialogTitle>
                        <DialogDescription>Select a date to block and provide a reason.</DialogDescription>
                    </DialogHeader>

                    {error && <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</div>}

                    <div className="grid gap-4 py-4">
                        <div>
                            <Label>Date</Label>
                            <div className="mt-2 flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            <span>{format(startDate, 'PPP')}</span>
                                            <RiCalendarLine size={16} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            defaultMonth={startDate}
                                            onSelect={(d) => d && setStartDate(d)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {errorsBlockDate.date && <p className="text-sm text-red-500">{errorsBlockDate.date}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Time (optional)</Label>
                                <Input
                                    type="time"
                                    value={blockDateData.start_time || blockStartTime}
                                    onChange={(e) => {
                                        setBlockDateData('start_time', e.target.value);
                                        setBlockStartTime(e.target.value);
                                    }}
                                    disabled={blockAllDay}
                                />
                                {errorsBlockDate.start_time && <p className="text-sm text-red-500">{errorsBlockDate.start_time}</p>}
                            </div>
                            <div>
                                <Label>End Time (optional)</Label>
                                <Input
                                    type="time"
                                    value={blockDateData.end_time || blockEndTime}
                                    onChange={(e) => {
                                        setBlockDateData('end_time', e.target.value);
                                        setBlockEndTime(e.target.value);
                                    }}
                                    disabled={blockAllDay}
                                />
                                {errorsBlockDate.end_time && <p className="text-sm text-red-500">{errorsBlockDate.end_time}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox checked={blockAllDay} onCheckedChange={(c) => setBlockAllDay(Boolean(c))} />
                            <Label>All day</Label>
                        </div>

                        <div>
                            <Label>Reason</Label>
                            <Textarea
                                value={blockDateData.reason || description}
                                onChange={(e) => {
                                    setBlockDateData('reason', e.target.value);
                                    setDescription(e.target.value);
                                }}
                                rows={3}
                            />
                            {errorsBlockDate.reason && <p className="text-sm text-red-500">{errorsBlockDate.reason}</p>}
                        </div>
                    </div>

                    <DialogFooter className="flex-row sm:justify-between">
                        <div className="flex flex-1 justify-end gap-2">
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="brand" onClick={handleSave} disabled={processingBlockDate}>
                                {processingBlockDate && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Always show view mode for existing events, edit for new events
    if (dialogMode === 'view' || event?.id) {
        // If this is a blocked date, render a simplified read-only dialog showing date, optional times, and reason
        if (event && typeof event.id === 'string' && event.id.startsWith('blocked-')) {
            return (
                <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>View Blocked Date</DialogTitle>
                            <DialogDescription>Details for the blocked date (delete to unblock).</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div>
                                <Label>Date</Label>
                                <div className="mt-2">{format(new Date(event.start), 'PPP')}</div>
                            </div>

                            <div>
                                <Label>Time</Label>
                                <div className="mt-1">
                                    {format12Hour((event as any).start_time) || '-'} {' - '} {format12Hour((event as any).end_time) || '-'}
                                </div>
                            </div>

                            <div>
                                <Label>Reason</Label>
                                <div className="mt-1 whitespace-pre-wrap">{event.description || '-'}</div>
                            </div>
                        </div>

                        <DialogFooter className="flex-row sm:justify-between">
                            <Button variant="destructive" size="icon" onClick={handleDelete} aria-label="Delete blocked date">
                                <RiDeleteBinLine size={16} aria-hidden="true" />
                            </Button>

                            <div className="flex flex-1 justify-end gap-2">
                                <Button variant="secondary" onClick={onClose}>
                                    Close
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        }

        // Otherwise normal event view
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{event?.title ?? '(no title)'}</DialogTitle>
                        <DialogDescription className="sr-only">View event details</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {event?.description && (
                            <div>
                                <Label>Description</Label>
                                <div className="whitespace-pre-wrap text-muted-foreground">{event.description}</div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label>Start</Label>
                                <div>{event ? format(new Date(event.start), 'PPP p') : '-'}</div>
                            </div>
                            <div className="flex-1">
                                <Label>End</Label>
                                <div>{event ? format(new Date(event.end), 'PPP p') : '-'}</div>
                            </div>
                        </div>

                        {event?.location && (
                            <div>
                                <Label>Location</Label>
                                <div>{event.location}</div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex-row sm:justify-between">
                        <div className="flex gap-2">
                            <Button variant="destructive" size="icon" onClick={handleDelete} aria-label="Delete event">
                                <RiDeleteBinLine size={16} />
                            </Button>
                        </div>

                        <div className="flex flex-1 justify-end gap-2">
                            <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Edit mode: show only booking fields or appointment fields if applicable, otherwise show generic fields
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>
                        {source === 'event_booking'
                            ? 'Create Event Booking'
                            : source === 'appointment'
                              ? 'Create Appointment'
                              : 'Create Service Booking'}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new{' '}
                        {source === 'event_booking' ? 'event booking' : source === 'appointment' ? 'appointment' : 'service booking'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    {source === 'event_booking' ? (
                        <form onSubmit={handleSubmitEventBooking} className="space-y-4">
                            {/* Package Selection */}
                            <div>
                                <Label htmlFor="package">Select Package</Label>
                                <select
                                    id="package"
                                    value={eventBookingData.package_id || selectedPackage || ''}
                                    onChange={(e) => {
                                        setEventBookingData('package_id', e.target.value);
                                        setSelectedPackage(e.target.value);
                                    }}
                                    className="mt-1 w-full rounded-md border p-2"
                                >
                                    <option value="">Select a package</option>
                                    {packages.map((pkg: any) => (
                                        <option key={pkg.package_id} value={pkg.package_id}>
                                            {pkg.package_name} - ₱{pkg.discounted_price || pkg.package_price}
                                        </option>
                                    ))}
                                </select>
                                {errorsEventBooking.package_id && <p className="text-sm text-red-500">{errorsEventBooking.package_id}</p>}
                            </div>

                            {/* Related Services */}
                            {selectedPackage && relatedServices.length > 0 && (
                                <div>
                                    <Label>Related Services</Label>
                                    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {relatedServices.map((service: any) => (
                                            <div key={service.services_id} className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={eventBookingData.selected_services.includes(service.services_id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setEventBookingData('selected_services', [
                                                                ...eventBookingData.selected_services,
                                                                service.services_id,
                                                            ]);
                                                            setSelectedServices((prev) => [...prev, service.services_id]);
                                                        } else {
                                                            setEventBookingData(
                                                                'selected_services',
                                                                eventBookingData.selected_services.filter((id: string) => id !== service.services_id),
                                                            );
                                                            setSelectedServices((prev) => prev.filter((id) => id !== service.services_id));
                                                        }
                                                    }}
                                                />
                                                <Label>{service.service_name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errorsEventBooking.selected_services && (
                                        <p className="text-sm text-red-500">{errorsEventBooking.selected_services}</p>
                                    )}
                                </div>
                            )}

                            {/* Event Name */}
                            <div>
                                <Label htmlFor="event_name">Event Name</Label>
                                <Input
                                    id="event_name"
                                    name="event_name"
                                    value={eventBookingData.event_name || eventName}
                                    onChange={(e) => {
                                        setEventBookingData('event_name', e.target.value);
                                        setEventName(e.target.value);
                                    }}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter event name"
                                />
                                {errorsEventBooking.event_name && <p className="text-sm text-red-500">{errorsEventBooking.event_name}</p>}
                            </div>

                            {/* Event Date */}
                            <div>
                                <Label>Event Date</Label>
                                <div className="mt-2 flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                <span>{startDate ? format(startDate, 'PPP') : 'Select a date'}</span>
                                                <RiCalendarLine size={16} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                defaultMonth={startDate}
                                                onSelect={(d) => d && setStartDate(d)}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {errorsEventBooking.event_date && <p className="text-sm text-red-500">{errorsEventBooking.event_date}</p>}
                            </div>

                            {/* Event Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="event_time_from">Start Time</Label>
                                    <Input
                                        type="time"
                                        id="event_time_from"
                                        name="event_time_from"
                                        value={eventBookingData.event_time_from || startTime}
                                        onChange={(e) => {
                                            setEventBookingData('event_time_from', e.target.value);
                                            setStartTime(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                    {errorsEventBooking.event_time_from && (
                                        <p className="text-sm text-red-500">{errorsEventBooking.event_time_from}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="event_time_to">End Time</Label>
                                    <Input
                                        type="time"
                                        id="event_time_to"
                                        name="event_time_to"
                                        value={eventBookingData.event_time_to || endTime}
                                        onChange={(e) => {
                                            setEventBookingData('event_time_to', e.target.value);
                                            setEndTime(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                    {errorsEventBooking.event_time_to && <p className="text-sm text-red-500">{errorsEventBooking.event_time_to}</p>}
                                </div>
                            </div>

                            {/* Guest Count */}
                            <div>
                                <Label htmlFor="guest_count">Number of Guests</Label>
                                <Input
                                    type="number"
                                    id="guest_count"
                                    name="guest_count"
                                    value={eventBookingData.guest_count || guestCount}
                                    onChange={(e) => {
                                        setEventBookingData('guest_count', e.target.value);
                                        setGuestCount(e.target.value);
                                    }}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter number of guests"
                                />
                                {errorsEventBooking.guest_count && <p className="text-sm text-red-500">{errorsEventBooking.guest_count}</p>}
                            </div>

                            {/* Special Request */}
                            <div>
                                <Label htmlFor="special_request">Special Request</Label>
                                <Textarea
                                    id="special_request"
                                    name="special_request"
                                    value={eventBookingData.special_request || specialRequest}
                                    onChange={(e) => {
                                        setEventBookingData('special_request', e.target.value);
                                        setSpecialRequest(e.target.value);
                                    }}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Add any special requests..."
                                />
                                {errorsEventBooking.special_request && <p className="text-sm text-red-500">{errorsEventBooking.special_request}</p>}
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="contact_name">Contact Name</Label>
                                    <Input
                                        id="contact_name"
                                        name="contact_name"
                                        value={eventBookingData.contact_name || contactNameField}
                                        onChange={(e) => {
                                            setEventBookingData('contact_name', e.target.value);
                                            setContactNameField(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="Enter contact name"
                                    />
                                    {errorsEventBooking.contact_name && <p className="text-sm text-red-500">{errorsEventBooking.contact_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="contact_email">Contact Email</Label>
                                    <Input
                                        type="email"
                                        id="contact_email"
                                        name="contact_email"
                                        value={eventBookingData.contact_email || contactEmailField}
                                        onChange={(e) => {
                                            setEventBookingData('contact_email', e.target.value);
                                            setContactEmailField(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="Enter contact email"
                                    />
                                    {errorsEventBooking.contact_email && <p className="text-sm text-red-500">{errorsEventBooking.contact_email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        name="contact_number"
                                        value={eventBookingData.contact_number || contactNumberField}
                                        onChange={(e) => {
                                            setEventBookingData('contact_number', e.target.value);
                                            setContactNumberField(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="Enter contact number"
                                    />
                                    {errorsEventBooking.contact_number && <p className="text-sm text-red-500">{errorsEventBooking.contact_number}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="street_address">Street Address</Label>
                                    <Input
                                        id="street_address"
                                        name="street_address"
                                        value={eventBookingData.street_address || streetAddressField}
                                        onChange={(e) => {
                                            setEventBookingData('street_address', e.target.value);
                                            setStreetAddressField(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="Enter street address"
                                    />
                                    {errorsEventBooking.street_address && <p className="text-sm text-red-500">{errorsEventBooking.street_address}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={eventBookingData.city || cityField}
                                        onChange={(e) => {
                                            setEventBookingData('city', e.target.value);
                                            setCityField(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="Enter city"
                                    />
                                    {errorsEventBooking.city && <p className="text-sm text-red-500">{errorsEventBooking.city}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        name="province"
                                        value={eventBookingData.province || provinceField}
                                        onChange={(e) => {
                                            setEventBookingData('province', e.target.value);
                                            setProvinceField(e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="Enter province"
                                    />
                                    {errorsEventBooking.province && <p className="text-sm text-red-500">{errorsEventBooking.province}</p>}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <Label>Payment Method</Label>
                                <RadioGroup
                                    value={eventBookingData.payment_method || paymentMethod}
                                    onValueChange={(value) => {
                                        setEventBookingData('payment_method', value);
                                        setPaymentMethod(value);
                                    }}
                                    className="mt-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="1" id="cash" />
                                        <Label htmlFor="cash">Cash on Hand</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="2" id="gcash" />
                                        <Label htmlFor="gcash">GCash</Label>
                                    </div>
                                </RadioGroup>
                                {errorsEventBooking.payment_method && <p className="text-sm text-red-500">{errorsEventBooking.payment_method}</p>}
                            </div>

                            {/* Total Amount */}
                            <div>
                                <Label htmlFor="total_amount">Total Amount (₱)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    id="total_amount"
                                    name="total_amount"
                                    value={eventBookingData.total_amount || totalAmount}
                                    onChange={(e) => {
                                        setEventBookingData('total_amount', e.target.value);
                                        setTotalAmount(e.target.value);
                                    }}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter total amount"
                                />
                                {errorsEventBooking.total_amount && <p className="text-sm text-red-500">{errorsEventBooking.total_amount}</p>}
                            </div>

                            <DialogFooter className="flex-row sm:justify-between">
                                <div className="flex flex-1 justify-end gap-2">
                                    <Button variant="secondary" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processingEventBooking}>
                                        {processingEventBooking && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    ) : source === 'appointment' ? (
                        <form onSubmit={handleSubmitAppointment} className="space-y-4">
                            {/* Contact Name */}
                            <div>
                                <Label htmlFor="contact_name">Contact Name</Label>
                                <Input
                                    id="contact_name"
                                    name="contact_name"
                                    value={appointmentData.contact_name}
                                    onChange={(e) => setAppointmentData('contact_name', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter contact name"
                                />
                                {errorsAppointment.contact_name && <p className="text-sm text-red-500">{errorsAppointment.contact_name}</p>}
                            </div>

                            {/* Contact Email */}
                            <div>
                                <Label htmlFor="contact_email">Contact Email</Label>
                                <Input
                                    type="email"
                                    id="contact_email"
                                    name="contact_email"
                                    value={appointmentData.contact_email}
                                    onChange={(e) => setAppointmentData('contact_email', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter contact email"
                                />
                                {errorsAppointment.contact_email && <p className="text-sm text-red-500">{errorsAppointment.contact_email}</p>}
                            </div>

                            {/* Contact Phone */}
                            <div>
                                <Label htmlFor="contact_phone">Contact Phone</Label>
                                <Input
                                    id="contact_phone"
                                    name="contact_phone"
                                    value={appointmentData.contact_phone}
                                    onChange={(e) => setAppointmentData('contact_phone', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter contact phone"
                                />
                                {errorsAppointment.contact_phone && <p className="text-sm text-red-500">{errorsAppointment.contact_phone}</p>}
                            </div>

                            {/* Purpose */}
                            <div>
                                <Label htmlFor="purpose">Purpose</Label>
                                <Textarea
                                    id="purpose"
                                    name="purpose"
                                    value={appointmentData.purpose}
                                    onChange={(e) => setAppointmentData('purpose', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter appointment purpose"
                                    rows={3}
                                />
                                {errorsAppointment.purpose && <p className="text-sm text-red-500">{errorsAppointment.purpose}</p>}
                            </div>

                            {/* Appointment Date */}
                            <div>
                                <Label htmlFor="appointment_date">Appointment Date</Label>
                                <div className="mt-2 flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                <span>{startDate ? format(startDate, 'PPP') : 'Select a date'}</span>
                                                <RiCalendarLine size={16} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                defaultMonth={startDate}
                                                onSelect={(d) => d && setStartDate(d)}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {errorsAppointment.appointment_date && <p className="text-sm text-red-500">{errorsAppointment.appointment_date}</p>}
                            </div>

                            {/* Time Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="appointment_time_from">Start Time</Label>
                                    <Input
                                        type="time"
                                        id="appointment_time_from"
                                        name="appointment_time_from"
                                        value={appointmentData.appointment_time_from}
                                        onChange={(e) => setAppointmentData('appointment_time_from', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                    {errorsAppointment.appointment_time_from && (
                                        <p className="text-sm text-red-500">{errorsAppointment.appointment_time_from}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="appointment_time_to">End Time</Label>
                                    <Input
                                        type="time"
                                        id="appointment_time_to"
                                        name="appointment_time_to"
                                        value={appointmentData.appointment_time_to}
                                        onChange={(e) => setAppointmentData('appointment_time_to', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                    {errorsAppointment.appointment_time_to && (
                                        <p className="text-sm text-red-500">{errorsAppointment.appointment_time_to}</p>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex-row sm:justify-between">
                                <div className="flex flex-1 justify-end gap-2">
                                    <Button variant="secondary" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processingAppointment}>
                                        {processingAppointment && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitServiceBooking} className="space-y-4">
                            {/* Title */}
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={serviceBookingData.title}
                                    onChange={(e) => setServiceBookingData('title', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter title"
                                />
                                {errorsServiceBookingData.title && <p className="text-sm text-red-500">{errorsServiceBookingData.title}</p>}
                            </div>

                            {/* Service Name */}
                            <div>
                                <Label htmlFor="service_name" className="block font-medium">
                                    Service Name
                                </Label>
                                <Input
                                    id="service_name"
                                    name="service_name"
                                    value={serviceBookingData.service_name}
                                    onChange={(e) => setServiceBookingData('service_name', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="e.g., Catering, Makeup, Gown Rental"
                                />
                                {errorsServiceBookingData.service_name && (
                                    <p className="text-sm text-red-500">{errorsServiceBookingData.service_name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description" className="block font-medium">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={serviceBookingData.description}
                                    onChange={(e) => setServiceBookingData('description', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Describe the service booking..."
                                />
                                {errorsServiceBookingData.description && (
                                    <p className="text-sm text-red-500">{errorsServiceBookingData.description}</p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <Label htmlFor="comment" className="block font-medium">
                                    Comment
                                </Label>
                                <Textarea
                                    id="comment"
                                    name="comment"
                                    value={serviceBookingData.comment}
                                    onChange={(e) => setServiceBookingData('comment', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Add any comments..."
                                />
                                {errorsServiceBookingData.comment && <p className="text-sm text-red-500">{errorsServiceBookingData.comment}</p>}
                            </div>

                            {/* Contact Name */}
                            <div>
                                <Label htmlFor="contact_name" className="block font-medium">
                                    Contact Name
                                </Label>
                                <Input
                                    id="contact_name"
                                    name="contact_name"
                                    value={serviceBookingData.contact_name}
                                    onChange={(e) => setServiceBookingData('contact_name', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter contact name"
                                />
                                {errorsServiceBookingData.contact_name && (
                                    <p className="text-sm text-red-500">{errorsServiceBookingData.contact_name}</p>
                                )}
                            </div>

                            {/* Contact Number */}
                            <div>
                                <Label htmlFor="contact_number" className="block font-medium">
                                    Contact No.
                                </Label>
                                <Input
                                    id="contact_number"
                                    name="contact_number"
                                    value={serviceBookingData.contact_number}
                                    onChange={(e) => setServiceBookingData('contact_number', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter contact number"
                                />
                                {errorsServiceBookingData.contact_number && (
                                    <p className="text-sm text-red-500">{errorsServiceBookingData.contact_number}</p>
                                )}
                            </div>
                            {/* Contact Email */}
                            <div>
                                <Label htmlFor="contact_email" className="block font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="contact_email"
                                    name="contact_email"
                                    value={serviceBookingData.contact_email}
                                    onChange={(e) => setServiceBookingData('contact_email', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2"
                                    placeholder="Enter email"
                                />
                                {errorsServiceBookingData.contact_email && (
                                    <p className="text-sm text-red-500">{errorsServiceBookingData.contact_email}</p>
                                )}
                            </div>

                            {/* Date & Return Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date" className="block font-medium">
                                        Date
                                    </Label>
                                    <div className="mt-2 flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <span>{startDate ? format(startDate, 'PPP') : 'Select a date'}</span>
                                                    <RiCalendarLine size={16} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    defaultMonth={startDate}
                                                    onSelect={(d) => d && setStartDate(d)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {errorsServiceBookingData.date && <p className="text-sm text-red-500">{errorsServiceBookingData.date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="return_date" className="block font-medium">
                                        Return Date
                                    </Label>
                                    <div className="mt-2 flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <span>{returnDate ? format(returnDate, 'PPP') : 'Select a return date'}</span>
                                                    <RiCalendarLine size={16} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={returnDate}
                                                    defaultMonth={returnDate || startDate}
                                                    onSelect={(d) => d && setReturnDate(d)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {errorsServiceBookingData.return_date && (
                                        <p className="text-sm text-red-500">{errorsServiceBookingData.return_date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Time Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_time" className="block font-medium">
                                        Start Time
                                    </Label>
                                    <Input
                                        type="time"
                                        id="start_time"
                                        name="start_time"
                                        value={serviceBookingData.start_time}
                                        onChange={(e) => setServiceBookingData('start_time', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                    {errorsServiceBookingData.start_time && (
                                        <p className="text-sm text-red-500">{errorsServiceBookingData.start_time}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="end_time" className="block font-medium">
                                        End Time
                                    </Label>
                                    <Input
                                        type="time"
                                        id="end_time"
                                        name="end_time"
                                        value={serviceBookingData.end_time}
                                        onChange={(e) => setServiceBookingData('end_time', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                    {errorsServiceBookingData.end_time && <p className="text-sm text-red-500">{errorsServiceBookingData.end_time}</p>}
                                </div>
                            </div>

                            {/* Amount Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="total_amount" className="block font-medium">
                                        Total Amount (₱)
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        id="total_amount"
                                        name="total_amount"
                                        value={serviceBookingData.total_amount}
                                        onChange={(e) => setServiceBookingData('total_amount', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="0.00"
                                    />
                                    {errorsServiceBookingData.total_amount && (
                                        <p className="text-sm text-red-500">{errorsServiceBookingData.total_amount}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="paid_amount" className="block font-medium">
                                        Paid Amount (₱)
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        id="paid_amount"
                                        name="paid_amount"
                                        value={serviceBookingData.paid_amount}
                                        onChange={(e) => setServiceBookingData('paid_amount', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2"
                                        placeholder="0.00"
                                    />
                                    {errorsServiceBookingData.paid_amount && (
                                        <p className="text-sm text-red-500">{errorsServiceBookingData.paid_amount}</p>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex-row sm:justify-between">
                                <div className="flex flex-1 justify-end gap-2">
                                    <Button variant="secondary" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processingServiceBookingData}>
                                        {processingServiceBookingData && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    )}
                </div>

                {error && <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</div>}

                <DialogFooter className="flex-row sm:justify-between">
                    <div className="flex gap-2">
                        {event?.id && (
                            <Button variant="outline" size="icon" onClick={handleDelete} aria-label="Delete event">
                                <RiDeleteBinLine size={16} />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
