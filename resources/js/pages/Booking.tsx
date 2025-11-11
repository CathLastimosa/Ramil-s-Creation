'use client';
import InputError from '@/components/input-error';
import Onboarding from '@/components/onboarding';
import TermsAndConditionsDialog from '@/components/terms-and-conditions';
import TextLink from '@/components/text-link';
import { Button as Shadcn } from '@/components/ui/button-shad';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { router, useForm, usePage } from '@inertiajs/react';
import { Box, Button, MobileStepper, Step, StepButton, StepConnector, StepIconProps, StepLabel, Stepper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
    BuildingIcon,
    CalendarIcon,
    Check,
    ChevronLeft,
    GlobeIcon,
    HomeIcon,
    LoaderCircle,
    MailIcon,
    MapIcon,
    PhoneIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import React, { useEffect, useId, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';

const steps = ['Service', 'Date & Time', 'Information', 'Review', 'Payment']; //Stepper Steps

interface BookingTime {
    from: string;
    to: string;
    status: string;
}

interface BlockedTime {
    from: string;
    to: string;
}

interface PageProps extends InertiaPageProps {
    bookedTimes: Record<string, BookingTime[]>;
    // appointmentTimes: Record<string, BookingTime[]>;
    blockedtimes: Record<string, BlockedTime[]>;
    servicebookingtimes: Record<string, BlockedTime[]>;
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

type Booking = {
    booking_id: string;
    contact_email: string;
    transaction_number: string;
};

type FlashSuccess = {
    message: string;
    booking?: Booking;
};

function PinkStepIcon(props: StepIconProps) {
    const { active, completed, icon } = props;
    return (
        <Box
            sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: completed || active ? '#e91e63' : '#f8bbd0',
                color: '#fff',
                transition: '0.3s',
            }}
        >
            {icon}
        </Box>
    );
}

export default function MultiStepForm() {
    const { flash } = usePage<{ flash: { success?: FlashSuccess; error?: string; message?: string } }>().props;
    const [bookingData, setBookingData] = useState<FlashSuccess | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (flash.success) {
            setBookingData(flash.success);
            setDialogOpen(true);
        }
        if (flash.error) toast.error(flash.error);
        if (flash.message) toast.info(flash.message);
    }, [flash.success, flash.error, flash.message]);

    const { packages, relatedServices: initialServices = [] } = usePage<{
        packages: PackageProps[];
        relatedServices?: ServiceProps[];
    }>().props;

    const { bookedTimes = {}, blockedtimes = {}, servicebookingtimes = {} } = usePage<PageProps>().props;

    const [activeStep, setActiveStep] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [relatedServices, setRelatedServices] = useState<ServiceProps[]>(initialServices);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [date, setDate] = useState<Date | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('1');
    const [step, setStep] = useState<'confirm' | 'recaptcha' | 'verify' | 'success'>('confirm');

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
        reference_no: '',
        payment_proof: null as File | null,
        booking_id: '',
        total_amount: '',
    });

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

    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = bookingSlots[selectedSlot];
            setData('datetime', `${formatLocalDate(date)} ${slot.from}-${slot.to}`);
        }
    }, [date, selectedSlot]);

    useEffect(() => {
        setSelectedSlot(null);
        setData('datetime', '');
    }, [date]);

    const handlePackageClick = (packageId: string) => {
        setSelectedPackage(packageId);
        router.get(
            route('booking.services', packageId),
            {},
            {
                preserveState: true,
                only: ['relatedServices'],
                onSuccess: (page) => {
                    const services = (page.props as any).relatedServices || [];
                    setRelatedServices(services);
                    setSelectedServices(services.map((service: ServiceProps) => service.services_id));

                    // Calculate total_amount
                    const pkg = packages.find((p) => p.package_id === packageId);
                    if (pkg) {
                        const promoPercent = pkg.package_promo || 0;
                        const price = Number(pkg.package_price);
                        const calculatedDiscountedPrice = promoPercent ? price - price * (promoPercent / 100) : price;
                        const discountedPrice = pkg.discounted_price || calculatedDiscountedPrice;
                        setData('total_amount', discountedPrice.toString());
                    }
                },
            },
        );
    };

    const handleStep = (step: number) => () => setActiveStep(step);

    const [readyToPost, setReadyToPost] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e?.preventDefault();

        if (!captchaToken) {
            toast.error('Please complete the reCAPTCHA.');
            return;
        }

        setData((prev) => ({
            ...prev,
            package_id: selectedPackage ?? '',
            selected_services: selectedServices,
            payment_method: paymentMethod,
            captcha_token: captchaToken,
        }));

        post(route('booking.store'), {
            forceFormData: true,
            onSuccess: () => setDialogOpen(true),
            onError: (errors) => console.error(errors),
        });
        setReadyToPost(true);
    };

    useEffect(() => {
        if (readyToPost && data.package_id && data.selected_services.length > 0 && data.payment_method) {
            post(route('booking.store'), {
                forceFormData: true,
                onSuccess: (page: any) => {
                    if (page?.props?.booking_id) {
                        setData('booking_id', page.props.booking_id);
                    }
                    setStep('verify');
                },
            });

            setReadyToPost(false);
        }
    }, [readyToPost, data.package_id, data.selected_services, data.payment_method]);

    const handleServiceCheckboxChange = (serviceId: string) => {
        setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                if (selectedPackage && selectedServices.length > 0) {
                    return true;
                }
                toast.error('Please Select Services to Book!');
            case 1:
                if (!date || selectedSlot === null) {
                    toast.error('You must select both an Event Date and Time Slot. Book your event at least three (3) months in advance!');
                    return false;
                }
                return true;

            case 2:
                if (!data.eventName.trim()) {
                    toast.error('Event Name is required.');
                    return false;
                }
                if (!data.guestCount || isNaN(Number(data.guestCount)) || Number(data.guestCount) <= 0) {
                    toast.error('Please enter a valid number of guests (at least 1).');
                    return false;
                }
                if (!data.street.trim()) {
                    toast.error('Street address is required.');
                    return false;
                }
                if (!data.city.trim()) {
                    toast.error('City is required.');
                    return false;
                }
                if (!data.barangay.trim()) {
                    toast.error('Barangay is required.');
                    return false;
                }
                if (!data.province.trim()) {
                    toast.error('Province is required.');
                    return false;
                }
                if (!data.fullName.trim()) {
                    toast.error('Full Name is required.');
                    return false;
                }
                if (!data.email.trim()) {
                    toast.error('Email address is required.');
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email)) {
                    toast.error('Please enter a valid email address.');
                    return false;
                }
                if (!data.phone.trim()) {
                    toast.error('Phone number is required.');
                    return false;
                }
                const phoneRegex = /^09\d{9}$/;
                if (!phoneRegex.test(data.phone)) {
                    toast.error('Please enter a valid phone number (11 digits starting with 09).');
                    return false;
                }
                return true;
            case 3:
                if (!agreeTerms || !emailReminders) {
                    toast.error('You must agree to the terms and opt-in for reminders to proceed.');
                    return false;
                }
                return true;
            case 4:
                if (paymentMethod === '2' && (!data.reference_no || !data.payment_proof)) {
                    toast.error('You must input Reference No. and the payment proof.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [emailReminders, setEmailReminders] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

    const id = useId();
    // Responsive Stepper orientation and container sizing
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down('sm'));
    const stepperOrientation = isSm ? 'vertical' : 'horizontal';

    const handleConfirmClick = () => {
        setStep('recaptcha');
    };

    const resendVerification = () => {
        if (!bookingData?.booking?.booking_id) {
            toast.error('No booking found to resend verification.');
            return;
        }

        setResending(true);

        router.post(
            route('booking.resend'),
            { booking_id: bookingData.booking.booking_id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Verification email resent!');
                },
                onError: () => {
                    toast.error('Failed to resend verification.');
                },
                onFinish: () => setResending(false),
            },
        );
    };

    return (
        <>
            <Shadcn variant="ghost" onClick={() => router.get(route('home.index'))} className="mt-10 mb-0 ml-4 underline underline-offset-4 md:ml-10">
                <ChevronLeft /> Back to Home
            </Shadcn>
            <Box sx={{ width: { xs: '100%', sm: '94%', md: '85%', lg: '80%' }, p: 3, mx: 'auto' }}>
                <Stepper activeStep={activeStep} orientation={stepperOrientation} connector={<StepConnector />} sx={{ mb: 4 }}>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepButton color="inherit" onClick={handleStep(index)}>
                                <StepLabel StepIconComponent={PinkStepIcon}>{label}</StepLabel>
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>
                <Toaster richColors position="top-center" />
                <Onboarding />

                <form id="bookingForm" onSubmit={handleSubmit} className="pb-20">
                    <Box sx={{ minHeight: '150px' }}>
                        {activeStep === 0 && (
                            <div className="flex flex-col items-center">
                                <CardTitle className="heading-3 mb-5 font-heading">Choose a Package</CardTitle>

                                <ul className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-6 px-10">
                                    {packages && packages.length > 0 ? (
                                        packages.map((pkg) => {
                                            const promoPercent = pkg.package_promo ? pkg.package_promo : 0;
                                            const price = Number(pkg.package_price);
                                            const discountedPrice = promoPercent ? price - price * (promoPercent / 100) : price;

                                            const formattedPrice = price.toLocaleString('en-US');

                                            return (
                                                <li key={pkg.package_id} className="mx-auto w-full max-w-xs">
                                                    <div
                                                        className={`group relative flex h-full cursor-pointer flex-col justify-between rounded-lg border bg-white p-2 text-center shadow-sm transition-all duration-200 md:p-2 ${
                                                            selectedPackage === pkg.package_id
                                                                ? 'border-red-500 bg-red-50'
                                                                : 'border-gray-200 hover:border-red-500 hover:shadow-md'
                                                        } `}
                                                        onClick={() => handlePackageClick(pkg.package_id)}
                                                    >
                                                        {/* Package Name */}
                                                        <div className="flex flex-1 items-center justify-center">
                                                            <strong className="text-lg font-semibold text-gray-800 md:text-xl">
                                                                {pkg.package_name}
                                                            </strong>
                                                        </div>

                                                        {/* Price Section */}
                                                        <div className="mt-3 flex flex-col items-center gap-1">
                                                            {promoPercent > 0 ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <span className="text-base font-medium text-red-600 md:text-lg">
                                                                        ₱{Number(pkg.discounted_price || 0).toLocaleString('en-US')}
                                                                    </span>
                                                                    <span className="text-sm text-gray-400 line-through md:text-base">
                                                                        ₱{formattedPrice}
                                                                    </span>
                                                                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                                                                        -{promoPercent}%
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-base font-medium text-red-600 md:text-lg">
                                                                    ₱{Number(pkg.discounted_price || pkg.package_price).toLocaleString('en-US')}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Optional underline for selected state */}
                                                        {/* <span
    className={`absolute bottom-0 left-1/4 h-0.5 w-1/2 origin-center bg-red-500 transition-transform duration-300 
      ${selectedPackage === pkg.package_id 
        ? 'scale-x-100' 
        : 'scale-x-0 group-hover:scale-x-100'}
    `}
  ></span> */}
                                                    </div>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <p>No packages available.</p>
                                    )}
                                </ul>

                                {/* Related Services */}
                                {selectedPackage && relatedServices.length > 0 && (
                                    <div className="mt-6 flex w-full flex-col items-center gap-4 p-4">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                                            {relatedServices.map((service) => {
                                                const isChecked = selectedServices.includes(service.services_id);
                                                return (
                                                    <div
                                                        key={service.services_id}
                                                        onClick={() => handleServiceCheckboxChange(service.services_id)}
                                                        className={`relative w-[230px] cursor-pointer overflow-hidden rounded-2xl border shadow-md transition-all hover:shadow-xl ${
                                                            !isChecked ? 'opacity-50 grayscale' : ''
                                                        }`}
                                                    >
                                                        <div className="flex h-[230px] w-full items-center justify-center overflow-hidden bg-gray-100">
                                                            <img
                                                                src={service.image ? `/storage/${service.image}` : '/default-image.png'}
                                                                alt={service.service_name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col items-center justify-center bg-white p-4 text-center">
                                                            <CardTitle>{service.service_name}</CardTitle>
                                                            <CardDescription className="mt-1">
                                                                {service.description ||
                                                                    'This subcategory contains a variety of options to suit your needs.'}
                                                            </CardDescription>
                                                        </div>

                                                        {isChecked && (
                                                            <div className="absolute right-3 bottom-3 rounded-full bg-accent2 p-1">
                                                                <Check className="h-4 w-4 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div className="flex flex-col items-center">
                                <CardTitle className="heading-3 mb-5 font-heading">Select Event Date & Time</CardTitle>
                                <CardDescription>You should book your event a month before the event date!</CardDescription>
                                <div
                                    className={
                                        date
                                            ? 'grid grid-cols-1 flex-wrap gap-3 transition-all duration-500 ease-in-out md:grid-cols-2'
                                            : 'flex flex-wrap justify-center transition-all duration-500 ease-in-out'
                                    }
                                >
                                    <div className={date ? '' : 'flex justify-center'}>
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="mt-3 h-100 w-80 rounded-lg border lg:h-110 lg:w-90"
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

                                                    // const appointment = appointmentTimes[dayKey]?.some(
                                                    //     (t) =>
                                                    //         (slot.from >= t.from && slot.from < t.to) ||
                                                    //         (slot.to > t.from && slot.to <= t.to) ||
                                                    //         (slot.from <= t.from && slot.to >= t.to),
                                                    // );

                                                    return booked || blocked || servicebooked;
                                                });
                                                return fullyUnavailable;
                                            }}
                                        />
                                    </div>

                                    {date && (
                                        <div className="mt-6 w-full max-w-lg transform transition-all duration-500">
                                            <CardTitle className="mb-5 text-lg">Available Time Slots for {date.toDateString()}</CardTitle>

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

                                                                // const isAppointment =
                                                                //     appointmentTimes[dateKey]?.some(
                                                                //         (t) =>
                                                                //             (slot.from >= t.from && slot.from < t.to) ||
                                                                //             (slot.to > t.from && slot.to <= t.to) ||
                                                                //             (slot.from <= t.from && slot.to >= t.to),
                                                                //     ) ?? false;

                                                                const isUnavailable = isBooked || isBlocked || isServiceBooked;

                                                                const currentIdx = flatIdx++;

                                                                return (
                                                                    <Shadcn
                                                                        key={currentIdx}
                                                                        type="button"
                                                                        variant={
                                                                            isUnavailable
                                                                                ? 'ghost'
                                                                                : selectedSlot === currentIdx
                                                                                  ? 'brand2'
                                                                                  : 'outline'
                                                                        }
                                                                        className={`w-full p-2 text-sm md:w-auto ${isUnavailable ? 'cursor-not-allowed text-gray-400 line-through' : ''} `}
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
                            </div>
                        )}

                        {/* Step 2: Booking Info */}
                        {activeStep === 2 && (
                            <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
                                <CardTitle className="heading-3 mb-6 text-center font-heading">Fill out the Booking Form</CardTitle>

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
                                        {/* City/Town */}
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

                                        {/* <div className="flex flex-col">
                                        <div className="relative">
                                            <GlobeIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                            <Textarea
                                                id="others"
                                                placeholder="Other Details"
                                                value={data.others || ''}
                                                onChange={(e) => setData('others', e.target.value)}
                                                aria-invalid={!!errors.others}
                                                className="pl-9"
                                            />
                                        </div>
                                        <InputError message={errors.province} />
                                    </div> */}
                                    </div>
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
                                    {/* Email Input */}
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

                                    {/* Phone Input */}
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
                            </div>
                        )}

                        {/* Step 3: Review / Booking Summary */}
                        {activeStep === 3 && (
                            <>
                                <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row">
                                    {/* Left: Booking Details */}
                                    <div className="flex-1 space-y-6">
                                        <div className="rounded-xl border border-gray-200 bg-white p-8">
                                            <h2 className="mb-4 text-xl font-semibold text-gray-800">📃 Booking Summary</h2>

                                            {/* Selected Package */}
                                            <section className="border-b border-gray-100 pb-3">
                                                <p className="mb-1 text-sm text-gray-500">Selected Package</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {selectedPackage
                                                        ? packages.find((pkg) => pkg.package_id === selectedPackage)?.package_name
                                                        : 'None'}
                                                </p>
                                            </section>

                                            {/* Selected Services */}
                                            <section className="border-b border-gray-100 pt-3 pb-3">
                                                <p className="mb-1 text-sm text-gray-500">Services Included</p>
                                                <p className="text-base leading-relaxed font-medium text-gray-800">
                                                    {selectedServices.length > 0
                                                        ? relatedServices
                                                              .filter((s) => selectedServices.includes(s.services_id))
                                                              .map((s) => s.service_name)
                                                              .join(', ')
                                                        : 'None'}
                                                </p>
                                            </section>

                                            {/* Date & Time */}
                                            <section className="border-b border-gray-100 pt-3 pb-3">
                                                <p className="mb-1 text-sm text-gray-500">Date & Time</p>
                                                <p className="text-base font-medium text-gray-800">{data.datetime || 'Not selected'}</p>
                                            </section>

                                            {/* Event Details */}
                                            <section className="space-y-1 border-b border-gray-100 pt-3 pb-3">
                                                <p className="mb-1 text-sm text-gray-500">Event Details</p>
                                                <p className="text-base text-gray-800">
                                                    <strong>Name:</strong> {data.eventName || 'Not provided'}
                                                </p>
                                                <p className="text-base text-gray-800">
                                                    <strong>Guest Count:</strong> {data.guestCount || 'Not provided'}
                                                </p>
                                            </section>

                                            {/* Event Location */}
                                            <section className="border-b border-gray-100 pt-3 pb-3">
                                                <p className="mb-1 text-sm text-gray-500">Event Location</p>
                                                <p className="text-base text-gray-800">
                                                    {`${data.street || ''}, ${data.barangay || ''}, ${data.city || ''}, ${data.province || ''}`}
                                                </p>
                                            </section>

                                            {/* Special Requests */}
                                            <section className="pt-3">
                                                <label htmlFor="special-requests" className="mb-1 block text-sm font-medium text-gray-700">
                                                    Special Requests
                                                </label>
                                                <Textarea
                                                    id="special-requests"
                                                    className="mt-1 resize-none border-gray-200 text-gray-800 focus:border-blue-400 focus:ring-0"
                                                    placeholder="Add any special requests or customization details here..."
                                                    value={data.specialRequests || ''}
                                                    onChange={(e) => setData('specialRequests', e.target.value)}
                                                    aria-invalid={!!errors.specialRequests}
                                                />
                                                <InputError message={errors.specialRequests} />
                                            </section>

                                            {/* Contact Info */}
                                            <section className="space-y-1 pt-6">
                                                <p className="mb-1 text-sm text-gray-500">Contact Information</p>
                                                <p className="text-base text-gray-800">
                                                    <strong>Full Name:</strong> {data.fullName || 'Not provided'}
                                                </p>
                                                <p className="text-base text-gray-800">
                                                    <strong>Email:</strong> {data.email || 'Not provided'}
                                                </p>
                                                <p className="text-base text-gray-800">
                                                    <strong>Phone:</strong> {data.phone || 'Not provided'}
                                                </p>
                                            </section>
                                        </div>
                                    </div>

                                    {/* Mobile Price Summary (collapsible) */}
                                    <div className="mb-4 w-full md:hidden">
                                        {(() => {
                                            const selectedPackageId = selectedPackage ?? '';
                                            const pkg = packages.find((pkg) => pkg.package_id === selectedPackageId);
                                            const promoPercent = pkg?.package_promo || 0;
                                            const originalPrice = pkg?.package_price || 0;
                                            const discountedPrice =
                                                pkg?.discounted_price ||
                                                (promoPercent ? originalPrice - originalPrice * (promoPercent / 100) : originalPrice);

                                            return (
                                                <details className="rounded-xl border bg-white p-4">
                                                    <summary className="font-medium">
                                                        Price & Policy - ₱{Number(discountedPrice).toLocaleString('en-US')}
                                                    </summary>
                                                    <div className="mt-2 text-sm text-gray-700">
                                                        <p>Total Amount Due: ₱{Number(discountedPrice).toLocaleString('en-US')}</p>
                                                        <p className="mt-2">
                                                            Tax & Fees Included. Cancellations or modifications can be made 24 hours before the event.
                                                        </p>
                                                    </div>
                                                    {/* Agreement Options */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                id="agree-terms"
                                                                checked={agreeTerms}
                                                                onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                                                            />
                                                            <Label htmlFor="agree-terms" className="text-gray-700">
                                                                I agree to the shop’s terms.
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                id="email-reminders"
                                                                checked={emailReminders}
                                                                onCheckedChange={(checked) => setEmailReminders(!!checked)}
                                                            />
                                                            <Label htmlFor="email-reminders" className="text-gray-700">
                                                                Email me announcements and reminders.
                                                            </Label>
                                                        </div>
                                                    </div>

                                                    {/* Terms */}
                                                    <div className="pt-4 text-sm leading-relaxed text-gray-500">
                                                        By proceeding, you agree to our{' '}
                                                        <TermsAndConditionsDialog
                                                            trigger={
                                                                <span className="cursor-pointer text-blue-500 underline">Terms & Conditions</span>
                                                            }
                                                        />{' '}
                                                        .
                                                    </div>
                                                </details>
                                            );
                                        })()}
                                    </div>

                                    {/* Right: Price & Policy */}
                                    <div className="hidden w-full space-y-6 md:block md:w-1/3">
                                        <div className="rounded-xl border border-gray-200 bg-white p-8">
                                            <h2 className="mb-4 text-xl font-semibold text-gray-800">💸 Price & Policy</h2>

                                            {/* Summary */}
                                            <p className="mb-3 text-gray-600">1 Package / {selectedServices.length} Services</p>

                                            {/* Price Breakdown */}
                                            {(() => {
                                                const selectedPackageId = selectedPackage ?? '';
                                                const pkg = packages.find((pkg) => pkg.package_id === selectedPackageId);
                                                const promoPercent = pkg?.package_promo || 0;
                                                const originalPrice = pkg?.package_price || 0;
                                                const discountedPrice = pkg?.discounted_price || originalPrice;

                                                return (
                                                    <div className="space-y-1 text-gray-800">
                                                        {promoPercent > 0 ? (
                                                            <>
                                                                <p>Original Price: ₱{originalPrice.toLocaleString()}</p>
                                                                <p>
                                                                    Discount ({promoPercent}%): -₱
                                                                    {Number(originalPrice - discountedPrice).toLocaleString('en-US')}
                                                                </p>
                                                                <p className="mt-2 text-lg font-semibold text-green-700">
                                                                    Total Amount Due: ₱{Number(discountedPrice).toLocaleString('en-US')}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-lg font-semibold text-green-700">
                                                                Total Amount Due: ₱{Number(discountedPrice).toLocaleString('en-US')}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            <div className="my-6 border-t border-gray-100" />

                                            {/* Policy Note */}
                                            <p className="text-sm leading-relaxed text-gray-500">
                                                Tax & Fees Included. Cancellations or modifications can be made 24 hours before the event. All
                                                bookings must be confirmed.
                                            </p>

                                            <div className="my-6 border-t border-gray-100" />

                                            {/* Agreement Options */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="agree-terms"
                                                        checked={agreeTerms}
                                                        onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                                                    />
                                                    <Label htmlFor="agree-terms" className="text-gray-700">
                                                        I agree to the shop’s terms.
                                                    </Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="email-reminders"
                                                        checked={emailReminders}
                                                        onCheckedChange={(checked) => setEmailReminders(!!checked)}
                                                    />
                                                    <Label htmlFor="email-reminders" className="text-gray-700">
                                                        Email me announcements and reminders.
                                                    </Label>
                                                </div>
                                            </div>

                                            {/* Terms */}
                                            <div className="pt-4 text-sm leading-relaxed text-gray-500">
                                                By proceeding, you agree to our{' '}
                                                <TermsAndConditionsDialog
                                                    trigger={<span className="cursor-pointer text-blue-500 underline">Terms & Conditions</span>}
                                                />{' '}
                                                .
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 4: Payment */}
                        {activeStep === 4 && (
                            <>
                                <div className="flex flex-col items-center">
                                    <CardTitle className="heading-3 mb-5 font-heading">Down Payment</CardTitle>

                                    {/* Dynamic Layout */}
                                    <div
                                        className={`mt-6 w-full ${
                                            paymentMethod === '2' ? 'grid grid-cols-1 gap-6 md:grid-cols-2' : 'flex justify-center'
                                        }`}
                                    >
                                        {/* Column 1: Payment Method + Summary */}
                                        <div className="space-y-2">
                                            {/* Track selected payment */}
                                            <RadioGroup className="gap-2" defaultValue="1" onValueChange={(value) => setPaymentMethod(value)}>
                                                <Label>Select Payment Method</Label>
                                                {/* Radio card #1 */}
                                                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                                                    <RadioGroupItem
                                                        value="1"
                                                        id={`${id}-1`}
                                                        aria-describedby={`${id}-1-description`}
                                                        className="order-1 after:absolute after:inset-0"
                                                    />
                                                    <div className="flex grow items-start gap-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="30"
                                                            height="30"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="lucide lucide-hand-coins-icon lucide-hand-coins"
                                                        >
                                                            {' '}
                                                            <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />{' '}
                                                            <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />{' '}
                                                            <path d="m2 16 6 6" /> <circle cx="16" cy="9" r="2.9" />{' '}
                                                            <circle cx="6" cy="5" r="3" />{' '}
                                                        </svg>
                                                        <div className="grid grow gap-2">
                                                            <Label htmlFor={`${id}-1`}>
                                                                Cash on Hand{' '}
                                                                <span className="text-xs font-normal text-muted-foreground">
                                                                    (Pay with physical cash)
                                                                </span>
                                                            </Label>
                                                            <p id={`${id}-1-description`} className="text-xs text-muted-foreground">
                                                                Pay the amount directly in cash upon appointment.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Radio card #2 */}
                                                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                                                    <RadioGroupItem
                                                        value="2"
                                                        id={`${id}-2`}
                                                        aria-describedby={`${id}-2-description`}
                                                        className="order-1 after:absolute after:inset-0"
                                                    />
                                                    <div className="flex grow items-start gap-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="30"
                                                            height="30"
                                                            viewBox="0 0 192 192"
                                                            fill="none"
                                                        >
                                                            <path
                                                                stroke="#000000"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="12"
                                                                d="M84 96h36c0 19.882-16.118 36-36 36s-36-16.118-36-36 16.118-36 36-36c9.941 0 18.941 4.03 25.456 10.544"
                                                            />
                                                            <path
                                                                fill="#000000"
                                                                d="M145.315 66.564a6 6 0 0 0-10.815 5.2l10.815-5.2ZM134.5 120.235a6 6 0 0 0 10.815 5.201l-10.815-5.201Zm-16.26-68.552a6 6 0 1 0 7.344-9.49l-7.344 9.49Zm7.344 98.124a6 6 0 0 0-7.344-9.49l7.344 9.49ZM84 152c-30.928 0-56-25.072-56-56H16c0 37.555 30.445 68 68 68v-12ZM28 96c0-30.928 25.072-56 56-56V28c-37.555 0-68 30.445-68 68h12Zm106.5-24.235C138.023 79.09 140 87.306 140 96h12c0-10.532-2.399-20.522-6.685-29.436l-10.815 5.2ZM140 96c0 8.694-1.977 16.909-5.5 24.235l10.815 5.201C149.601 116.522 152 106.532 152 96h-12ZM84 40c12.903 0 24.772 4.357 34.24 11.683l7.344-9.49A67.733 67.733 0 0 0 84 28v12Zm34.24 100.317C108.772 147.643 96.903 152 84 152v12a67.733 67.733 0 0 0 41.584-14.193l-7.344-9.49Z"
                                                            />
                                                            <path
                                                                stroke="#000000"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="12"
                                                                d="M161.549 58.776C166.965 70.04 170 82.666 170 96c0 13.334-3.035 25.96-8.451 37.223"
                                                            />
                                                        </svg>
                                                        <div className="grid grow gap-2">
                                                            <Label htmlFor={`${id}-2`}>
                                                                GCash{' '}
                                                                <span className="text-xs font-normal text-muted-foreground">(Mobile Wallet)</span>
                                                            </Label>
                                                            <p id={`${id}-2-description`} className="text-xs text-muted-foreground">
                                                                Pay quickly and securely using your GCash mobile wallet.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </RadioGroup>

                                            {/* Payment Summary */}
                                            <Card className="mt-2">
                                                <CardContent>
                                                    <CardTitle className="mb-4">Payment Summary</CardTitle>
                                                    <CardDescription className="mb-2 italic">
                                                        1 Package / {selectedServices.length} Services
                                                    </CardDescription>

                                                    {(() => {
                                                        const selectedPackageId = selectedPackage ?? '';
                                                        const pkg = packages.find((pkg) => pkg.package_id === selectedPackageId);
                                                        const promoPercent = pkg?.package_promo || 0;
                                                        const originalPrice = pkg?.package_price || 0;
                                                        const calculatedDiscountedPrice = pkg?.discounted_price || 0;

                                                        return (
                                                            <div className="space-y-3">
                                                                <hr />
                                                                {promoPercent > 0 ? (
                                                                    <>
                                                                        <CardDescription>
                                                                            Original Price: ₱{originalPrice.toLocaleString('en-US')}
                                                                        </CardDescription>
                                                                        <CardDescription>
                                                                            Discount ({promoPercent}%): -₱
                                                                            {Number(originalPrice - calculatedDiscountedPrice).toLocaleString(
                                                                                'en-US',
                                                                            )}
                                                                        </CardDescription>
                                                                        <hr />
                                                                        <CardHeader>
                                                                            <b>Total Amount Due: </b>
                                                                            <span className="text-red-700">
                                                                                ₱{Number(calculatedDiscountedPrice).toLocaleString('en-US')}
                                                                            </span>
                                                                        </CardHeader>
                                                                        <hr />
                                                                        <CardHeader>
                                                                            <b>Down Payment (50%): </b>
                                                                            <span className="text-green-700">
                                                                                ₱{Number(calculatedDiscountedPrice / 2).toLocaleString('en-US')}
                                                                            </span>
                                                                            <CardDescription>
                                                                                Please pay the down payment to confirm your booking.
                                                                            </CardDescription>
                                                                        </CardHeader>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CardDescription>
                                                                            Package Price: ₱{originalPrice.toLocaleString('en-US')}
                                                                        </CardDescription>
                                                                        <hr />
                                                                        <CardHeader>
                                                                            <b>Total Amount Due: </b>
                                                                            <span className="text-red-700">
                                                                                ₱{originalPrice.toLocaleString('en-US')}
                                                                            </span>
                                                                        </CardHeader>
                                                                        <hr />
                                                                        <CardHeader>
                                                                            <b>Down Payment (50%): </b>
                                                                            <span className="text-green-700">
                                                                                ₱{Number(originalPrice / 2).toLocaleString('en-US')}
                                                                            </span>
                                                                            <CardDescription>
                                                                                Please pay the down payment to confirm your booking.
                                                                            </CardDescription>
                                                                        </CardHeader>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Column 2: GCash Payment (only show if selected) */}
                                        {paymentMethod === '2' && (
                                            <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
                                                <div>
                                                    <CardTitle className="mb-2">GCash Payment</CardTitle>
                                                    <CardDescription>Scan the QR code below to pay using GCash.</CardDescription>

                                                    <img
                                                        src="http://localhost:8000/storage/Gcash-BMA-QRcode.jpg"
                                                        alt="Payment QR Code"
                                                        loading="lazy"
                                                        className="mt-4 w-full object-contain"
                                                    />

                                                    <Label className="mt-4 ml-5">GCash Number: 09465482759</Label>
                                                </div>

                                                <div className="mt-0 lg:mt-20">
                                                    <div className="mt-4">
                                                        <Label>Input Reference Number</Label>
                                                        <Input
                                                            type="text"
                                                            required
                                                            placeholder="Reference No."
                                                            value={data.reference_no || ''}
                                                            onChange={(e) => setData('reference_no', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="mt-4">
                                                        <Label>Upload Payment Screenshot</Label>
                                                        <Input
                                                            type="file"
                                                            required
                                                            onChange={(e) => setData('payment_proof', e.target.files?.[0] || null)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </Box>

                    <MobileStepper
                        variant="dots"
                        steps={steps.length}
                        position="static"
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'white',
                            borderTop: '1px solid #e5e7eb',
                            zIndex: 10,
                            px: 2,
                            py: 1,
                        }}
                        activeStep={activeStep}
                        nextButton={
                            <>
                                {activeStep < steps.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (validateStep(activeStep)) {
                                                setActiveStep((prev) => prev + 1);
                                            } else if (activeStep === 0) {
                                                if (selectedPackage && selectedServices.length < 0) return;
                                            } else if (activeStep === 1) {
                                                if (!!date && selectedSlot !== null) return;
                                            } else if (activeStep === 3) {
                                                if (!agreeTerms || !emailReminders) return;
                                            } else if (activeStep === 4) {
                                                if (paymentMethod === '2') {
                                                    if (!data.reference_no || !data.payment_proof) return;
                                                }
                                            }
                                        }}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <>
                                        {/* Only render Dialog for confirm or verify steps */}
                                        {(step === 'confirm' || step === 'verify') && (
                                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Shadcn variant="default" type="button">
                                                        Submit Booking
                                                    </Shadcn>
                                                </DialogTrigger>

                                                <DialogContent className="pointer-events-auto z-[1000]" style={{ overflow: 'visible' }}>
                                                    {step === 'confirm' && (
                                                        <>
                                                            <DialogHeader>
                                                                <DialogTitle>Are you sure?</DialogTitle>
                                                                <DialogDescription>
                                                                    Please confirm your booking details before proceeding.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Shadcn variant="secondary">No</Shadcn>
                                                                </DialogClose>
                                                                <Shadcn
                                                                    variant="default"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (paymentMethod === '2' && (!data.reference_no || !data.payment_proof)) {
                                                                            toast.error('You must input Reference No. and the payment proof.');
                                                                            return;
                                                                        }
                                                                        handleConfirmClick();
                                                                    }}
                                                                >
                                                                    Yes
                                                                </Shadcn>
                                                            </DialogFooter>
                                                        </>
                                                    )}

                                                    {step === 'verify' && (
                                                        <div className="relative">
                                                            <motion.div
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 400,
                                                                    damping: 20,
                                                                    duration: 0.5,
                                                                }}
                                                                className="absolute -top-16 left-1/2 z-10 -translate-x-1/2"
                                                            >
                                                                <img
                                                                    src={`/storage/Home Page (1) 1.png`}
                                                                    alt="Booking Verified"
                                                                    className="h-24 w-24 object-contain"
                                                                />
                                                            </motion.div>

                                                            <DialogHeader className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
                                                                <DialogTitle className="text-2xl font-semibold text-emerald-500">
                                                                    Booking Submitted!
                                                                </DialogTitle>

                                                                <strong className="text-gray-700">Verify Email</strong>
                                                                <p className="text-gray-600">{bookingData?.booking?.contact_email}</p>

                                                                <DialogDescription className="mb-4 text-center text-gray-500">
                                                                    We've sent a verification email to the address you provided.
                                                                    <br />
                                                                    {/* 💌 Animated Envelope */}
                                                                    <motion.div
                                                                        initial={{ y: 20, opacity: 0 }}
                                                                        animate={{ y: 0, opacity: 1 }}
                                                                        transition={{
                                                                            delay: 0.3,
                                                                            duration: 0.8,
                                                                            ease: 'easeOut',
                                                                        }}
                                                                        className="mt-2 flex justify-center"
                                                                    >
                                                                        <img
                                                                            src={`/storage/Home Page (2) 1.png`}
                                                                            alt="Booking Verified"
                                                                            className="h-25 w-40 object-contain"
                                                                        />
                                                                    </motion.div>
                                                                    Please check your inbox and click the verification link to confirm your email.
                                                                    Once verified, you'll be able to receive notifications and reminders regarding
                                                                    your booking.
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            <DialogFooter>
                                                                <div className="flex w-full flex-col items-center justify-center gap-3">
                                                                    <Shadcn
                                                                        type="button"
                                                                        className="text-brand-primary mb-4 cursor-pointer"
                                                                        variant="secondary"
                                                                        disabled={resending}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            resendVerification();
                                                                        }}
                                                                    >
                                                                        {resending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                                        Resend verification email
                                                                    </Shadcn>

                                                                    <TextLink href={route('home.index')} className="text-sm">
                                                                        Proceed to Home
                                                                    </TextLink>
                                                                </div>
                                                            </DialogFooter>
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {/* ReCAPTCHA modal */}
                                        {step === 'recaptcha' && (
                                            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
                                                <div className="relative w-[400px] rounded-lg bg-white p-6 shadow-lg">
                                                    <div className="mb-4 flex flex-col items-center gap-3 text-center">
                                                        <h3 className="text-lg font-semibold">Verify You're Human</h3>
                                                        <p>Please complete the reCAPTCHA to proceed with your booking.</p>
                                                    </div>

                                                    <ReCAPTCHA
                                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                                        onChange={(token: string | null) => setCaptchaToken(token)}
                                                    />

                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Shadcn
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setStep('confirm');
                                                                setCaptchaToken(null);
                                                                setSubmitting(false);
                                                            }}
                                                        >
                                                            Cancel
                                                        </Shadcn>
                                                        <Shadcn
                                                            disabled={!captchaToken || processing || submitting}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleSubmit(e);
                                                            }}
                                                        >
                                                            Confirm
                                                            {(processing || submitting) && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                                                        </Shadcn>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        }
                        backButton={
                            <Button onClick={() => setActiveStep((prev) => prev - 1)} disabled={activeStep === 0}>
                                Back
                            </Button>
                        }
                        className="mt-3"
                    />
                </form>
            </Box>
        </>
    );
}
