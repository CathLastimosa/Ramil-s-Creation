import { Button } from '@/components/ui/button-shad';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    { title: 'Service Bookings', href: '/service-booking' },
    { title: 'Add New Service Booking', href: '/service-booking/create' },
];

export default function AddNewServiceBooking({
    bookedTimes = {},
    blockedtimes = {},
    servicebookingtimes = {},
}: {
    bookedTimes?: Record<string, { from: string; to: string; status: string }[]>;
    blockedtimes?: Record<string, { from: string; to: string }[]>;
    servicebookingtimes?: Record<string, { from: string; to: string }[]>;
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const bookingSlots = [
        { label: 'Full-Day Service', from: '07:00', to: '20:00' },
        { label: 'Half-Day Service', from: '07:00', to: '12:00' },
        { label: 'Half-Day Service', from: '13:00', to: '18:00' },
        { label: 'Short-Day Service', from: '07:00', to: '10:00' },
        { label: 'Short-Day Service', from: '11:00', to: '14:00' },
        { label: 'Short-Day Service', from: '15:00', to: '18:00' },
        { label: 'Short-Day Service', from: '19:00', to: '20:00' },
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

    const [date, setDate] = useState<Date | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        service_name: '',
        description: '',
        comment: '',
        contact_name: '',
        contact_number: '',
        contact_email: '',
        date: '',
        start_time: '',
        end_time: '',
        total_amount: '',
        paid_amount: '',
    });

    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = bookingSlots[selectedSlot];
            setFormData((prev) => ({
                ...prev,
                date: formatLocalDate(date),
                start_time: slot.from,
                end_time: slot.to,
            }));
        }
    }, [date, selectedSlot]);

    useEffect(() => {
        if (date) {
            setSelectedSlot(null);
            setFormData((prev) => ({
                ...prev,
                date: formatLocalDate(date),
                start_time: '',
                end_time: '',
            }));
        }
    }, [date]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('service-bookings.store'), formData, {
            onSuccess: () => toast.success('Service booking created successfully'),
            onError: (errors) => {
                console.error('Create errors:', errors);
                const errorMessages = Object.values(errors).flat().join(', ');
                toast.error(`Failed to create service booking: ${errorMessages}`);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Service Booking" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardHeader>
                    <CardTitle>Add New Service Booking</CardTitle>
                    <CardDescription>Fill in the details to create a new service booking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="service_name">Service Name</Label>
                                <Input id="service_name" name="service_name" value={formData.service_name} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="comment">Comment</Label>
                                <Textarea id="comment" name="comment" value={formData.comment} onChange={handleChange} rows={4} />
                            </div>
                            <div>
                                <Label htmlFor="comment">Contact Name</Label>
                                <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="comment">Contact Number</Label>
                                <Input id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="comment">Contact Email</Label>
                                <Input id="contact_email" name="contact_email" value={formData.contact_email} onChange={handleChange} />
                            </div>
                            <div className="flex flex-col items-center">
                                <CardTitle className="m-4 text-xl font-semibold">Select Date & Time</CardTitle>
                                <CardDescription className="mb-4 text-sm">Select the service booking date and time</CardDescription>
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
                                            className="w-80 rounded-lg border shadow-sm"
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
                                        <div className="m-3 w-full max-w-md transform transition-all duration-500">
                                            <CardTitle className="mb-4 text-base font-medium">
                                                Available Time Slots for {date.toDateString()}
                                            </CardTitle>

                                            {(() => {
                                                let flatIdx = 0;
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="total_amount">Total Amount</Label>
                                    <Input
                                        id="total_amount"
                                        name="total_amount"
                                        type="number"
                                        min={0}
                                        value={formData.total_amount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="paid_amount">Paid Amount</Label>
                                    <Input
                                        id="paid_amount"
                                        name="paid_amount"
                                        type="number"
                                        min={0}
                                        value={formData.paid_amount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit">Submit</Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </AppLayout>
    );
}
