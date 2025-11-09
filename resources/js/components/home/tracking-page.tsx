'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';
const steps = [
    {
        step: 1,
        title: 'Event Booking',
    },
    {
        step: 2,
        title: 'Event Day',
    },
    {
        step: 3,
        title: 'Completed',
    },
];

export default function TrackingPage() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const { data, setData, post, processing, reset } = useForm({
        transaction_number: '',
        'g-recaptcha-response': '',
    });
    const [booking, setBooking] = useState<any>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<any>(null);

    // Message dialog form
    const {
        data: messageData,
        setData: setMessageData,
        post: postMessage,
        processing: messageProcessing,
        reset: resetMessage,
    } = useForm({
        subject: '',
        message: '',
        booking_id: null as number | null,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaToken) {
            alert('Please complete the reCAPTCHA.');
            return;
        }

        setData('g-recaptcha-response', captchaToken);

        post(route('booking.track.lookup'), {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setBooking(page.props.booking || null);
                reset();
                recaptchaRef.current?.reset();
                setCaptchaToken(null);
            },
            onError: () => {
                recaptchaRef.current?.reset();
                setCaptchaToken(null);
            },
        });
    };



    const handleMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;

        router.post(
            route('messages.public.store'),
            {
                subject: messageData.subject,
                message: messageData.message,
                booking_id: booking.booking_id,
            },
            {
                onSuccess: () => {
                    resetMessage();
                    setIsDialogOpen(false);
                },
                onError: () => {
                    alert('Failed to send message. Please try again.');
                },
            },
        );
    };

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-grow">
                <div className="relative overflow-hidden">
                    <div className="relative z-10 container mx-auto mt-20 flex h-full flex-col items-center justify-center px-4 pt-12">
                        <h1 className="heading-3 mb-8 text-center font-heading">Track your Event</h1>
                        <form className="mb-12 w-full max-w-2xl" onSubmit={handleSubmit}>
                            <div className="relative font-body">
                                <input
                                    type="text"
                                    placeholder="Enter your tracking number"
                                    value={data.transaction_number}
                                    onChange={(e) => setData('transaction_number', e.target.value)}
                                    className="w-full rounded-full border-2 border-gray-200 px-6 py-4 text-gray-800 shadow-lg transition-all duration-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!captchaToken || processing}
                                    className="absolute top-1/2 right-2 flex -translate-y-1/2 transform items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:from-pink-600 hover:to-purple-700"
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Track
                                </button>
                            </div>
                            {data.transaction_number.trim() && (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <p className="text-sm text-gray-600">Security Check</p>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                        onChange={(token: string | null) => setCaptchaToken(token)}
                                    />
                                </div>
                            )}
                        </form>
                        <div className="w-full max-w-4xl">
                            {/* Booking details */}
                            {booking &&
                                (() => {
                                    const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
                                    const eventDate = booking.event_date;
                                    let stepValue = 1;

                                    // Step logic
                                    if (booking.status === 'completed') {
                                        stepValue = 3;
                                    } else if (today === eventDate) {
                                        stepValue = 2;
                                    } else if (booking.status === 'confirmed' || booking.status === 'pending') {
                                        stepValue = 1;
                                    }

                                    return (
                                        <Stepper value={stepValue} orientation="horizontal" className="space-x-8">
                                            {steps.map(({ step, title }) => (
                                                <StepperItem
                                                    key={step}
                                                    step={step}
                                                    completed={step < stepValue}
                                                    className="not-last:flex-1 max-md:items-start"
                                                >
                                                    <StepperTrigger className="rounded max-md:flex-col">
                                                        <StepperIndicator />
                                                        <div className="text-center md:text-left">
                                                            <StepperTitle>{title}</StepperTitle>
                                                            <StepperDescription className="max-sm:hidden">
                                                                {step === 1 && `Status: ${booking.status || 'Pending'}`}
                                                                {step === 2 &&
                                                                    (booking.event_time_from ? `${booking.event_date}` : 'No booking schedule')}
                                                                {step === 3 && booking.status === 'completed' && (
                                                                    <div className="space-y-1">
                                                                        <p>Event: {booking.event_name}</p>
                                                                    </div>
                                                                )}
                                                            </StepperDescription>
                                                        </div>
                                                    </StepperTrigger>
                                                    {step < steps.length && <StepperSeparator />}
                                                </StepperItem>
                                            ))}
                                        </Stepper>
                                    );
                                })()}
                        </div>
                    </div>
                </div>
                <div className="py-10">
                    {booking && (
                        <div className="mx-auto mb-8 max-w-6xl">
                            {/* Package ID */}
                            <div className="mb-8 text-center">
                                <h2 className="inline-block rounded-full bg-white/80 px-6 py-3 text-2xl font-bold text-gray-800 shadow-lg backdrop-blur-sm">
                                    {booking.package?.package_name || 'Package'}
                                </h2>
                            </div>

                            {/* Details and Payment Columns */}
                            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                                {/* Details Column */}
                                <div className="rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-sm">
                                    <h3 className="mb-4 text-xl font-semibold text-gray-800">Event Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                                            <span className="text-gray-800">Transaction No:</span>
                                            <span className="font-medium text-gray-800">{booking.transaction_number}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                                            <span className="text-gray-800">Number of Guests:</span>
                                            <span className="font-medium text-gray-800">{booking.guest_count}</span>
                                        </div>
                                        <div className="flex items-center border-b border-gray-100 py-2">
                                            <span className="mr-3 text-gray-800">👤</span>
                                            <span className="flex-grow text-gray-800">{booking.contact_name}</span>
                                        </div>
                                        <div className="flex items-center border-b border-gray-100 py-2">
                                            <span className="mr-3 text-gray-800">✉️</span>
                                            <span className="flex-grow text-gray-800">{booking.contact_email}</span>
                                        </div>
                                        <div className="flex items-center border-b border-gray-100 py-2">
                                            <span className="mr-3 text-gray-800">📞</span>
                                            <span className="flex-grow text-gray-800">{booking.contact_number}</span>
                                        </div>
                                        <div className="flex items-center py-2">
                                            <span className="mr-3 text-gray-800">📍</span>
                                            <span className="flex-grow text-gray-800">
                                                {booking.street_address}, {booking.barangay}, {booking.city}, {booking.province}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Column */}
                                <div className="rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-sm">
                                    <h3 className="mb-4 text-xl font-semibold text-gray-800">Payment Details</h3>
                                    <div className="space-y-3">
                                        {booking.payments && booking.payments.length > 0 && (
                                            <>
                                                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                                                    <span className="text-gray-800">Payment Method:</span>
                                                    <span className="font-medium text-gray-800">{booking.payments[0].payment_method}</span>
                                                </div>
                                                {booking.payments[0].reference_no && (
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-gray-800">Reference No:</span>
                                                        <span className="font-medium text-gray-800">{booking.payments[0].reference_no}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Services */}
                            {booking.booking_selected_services && booking.booking_selected_services.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="mb-4 text-xl font-semibold text-gray-800">Selected Services</h3>
                                    <div className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4">
                                        {booking.booking_selected_services.map((selectedService: any) => (
                                            <div
                                                key={selectedService.booking_selected_services_id}
                                                className="w-64 flex-shrink-0 rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl"
                                            >
                                                <h4 className="mb-2 font-semibold text-gray-800">{selectedService.service?.service_name}</h4>
                                                <p className="text-sm text-gray-800">{selectedService.service?.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact Button */}
                            <div className="text-center">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <button className="transform rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl">
                                            Message Ramil&apos;s Creation
                                        </button>
                                    </DialogTrigger>

                                    <DialogContent className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-md transition-all duration-300 sm:max-w-[480px]">
                                        <DialogHeader className="mb-4 text-center">
                                            <DialogTitle className="text-2xl font-bold text-gray-800">Message Ramil&apos;s Creation</DialogTitle>
                                            <DialogDescription className="text-gray-600">
                                                Send a message to the Ramil&apos;s Creation team and we’ll get back to you soon.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleMessageSubmit} className="space-y-5">
                                            <div>
                                                <Label htmlFor="subject" className="text-gray-700">
                                                    Subject
                                                </Label>
                                                <Input
                                                    id="subject"
                                                    value={messageData.subject}
                                                    onChange={(e) => setMessageData('subject', e.target.value)}
                                                    placeholder="Enter your subject"
                                                    className="mt-2 w-full rounded-xl border-2 border-gray-200 bg-white/90 px-4 py-3 text-gray-800 shadow-inner focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="message" className="text-gray-700">
                                                    Message
                                                </Label>
                                                <Textarea
                                                    id="message"
                                                    value={messageData.message}
                                                    onChange={(e) => setMessageData('message', e.target.value)}
                                                    placeholder="Enter your message"
                                                    rows={5}
                                                    className="mt-2 w-full rounded-xl border-2 border-gray-200 bg-white/90 px-4 py-3 text-gray-800 shadow-inner focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                                                />
                                            </div>

                                            <DialogFooter className="pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={messageProcessing}
                                                    className="w-full transform rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl"
                                                >
                                                    {messageProcessing ? 'Sending...' : 'Send Message'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
