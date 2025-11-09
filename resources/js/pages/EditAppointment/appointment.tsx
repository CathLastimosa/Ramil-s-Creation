import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Textarea } from '@/components/ui/textarea';
import EditAppointmentLayout from '@/layouts/EditAppointment/layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AppointmentTime {
    from: string;
    to: string;
    status: string;
}

interface AppointmentType {
    appointment_id: string;
    appointment_date: string;
    appointment_time_from: string;
    appointment_time_to: string;
    status: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    purpose: string;
}

interface BlockedTime {
    from: string;
    to: string;
}

export default function EditAppointment({
    appointment,
    appointmentTimes = {},
    blockedtimes = {},
}: {
    appointment: AppointmentType;
    appointmentTimes?: Record<string, AppointmentTime[]>;
    blockedtimes?: Record<string, BlockedTime[]>;
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const appointmentSlots = [
        { from: '07:00', to: '09:00' },
        { from: '09:10', to: '11:00' },
        { from: '13:00', to: '15:00' },
        { from: '15:10', to: '18:00' },
        { from: '18:10', to: '20:00' },
        { from: '20:10', to: '22:00' },
    ];

    const formatTo12Hour = (time24: string) => {
        let [hour, minute] = time24.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    function formatLocalDate(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [date, setDate] = useState<Date | undefined>(new Date(appointment.appointment_date));
    const [selectedSlot, setSelectedSlot] = useState<number | null>(() => {
        const currentSlot = `${appointment.appointment_time_from}-${appointment.appointment_time_to}`;
        const index = appointmentSlots.findIndex((slot) => `${slot.from}-${slot.to}` === currentSlot);
        return index >= 0 ? index : null;
    });

    const [formData, setFormData] = useState({
        purpose: appointment.purpose,
        appointment_date: appointment.appointment_date,
        appointment_time_from: appointment.appointment_time_from,
        appointment_time_to: appointment.appointment_time_to,
        contact_name: appointment.contact_name,
        contact_email: appointment.contact_email,
        contact_phone: appointment.contact_phone,
    });

    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = appointmentSlots[selectedSlot];
            setFormData((prev) => ({
                ...prev,
                appointment_date: formatLocalDate(date),
                appointment_time_from: slot.from,
                appointment_time_to: slot.to,
            }));
        }
    }, [date, selectedSlot]);

    useEffect(() => {
        setSelectedSlot(null);
        setFormData((prev) => ({
            ...prev,
            appointment_date: '',
            appointment_time_from: '',
            appointment_time_to: '',
        }));
    }, [date]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(route('adminappointments.update', appointment.appointment_id), formData, {
            onSuccess: () => toast.success('Appointment updated successfully'),
            onError: () => toast.error('Failed to update appointment'),
        });
    };

    const breadcrumbs = [{ title: 'Edit Appointment', href: '/adminappointments/edit' }];

    return (
        <EditAppointmentLayout>
            <Head title="Edit Appointment" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Edit Appointment</CardTitle>
                <CardDescription>Update the appointment details below.</CardDescription>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-2">
                        <div>
                            <Label htmlFor="purpose">Purpose</Label>
                            <Textarea id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} rows={3} required />
                        </div>
                        <div className="flex flex-col items-center">
                            <CardTitle className="m-4 text-xl font-semibold">Select Appointment Date & Time</CardTitle>
                            <CardDescription className="mb-4 text-sm">
                                You should book your appointment a month before the appointment date!
                            </CardDescription>
                            <div
                                className={
                                    date
                                        ? 'grid grid-cols-1 gap-4 transition-all duration-500 ease-in-out md:grid-cols-2'
                                        : 'flex justify-center transition-all duration-500 ease-in-out'
                                }
                            >
                                <div className={date ? '' : 'flex justify-center'}>
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-lg border shadow-sm"
                                        captionLayout="dropdown"
                                        disabled={(day) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (day < today) return true;

                                            const dayKey = formatLocalDate(day);
                                            const fullyUnavailable = appointmentSlots.every((slot) => {
                                                const appointment = appointmentTimes[dayKey]?.some(
                                                    (t) =>
                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                        (slot.from <= t.from && slot.to >= t.to),
                                                );
                                                const blocked = blockedtimes[dayKey]?.some(
                                                    (b) =>
                                                        (slot.from >= b.from && slot.from < b.to) ||
                                                        (slot.to > b.from && slot.to <= b.to) ||
                                                        (slot.from <= b.from && slot.to >= b.to),
                                                );
                                                return appointment || blocked;
                                            });
                                            return fullyUnavailable;
                                        }}
                                    />
                                </div>

                                {date && (
                                    <div className="w-full max-w-md transform transition-all duration-500">
                                        <CardTitle className="mb-4 text-base font-medium">Available Time Slots for {date.toDateString()}</CardTitle>

                                        <div className="mt-2 grid grid-cols-1 gap-2">
                                            {appointmentSlots.map((slot, idx) => {
                                                const dateKey = formatLocalDate(date!);
                                                const isAppointment =
                                                    appointmentTimes[dateKey]?.some(
                                                        (t) =>
                                                            (slot.from >= t.from && slot.from < t.to) ||
                                                            (slot.to > t.from && slot.to <= t.to) ||
                                                            (slot.from <= t.from && slot.to >= t.to),
                                                    ) ?? false;
                                                const isBlocked =
                                                    blockedtimes[dateKey]?.some(
                                                        (b) =>
                                                            (slot.from >= b.from && slot.from < b.to) ||
                                                            (slot.to > b.from && slot.to <= b.to) ||
                                                            (slot.from <= b.from && slot.to >= b.to),
                                                    ) ?? false;
                                                const disabled = isAppointment || isBlocked;

                                                const currentIdx = idx;

                                                return (
                                                    <Button
                                                        key={currentIdx}
                                                        type="button"
                                                        variant={disabled ? 'ghost' : selectedSlot === currentIdx ? 'secondary' : 'outline'}
                                                        className={`p-2 text-sm ${
                                                            disabled ? 'cursor-not-allowed text-gray-400 line-through' : ''
                                                        } ${selectedSlot === currentIdx && !disabled ? 'text-brand-primary' : ''}`}
                                                        disabled={disabled}
                                                        onClick={() => {
                                                            if (!disabled) {
                                                                setSelectedSlot(currentIdx);
                                                            }
                                                        }}
                                                    >
                                                        {formatTo12Hour(slot.from)} - {formatTo12Hour(slot.to)}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="contact_name">Contact Name</Label>
                            <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                                id="contact_email"
                                name="contact_email"
                                type="email"
                                value={formData.contact_email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="contact_phone">Contact Phone</Label>
                            <Input id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="secondary" onClick={() => router.visit(route('adminappointments.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit">Update Appointment</Button>
                    </div>
                </form>
            </div>
        </EditAppointmentLayout>
    );
}
