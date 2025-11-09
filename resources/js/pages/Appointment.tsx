'use client';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button as Shadcn } from '@/components/ui/button-shad';
import { CardTitle } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Toaster } from '@/components/ui/sonner';
import Tags, { Tag } from '@/components/ui/tag';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { router, useForm, usePage } from '@inertiajs/react';
import { Box, Button, MobileStepper, Step, StepButton, StepConnector, StepIconProps, StepLabel, Stepper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import React, { useEffect, useId, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';

const steps = ['Purpose', 'Date & Time', 'Information', 'Review']; // Updated steps

interface AppointmentTime {
    //Booking times props
    from: string;
    to: string;
    status: string;
}

interface PageProps extends InertiaPageProps {
    // bookedTimes: Record<string, BookingTime[]>;
    appointmentTimes: Record<string, AppointmentTime[]>;
}

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
    const { flash } = usePage<{
        flash: { success?: { message: string; appointment?: { appointment_id: string; contact_email: string } }; error?: string; message?: string };
    }>().props;
    const [appointmentData, setAppointmentData] = useState<{
        message: string;
        appointment?: { appointment_id: string; contact_email: string };
    } | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (flash.success) {
            setAppointmentData(flash.success);
            setStep('verify');
            setDialogOpen(true);
        }
        if (flash.error) toast.error(flash.error);
        if (flash.message) toast.info(flash.message);
    }, [flash.success, flash.error, flash.message]);

    useEffect(() => {
        if ((window as any).Echo) {
            const channel = (window as any).Echo.channel('appointments');
            channel.listen('.appointment.created', () => {
                router.reload({ only: ['appointmentTimes'] });
            });
            channel.listen('.appointment.live.update', () => {
                router.reload({ only: ['appointmentTimes'] });
            });

            return () => {
                channel.stopListening('.appointment.created');
                channel.stopListening('.appointment.live.update');
            };
        }
    }, []);

    const { bookedTimes = {}, appointmentTimes = {} } = usePage<PageProps>().props;
    const [activeStep, setActiveStep] = useState(0);
    const [step, setStep] = useState<'confirm' | 'recaptcha' | 'verify' | 'success'>('confirm');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<any>(null);
    const { data, setData, post, processing, errors } = useForm<{
        purposeTags: string[];
        datetime: string;
        fullName: string;
        email: string;
        phone: string;
    }>({
        purposeTags: [],
        datetime: '',
        fullName: '',
        email: '',
        phone: '',
    });

    // Appointment slots
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

    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = appointmentSlots[selectedSlot];
            setData('datetime', `${formatLocalDate(date)} ${slot.from}-${slot.to}`);
        }
    }, [date, selectedSlot]);

    useEffect(() => {
        setSelectedSlot(null);
        setData('datetime', '');
    }, [date]);

    const handleStep = (step: number) => () => setActiveStep(step);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (dialogOpen) return;

        if (!captchaToken) {
            toast.error('Please complete the reCAPTCHA.');
            return;
        }

        setData((prev) => ({
            ...prev,
            captcha_token: captchaToken,
        }));

        post(route('appointments.store'), {
            onSuccess: () => setStep('success'),
        });
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                return Array.isArray(data.purposeTags) && data.purposeTags.length > 0;
            case 1:
                return !!date && selectedSlot !== null;
            case 2:
                return [data.fullName, data.email, data.phone].every((field) => !!field);
            case 3:
                return true;
            default:
                return true;
        }
    };

    const id = useId();
    // Responsive Stepper orientation and container sizing
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down('sm'));
    const stepperOrientation = isSm ? 'vertical' : 'horizontal';

    return (
        <>
            <Shadcn variant="ghost" onClick={() => router.get(route('home.index'))} className="mt-10 ml-4 md:ml-10 mb-0 underline underline-offset-4">
                <ChevronLeft /> Back to Home
            </Shadcn>
        <Box sx={{ width: { xs: '100%', sm: '94%', md: '85%', lg: '80%' }, p: 3, mx: 'auto' }}>
            {/* Stepper Navigation */}
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

            <form id="appointmentForm" onSubmit={handleSubmit} className="pb-20">
                <Box sx={{ minHeight: '150px' }}>
                    {/* Step 0: Input Purpose */}
                    {activeStep === 0 && (
                        <div className="flex flex-col items-center">
                            <CardTitle className="mb-6 text-2xl md:text-4xl">Purpose of Appointment</CardTitle>
                            <div className="w-full max-w-lg">
                                <Label htmlFor="purpose">Purpose</Label>
                                <Tags
                                    value={data.purposeTags.map((text) => ({ id: text, text }))}
                                    onChange={(newTags: Tag[]) =>
                                        setData(
                                            'purposeTags',
                                            newTags.map((t) => t.text),
                                        )
                                    }
                                    ariaInvalid={!!errors.purposeTags}
                                />
                                <InputError message={errors.purposeTags} />
                            </div>
                            <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-7">
                                <div className="flex flex-wrap justify-center gap-3 md:col-span-7">
                                    {['Rent', 'Gown', 'Suit', 'Make-Up', 'Catering', 'Inquire', 'Follow-ups'].map((purpose) => (
                                        <Shadcn
                                            key={purpose}
                                            className="w-auto"
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                // Check if the string already exists
                                                if (!data.purposeTags.includes(purpose)) {
                                                    setData('purposeTags', [...data.purposeTags, purpose]);
                                                }
                                            }}
                                        >
                                            {purpose}
                                        </Shadcn>
                                    ))}
                                </div>

                                <div className="flex flex-wrap justify-center gap-3 md:col-span-7">
                                    {['Design Consultation', 'Venue Decoration', 'Church Decoration'].map((purpose) => (
                                        <Shadcn
                                            key={purpose}
                                            className="w-auto"
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                // Check if the string already exists
                                                if (!data.purposeTags.includes(purpose)) {
                                                    setData('purposeTags', [...data.purposeTags, purpose]);
                                                }
                                            }}
                                        >
                                            {purpose}
                                        </Shadcn>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Date & Time (unchanged) */}
                    {activeStep === 1 && (
                        <div className="flex flex-col items-center">
                            <CardTitle className="mb-5 text-2xl md:text-4xl">Select Appointment Date & Time</CardTitle>
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
                                        className="mt-3 h-115 w-full lg:w-100 rounded-lg border"
                                        captionLayout="dropdown"
                                        disabled={(day) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (day < today) return true;

                                            const dayKey = formatLocalDate(day);

                                            const fullyBooked = appointmentSlots.every((slot) => {
                                                // const booked = bookedTimes[dayKey]?.some(
                                                //     (t) =>
                                                //         (slot.from >= t.from && slot.from < t.to) ||
                                                //         (slot.to > t.from && slot.to <= t.to) ||
                                                //         (slot.from <= t.from && slot.to >= t.to),
                                                // );

                                                const appointment = appointmentTimes[dayKey]?.some(
                                                    (t) =>
                                                        (slot.from >= t.from && slot.from < t.to) ||
                                                        (slot.to > t.from && slot.to <= t.to) ||
                                                        (slot.from <= t.from && slot.to >= t.to),
                                                );

                                                return appointment;
                                            });

                                            return fullyBooked;
                                        }}
                                    />
                                </div>
                                {date && (
                                    <div className="mt-6 w-full max-w-lg transform transition-all duration-500">
                                        <CardTitle className="mb-5 text-lg">Appointment Slots {date.toDateString()}</CardTitle>

                                        <div className="mt-2 grid grid-cols-1 gap-2">
                                            {appointmentSlots.map((slot, idx) => {
                                                const dateKey = formatLocalDate(date!);
                                                // const isBooked =
                                                //     bookedTimes[dateKey]?.some(
                                                //         (t) =>
                                                //             (slot.from >= t.from && slot.from < t.to) ||
                                                //             (slot.to > t.from && slot.to <= t.to) ||
                                                //             (slot.from <= t.from && slot.to >= t.to),
                                                //     ) ?? false;

                                                const isAppointment =
                                                    appointmentTimes[dateKey]?.some(
                                                        (t) =>
                                                            (slot.from >= t.from && slot.from < t.to) ||
                                                            (slot.to > t.from && slot.to <= t.to) ||
                                                            (slot.from <= t.from && slot.to >= t.to),
                                                    ) ?? false;

                                                return (
                                                    <Shadcn
                                                        key={idx}
                                                        type="button"
                                                        variant={isAppointment ? 'ghost' : selectedSlot === idx ? 'secondary' : 'outline'}
                                                        className={`${isAppointment ? 'cursor-not-allowed text-gray-400 line-through' : 'cursor-pointer'}`}
                                                        disabled={isAppointment}
                                                        onClick={() => {
                                                            if (!isAppointment) {
                                                                setSelectedSlot(idx);
                                                            }
                                                        }}
                                                    >
                                                        {formatTo12Hour(slot.from)}
                                                    </Shadcn>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Booking Info (unchanged) */}
                    {activeStep === 2 && (
                        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
                            <CardTitle className="mb-6 text-2xl md:text-4xl">Fill out the Appointment Form</CardTitle>
                            {/* Contact Information */}
                            <div className="mb-6 w-full">
                                <Label className="mb-2">Contact Information</Label>
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    value={data.fullName || ''}
                                    onChange={(e) => setData('fullName', e.target.value)}
                                    aria-invalid={!!errors.fullName}
                                    className="mb-3"
                                />
                                <InputError message={errors.fullName} />
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    value={data.email || ''}
                                    onChange={(e) => setData('email', e.target.value)}
                                    aria-invalid={!!errors.email}
                                    className="mb-3"
                                />
                                <InputError message={errors.email} />
                                <Input
                                    placeholder="Phone Number"
                                    value={data.phone || ''}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    aria-invalid={!!errors.phone}
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review / Booking Summary (unchanged) */}
                    {activeStep === 3 && (
                        <div className="flex flex-col items-center justify-center px-6 py-10">
                            {/* Title */}
                            <CardTitle className="mb-8 text-center text-2xl md:text-4xl">Review Appointment</CardTitle>

                            <div className="w-full max-w-xl">
                                {/* Section Header */}
                                <h2 className="mb-4 text-xl font-semibold text-gray-700">Your Appointment</h2>

                                {/* Appointment Details */}
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <span className="font-medium text-gray-800">Purpose:</span>{' '}
                                        {data.purposeTags.length > 0 ? data.purposeTags.join(', ') : 'Not provided'}
                                    </p>

                                    <p>
                                        <span className="font-medium text-gray-800">Date & Time:</span> {data.datetime || 'Not selected'}
                                    </p>
                                </div>

                                {/* Contact Section */}
                                <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-700">Contact Information</h3>

                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <span className="font-medium text-gray-800">Full Name:</span> {data.fullName || 'Not provided'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-800">Email:</span> {data.email || 'Not provided'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-800">Phone:</span> {data.phone || 'Not provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </Box>

                {/* Navigation Buttons */}
                <MobileStepper
                    variant="dots"
                    steps={steps.length}
                    position="bottom"
                    activeStep={activeStep}
                    nextButton={
                        activeStep < steps.length - 1 ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (validateStep(activeStep)) {
                                        setActiveStep((prev) => prev + 1);
                                    } else {
                                        toast.error('Please complete all required fields before proceeding.');
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
                                                Submit Appointment
                                            </Shadcn>
                                        </DialogTrigger>

                                        <DialogContent className="pointer-events-auto z-[1000]" style={{ overflow: 'visible' }}>
                                            {step === 'confirm' && (
                                                <>
                                                    <DialogHeader>
                                                        <DialogTitle>Are you sure?</DialogTitle>
                                                        <DialogDescription>
                                                            Please confirm your appointment details before proceeding.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Shadcn variant="secondary">No</Shadcn>
                                                        </DialogClose>
                                                        <Shadcn variant="default" type="button" onClick={() => setStep('recaptcha')}>
                                                            Yes
                                                        </Shadcn>
                                                    </DialogFooter>
                                                </>
                                            )}

                                            {step === 'verify' && (
                                                <div className="relative flex flex-col items-center text-center">
                                                    {/* ✅ Floating Check Icon */}
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 400,
                                                            damping: 20,
                                                            duration: 0.5,
                                                        }}
                                                        className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 rounded-full"
                                                    >
                                                        <img
                                                            src={`/storage/Home Page (1) 1.png`}
                                                            alt="Appointment Verified"
                                                            className="h-24 w-24 object-contain"
                                                        />
                                                    </motion.div>

                                                    {/* Dialog Content */}
                                                    <div className="mt-20 w-full max-w-md px-4">
                                                        <DialogHeader className="flex flex-col items-center justify-center gap-4 text-center">
                                                            <DialogTitle className="text-2xl font-semibold text-emerald-500">
                                                                Appointment Submitted!
                                                            </DialogTitle>
                                                            <motion.div
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{
                                                                    delay: 0.3,
                                                                    duration: 0.8,
                                                                    ease: 'easeOut',
                                                                }}
                                                                className="mt-4 flex justify-center"
                                                            >
                                                                <img
                                                                    src={`/storage/Home Page (2) 1.png`}
                                                                    alt="Email Sent"
                                                                    className="h-24 w-40 object-contain"
                                                                />
                                                            </motion.div>
                                                            <DialogDescription className="leading-relaxed text-gray-600">
                                                                Your appointment request has been submitted successfully. Please be on time for your scheduled date.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <DialogFooter>
                                                            <div className="mt-6 w-full justify-center">
                                                                <TextLink href={route('home.index')} className="text-sm">
                                                                    Proceed to Home
                                                                </TextLink>
                                                            </div>
                                                        </DialogFooter>
                                                    </div>
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
                                                <p>Please complete the reCAPTCHA to submit your appointment.</p>
                                            </div>

                                            <ReCAPTCHA
                                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                                onChange={(token: string | null) => setCaptchaToken(token)}
                                            />

                                            <div className="mt-4 flex justify-end gap-2">
                                                <Shadcn variant="secondary" onClick={() => setStep('confirm')}>
                                                    Cancel
                                                </Shadcn>
                                                <Shadcn
                                                    variant="default"
                                                    onClick={() => {
                                                        if (!captchaToken) {
                                                            toast.error('Please complete the reCAPTCHA.');
                                                            return;
                                                        }
                                                        setData((prev) => ({
                                                            ...prev,
                                                            captcha_token: captchaToken,
                                                        }));
                                                        post(route('appointments.store'), {
                                                            onSuccess: () => setStep('verify'),
                                                        });
                                                    }}
                                                    disabled={processing}
                                                >
                                                    Submit
                                                </Shadcn>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )
                    }
                    backButton={
                        <Button onClick={() => setActiveStep((prev) => prev - 1)} disabled={activeStep === 0}>
                            Back
                        </Button>
                    }
                    sx={{ mt: 3 }}
                />
            </form>
        </Box>
        </>
    );
}
