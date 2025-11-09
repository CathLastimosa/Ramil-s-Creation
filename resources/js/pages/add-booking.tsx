'use client';

import InputError from '@/components/input-error';
import { Button, Button as Shadcn } from '@/components/ui/button-shad';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm, usePage } from '@inertiajs/react';
import { Box } from '@mui/material';
import React, { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';

import {
    BuildingIcon,
    Calculator,
    CalendarIcon,
    GlobeIcon,
    HomeIcon,
    LoaderCircle,
    MailIcon,
    MapIcon,
    PhoneIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';

const breadcrumbs = [
    { title: 'Bookings', href: '/admin-booking' },
    { title: 'Add New Booking', href: '/' },
];

interface BookingTime {
    from: string;
    to: string;
    status: string;
}

interface BlockedTime {
    from: string;
    to: string;
}

interface PageProps {
    bookedTimes: Record<string, BookingTime[]>;
    blockedtimes: Record<string, BlockedTime[]>;
    servicebookingtimes: Record<string, BlockedTime[]>;
    [key: string]: any;
}

type PackageProps = {
    package_id: string;
    package_name: string;
    package_description?: string;
    status: 'published' | 'unpublished';
    package_price: number;
    package_promo: number;
    services_count: number;
    discounted_price?: number;
};

type ServiceProps = {
    services_id: string;
    service_name: string;
    description?: string;
    image?: string;
};

export default function BookingForm() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const { packages, relatedServices: initialServices = [] } = usePage<{
        packages: PackageProps[];
        relatedServices?: ServiceProps[];
    }>().props;

    const { bookedTimes = {}, blockedtimes = {}, servicebookingtimes = {} } = usePage<PageProps>().props;

    // State hooks
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [relatedServices, setRelatedServices] = useState<ServiceProps[]>(initialServices);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [date, setDate] = useState<Date | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('1');

    // Form state managed by Inertia useForm
    const { data, setData, post, processing, errors } = useForm({
        service: '',
        datetime: '',
        eventName: '',
        guestCount: '',
        street: '',
        city: '',
        barangay: '',
        province: '',
        specialRequests: '',
        fullName: '',
        email: '',
        phone: '',
        package_id: '',
        selected_services: [] as string[],
        payment_method: '',
        booking_id: '',
        total_amount: '',
    });

    // Booking time slots
    const bookingSlots = [
        { label: 'Full-Day Event', from: '07:00', to: '20:00' },
        { label: 'Half-Day Event', from: '07:00', to: '12:00' },
        { label: 'Half-Day Event', from: '13:00', to: '18:00' },
        { label: 'Short-Day Event', from: '07:00', to: '10:00' },
        { label: 'Short-Day Event', from: '11:00', to: '14:00' },
        { label: 'Short-Day Event', from: '15:00', to: '18:00' },
        { label: 'Short-Day Event', from: '19:00', to: '20:00' },
    ];

    // Utility: Convert 24h time to 12h format
    const formatTo12Hour = (time24: string) => {
        let [hour, minute] = time24.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    // Utility: Format Date object to yyyy-mm-dd string
    function formatLocalDate(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Update datetime in form data when date or slot changes
    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = bookingSlots[selectedSlot];
            setData('datetime', `${formatLocalDate(date)} ${slot.from}-${slot.to}`);
        }
    }, [date, selectedSlot]);

    // Reset selected slot and datetime when date changes
    useEffect(() => {
        setSelectedSlot(null);
        setData('datetime', '');
    }, [date]);

    // Handle package selection and fetch related services
    const handlePackageClick = (packageId: string) => {
        setSelectedPackage(packageId);
        router.get(
            route('adminbooking.create', packageId),
            {},
            {
                preserveState: true,
                only: ['relatedServices'],
                onSuccess: (page) => {
                    const services = (page.props as any).relatedServices || [];
                    setRelatedServices(services);
                    setSelectedServices(services.map((service: ServiceProps) => service.services_id));
                },
            },
        );
    };

    const id = useId();

    const [readyToPost, setReadyToPost] = useState(false);

    // Form submission handler with validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData((prev) => ({
            ...prev,
            package_id: selectedPackage ?? '',
            selected_services: selectedServices,
            payment_method: paymentMethod,
        }));

        post(route('adminbooking.store'), {
            forceFormData: true,
            onError: (errors: Record<string, string | string[]>) => {
                console.error(errors);
                toast.error('Please fill in all required booking details correctly.');
            },
        });
        setReadyToPost(true);
    };

    useEffect(() => {
        if (readyToPost && data.package_id && data.selected_services.length > 0 && data.payment_method) {
            post(route('adminbooking.store'), {
                forceFormData: true,
                onSuccess: (page: any) => {
                    if (page?.props?.booking_id) {
                        setData('booking_id', page.props.booking_id);
                    }
                },
            });

            setReadyToPost(false);
        }
    }, [readyToPost, data.package_id, data.selected_services, data.payment_method]);

    const handleServiceCheckboxChange = (serviceId: string) => {
        setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4">
            <CardTitle>Add New Booking</CardTitle>
            <CardDescription>You can add bookings here.</CardDescription>

            <Box>
                <form id="bookingForm" onSubmit={handleSubmit}>
                    {/* Package Selection */}
                    <ul className="mb-6 flex justify-start gap-10">
                        {packages && packages.length > 0 ? (
                            packages.map((pkg) => {
                                const promoPercent = pkg.package_promo ? pkg.package_promo : 0;
                                const price = Number(pkg.package_price);
                                const discountedPrice = promoPercent ? price - price * (promoPercent / 100) : price;

                                const formattedPrice = price.toLocaleString();
                                const formattedDiscounted = discountedPrice.toLocaleString();

                                return (
                                    <li
                                        key={pkg.package_id}
                                        className={`group relative cursor-pointer p-4 text-center ${selectedPackage === pkg.package_id ? '' : ''}`}
                                        onClick={() => handlePackageClick(pkg.package_id)}
                                    >
                                        <strong>{pkg.package_name}</strong> <br />
                                        {promoPercent > 0 ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-red-500">₱{Number(pkg.discounted_price || 0).toLocaleString('en-US')}</span>

                                                <span className="text-sm text-gray-400 line-through">₱{formattedPrice}</span>

                                                <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-500">-{promoPercent}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-red-500">
                                                ₱{Number(pkg.discounted_price || pkg.package_price).toLocaleString('en-US')}
                                            </span>
                                        )}
                                        <span
                                            className={`absolute bottom-0 left-1/4 h-0.5 w-1/2 origin-center bg-red-500 transition-transform duration-300 ${
                                                selectedPackage === pkg.package_id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                            }`}
                                        />
                                    </li>
                                );
                            })
                        ) : (
                            <p>No packages available.</p>
                        )}
                    </ul>

                    {/* Related Services */}
                    {selectedPackage && relatedServices.length > 0 && (
                        <div className="mb-6 flex w-full flex-col items-center gap-4 p-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                {relatedServices.map((service) => {
                                    const isChecked = selectedServices.includes(service.services_id);
                                    return (
                                        <Card
                                            key={service.services_id}
                                            onClick={() => handleServiceCheckboxChange(service.services_id)}
                                            className="relative w-60 cursor-pointer rounded border p-4 text-center shadow transition hover:shadow-lg"
                                        >
                                            <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleServiceCheckboxChange(service.services_id)}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                            <CardTitle className="mt-8">{service.service_name}</CardTitle>
                                            {/* Uncomment if images are needed
                        {service.image ? (
                          <img
                            src={`/storage/${service.image}`}
                            alt={service.service_name}
                            className="mx-auto my-2 h-24 object-contain"
                          />
                        ) : (
                          <img
                            src="/default-image.png"
                            alt="No image available"
                            className="mx-auto my-2 h-24 object-contain"
                          />
                        )} */}
                                            <CardDescription className="text-gray-600">{service.description}</CardDescription>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <hr />

                    {/* Date & Time Selection */}
                    <div className="mt-5 text-left">
                        <CardTitle className="text-l mb-5">Select Event Date & Time</CardTitle>
                        <CardDescription>You should book your event a month before the event date!</CardDescription>
                    </div>

                    <div className="m-5 flex gap-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-80 rounded-lg border"
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

                        {date && (
                            <div className="m-5 transform transition-all duration-500">
                                <CardTitle className="mb-5 text-lg">Available Time Slots for {date.toDateString()}</CardTitle>
                                {(() => {
                                    let flatIdx = 0; // flat index across all groups
                                    const groupedSlots = bookingSlots.reduce(
                                        (groups, slot) => {
                                            if (!groups[slot.label]) groups[slot.label] = [];
                                            groups[slot.label].push(slot);
                                            return groups;
                                        },
                                        {} as Record<string, typeof bookingSlots>,
                                    );

                                    return Object.entries(groupedSlots).map(([label, slots], groupIdx) => (
                                        <div key={groupIdx} className="mb-4">
                                            <Label>{label}</Label>
                                            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                                {slots.map((slot) => {
                                                    const dateKey = formatLocalDate(date);
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
                                                        <Shadcn
                                                            key={currentIdx}
                                                            type="button"
                                                            variant={isUnavailable ? 'ghost' : selectedSlot === currentIdx ? 'secondary' : 'outline'}
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
                                                        </Shadcn>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>

                    <hr />

                    {/* Booking Form */}
                    <CardTitle className="m-5 text-center text-2xl">Fill out the Booking Form</CardTitle>

                    {/* Event Details */}
                    <div className="mb-6 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Event Name */}
                        <div className="flex flex-col">
                            <Label htmlFor="event-name" className="mb-2">
                                Event Name
                            </Label>
                            <div className="relative">
                                <CalendarIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    id="event-name"
                                    placeholder="Enter event name"
                                    value={data.eventName || ''}
                                    onChange={(e) => setData('eventName', e.target.value)}
                                    aria-invalid={!!errors.eventName}
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.eventName} />
                        </div>

                        {/* Guest Count */}
                        <div className="flex flex-col">
                            <Label htmlFor="guest-count" className="mb-2">
                                Number of Guests
                            </Label>
                            <div className="relative">
                                <UsersIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    id="guest-count"
                                    placeholder="Enter number of guests"
                                    value={data.guestCount || ''}
                                    onChange={(e) => setData('guestCount', e.target.value)}
                                    type="number"
                                    min={1}
                                    aria-invalid={!!errors.guestCount}
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.guestCount} />
                        </div>
                    </div>

                    {/* Event Location */}
                    <div className="mb-6 w-full">
                        <Label>Event Location</Label>
                        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Street */}
                            <div className="flex flex-col">
                                <div className="relative">
                                    <HomeIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        id="street"
                                        placeholder="Enter Street"
                                        value={data.street || ''}
                                        onChange={(e) => setData('street', e.target.value)}
                                        aria-invalid={!!errors.street}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.street} />
                            </div>

                            {/* City */}
                            <div className="flex flex-col">
                                <div className="relative">
                                    <BuildingIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        id="city"
                                        placeholder="Enter City/Town"
                                        value={data.city || ''}
                                        onChange={(e) => setData('city', e.target.value)}
                                        aria-invalid={!!errors.city}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.city} />
                            </div>

                            {/* Barangay */}
                            <div className="flex flex-col">
                                <div className="relative">
                                    <MapIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        id="barangay"
                                        placeholder="Enter Barangay"
                                        value={data.barangay || ''}
                                        onChange={(e) => setData('barangay', e.target.value)}
                                        aria-invalid={!!errors.barangay}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.barangay} />
                            </div>

                            {/* Province */}
                            <div className="flex flex-col">
                                <div className="relative">
                                    <GlobeIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        id="province"
                                        placeholder="Enter Province"
                                        value={data.province || ''}
                                        onChange={(e) => setData('province', e.target.value)}
                                        aria-invalid={!!errors.province}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.province} />
                            </div>
                        </div>
                    </div>

                    {/* Special Requests */}
                    <div className="mb-6 w-full">
                        <Label htmlFor="special-requests">Special Requests</Label>
                        <Textarea
                            id="special-requests"
                            placeholder="Add any special requests or customization here"
                            value={data.specialRequests || ''}
                            onChange={(e) => setData('specialRequests', e.target.value)}
                            aria-invalid={!!errors.specialRequests}
                        />
                        <InputError message={errors.specialRequests} />
                    </div>

                    {/* Contact Information */}
                    <div className="mb-6 w-full">
                        <Label>Contact Information</Label>

                        <div className="relative mt-2 mb-2">
                            <UserIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                type="text"
                                placeholder="Full Name"
                                value={data.fullName || ''}
                                onChange={(e) => setData('fullName', e.target.value)}
                                aria-invalid={!!errors.fullName}
                                className="pl-9"
                            />
                            <InputError message={errors.fullName} />
                        </div>

                        <div className="relative mb-2">
                            <MailIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                type="email"
                                placeholder="Email Address"
                                value={data.email || ''}
                                onChange={(e) => setData('email', e.target.value)}
                                aria-invalid={!!errors.email}
                                className="pl-9"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="relative mb-2">
                            <PhoneIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                type="tel"
                                placeholder="09xx xxx xxxx"
                                value={data.phone || ''}
                                onChange={(e) => setData('phone', e.target.value)}
                                aria-invalid={!!errors.phone}
                                className="pl-9"
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <CardTitle className="mb-4">Select Payment Method</CardTitle>
                    <RadioGroup className="mb-6" defaultValue={paymentMethod} onValueChange={(value) => setPaymentMethod(value)}>
                        <div className="flex flex-col gap-2">
                            <div className="relative flex items-center gap-2 rounded-md border border-input p-4 shadow-xs">
                                <RadioGroupItem value="1" id={`${id}-1`} className="order-1 after:absolute after:inset-0" />
                                <Label htmlFor={`${id}-1`} className="cursor-pointer">
                                    Cash on Hand <span className="text-xs font-normal text-muted-foreground">(Pay with physical cash)</span>
                                </Label>
                            </div>

                            <div className="relative flex items-center gap-2 rounded-md border border-input p-4 shadow-xs">
                                <RadioGroupItem value="2" id={`${id}-2`} className="order-1 after:absolute after:inset-0" />
                                <Label htmlFor={`${id}-2`} className="cursor-pointer">
                                    GCash <span className="text-xs font-normal text-muted-foreground">(Mobile Wallet)</span>
                                </Label>
                            </div>

                            <div className="relative mb-2">
                                <Calculator className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    type="number"
                                    placeholder="Enter Total Amount"
                                    value={data.total_amount || ''}
                                    onChange={(e) => setData('total_amount', e.target.value)}
                                    aria-invalid={!!errors.total_amount}
                                    className="pl-9"
                                />
                                <InputError message={errors.total_amount} />
                            </div>
                        </div>
                    </RadioGroup>

                    <div className="flex itemscenter justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        {/* Submit Button */}
                        <Button type="submit" variant="brand" disabled={processing}>
                            {processing && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                            Submit Booking
                        </Button>
                    </div>
                </form>
            </Box>
        </div>
    );
}
