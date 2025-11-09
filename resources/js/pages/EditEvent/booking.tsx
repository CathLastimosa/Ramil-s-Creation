import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Textarea } from '@/components/ui/textarea';
import EditEventLayout from '@/layouts/EditEvent/layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BookingTime {
    from: string;
    to: string;
    status: string;
}

interface BlockedTime {
    from: string;
    to: string;
}

interface BookingType {
    booking_id: number;
    event_name: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    guest_count: string;
    contact_name: string;
    contact_email: string;
    contact_number: string;
    street_address: string;
    city: string;
    province: string;
    special_request: string;
}

interface PackageType {
    package_id: string;
    package_name: string;
}

export default function EditBooking({
    booking,
    packages,
    bookedTimes = {},
    blockedtimes = {},
    servicebookingtimes = {},
}: {
    booking: BookingType;
    packages: PackageType[];
    bookedTimes?: Record<string, BookingTime[]>;
    blockedtimes?: Record<string, BlockedTime[]>;
    servicebookingtimes?: Record<string, BlockedTime[]>;
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const bookingSlots = [
        { label: 'Full-Day Event', from: '07:00', to: '20:00' },
        { label: 'Half-Day Event', from: '07:00', to: '12:00' },
        { label: 'Half-Day Event', from: '13:00', to: '18:00' },
        { label: 'Short-Day Event', from: '07:00', to: '10:00' },
        { label: 'Short-Day Event', from: '11:00', to: '14:00' },
        { label: 'Short-Day Event', from: '15:00', to: '18:00' },
        { label: 'Short-Day Event', from: '19:00', to: '20:00' },
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

    const [date, setDate] = useState<Date | undefined>(new Date(booking.event_date));
    const [selectedSlot, setSelectedSlot] = useState<number | null>(() => {
        const currentSlot = `${booking.event_time_from}-${booking.event_time_to}`;
        const index = bookingSlots.findIndex((slot) => `${slot.from}-${slot.to}` === currentSlot);
        return index >= 0 ? index : null;
    });

    const [formData, setFormData] = useState({
        event_name: booking.event_name,
        event_date: booking.event_date,
        event_time_from: booking.event_time_from,
        event_time_to: booking.event_time_to,
        guest_count: booking.guest_count,
        contact_name: booking.contact_name,
        contact_email: booking.contact_email,
        contact_number: booking.contact_number,
        street_address: booking.street_address,
        city: booking.city,
        province: booking.province,
        special_request: booking.special_request || '',
    });

    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = bookingSlots[selectedSlot];
            setFormData((prev) => ({
                ...prev,
                event_date: formatLocalDate(date),
                event_time_from: slot.from,
                event_time_to: slot.to,
            }));
        }
    }, [date, selectedSlot]);

    useEffect(() => {
        setSelectedSlot(null);
        setFormData((prev) => ({
            ...prev,
            event_date: '',
            event_time_from: '',
            event_time_to: '',
        }));
    }, [date]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(route('adminbooking.update', booking.booking_id), formData, {
            onSuccess: () => toast.success('Booking updated successfully'),
            onError: () => toast.error('Failed to update booking'),
        });
    };

    return (
        <EditEventLayout>
            <Head title="Edit Booking" />
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-2">
                        <div>
                            <Label htmlFor="event_name">Event Name</Label>
                            <Input id="event_name" name="event_name" value={formData.event_name} onChange={handleChange} required />
                        </div>
                        <div className="flex flex-col items-center">
                            <CardTitle className="m-4 text-xl font-semibold">Select Event Date & Time</CardTitle>
                            <CardDescription className="mb-4 text-sm">You should book your event a month before the event date!</CardDescription>
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
                                            const fullyUnavailable = bookingSlots.every((slot) => {
                                                const booked = bookedTimes[dayKey]?.some(
                                                    (t) =>
                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                        (slot.from <= t.from && slot.to >= t.to),
                                                );

                                                const blocked = blockedtimes[dayKey]?.some(
                                                    (t) =>
                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                        (slot.from <= t.from && slot.to >= t.to),
                                                );

                                                const servicebooked = servicebookingtimes[dayKey]?.some(
                                                    (t) =>
                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                        (slot.from <= t.from && slot.to >= t.to),
                                                );

                                                return booked || blocked || servicebooked;
                                            });
                                            return fullyUnavailable;
                                        }}
                                    />
                                </div>

                                {date && (
                                    <div className="w-full max-w-md transform transition-all duration-500">
                                        <CardTitle className="mb-4 text-base font-medium">Available Time Slots for {date.toDateString()}</CardTitle>

                                        {(() => {
                                            let flatIdx = 0; // flat index across all groups
                                            return Object.entries(
                                                bookingSlots.reduce(
                                                    (groups, slot) => {
                                                        if (!groups[slot.label]) groups[slot.label] = [];
                                                        groups[slot.label].push(slot);
                                                        return groups;
                                                    },
                                                    {} as Record<string, typeof bookingSlots>,
                                                ),
                                            ).map(([label, slots], groupIdx) => (
                                                <div key={groupIdx} className="mb-4">
                                                    <Label>{label}</Label>
                                                    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                                        {slots.map((slot) => {
                                                            const dateKey = formatLocalDate(date!);
                                                            const isBooked =
                                                                bookedTimes[dateKey]?.some(
                                                                    (t) =>
                                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                                        (slot.from <= t.from && slot.to >= t.to),
                                                                ) ?? false;

                                                            const isBlocked =
                                                                blockedtimes[dateKey]?.some(
                                                                    (t) =>
                                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                                        (slot.from <= t.from && slot.to >= t.to),
                                                                ) ?? false;

                                                            const isServiceBooked =
                                                                servicebookingtimes[dateKey]?.some(
                                                                    (t) =>
                                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                                        (slot.from <= t.from && slot.to >= t.to),
                                                                ) ?? false;

                                                            const isUnavailable = isBooked || isBlocked || isServiceBooked;

                                                            const currentIdx = flatIdx++;

                                                            return (
                                                                <Button
                                                                    key={currentIdx}
                                                                    type="button"
                                                                    variant={
                                                                        isUnavailable
                                                                            ? 'ghost'
                                                                            : selectedSlot === currentIdx
                                                                              ? 'secondary'
                                                                              : 'outline'
                                                                    }
                                                                    className={`p-2 text-sm ${
                                                                        isUnavailable ? 'cursor-not-allowed text-gray-400 line-through' : ''
                                                                    } ${selectedSlot === currentIdx && !isUnavailable ? 'text-brand-primary' : ''}`}
                                                                    disabled={isUnavailable}
                                                                    onClick={() => {
                                                                        if (!isUnavailable) {
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
                                            ));
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="guest_count">Guest Count</Label>
                            <Input id="guest_count" name="guest_count" type="number" value={formData.guest_count} onChange={handleChange} required />
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
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="street_address">Street Address</Label>
                            <Input id="street_address" name="street_address" value={formData.street_address} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="province">Province</Label>
                                <Input id="province" name="province" value={formData.province} onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="special_request">Special Request</Label>
                            <Textarea id="special_request" name="special_request" value={formData.special_request} onChange={handleChange} rows={4} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => router.visit(route('adminbooking.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit">
                        <Save />
                        Save Changes</Button>
                    </div>
                </form>
            </div>
        </EditEventLayout>
    );
}
