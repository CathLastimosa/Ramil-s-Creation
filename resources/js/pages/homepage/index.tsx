import Preloader from '@/components/home/RamilPreloader';
import WavesBackground from '@/components/home/waves-background';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AboutUs from '@/layouts/AboutUs';
import Footer from '@/layouts/Footer';
import HeroSection from '@/layouts/HeroSection';
import PackagesSection from '@/layouts/PackagesSection';
import ReviewsSection from '@/layouts/ReviewsSection';
import ServicesSection from '@/layouts/ServicesSection';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Booking = {
    event_name: string;
    event_date: string;
    event_time: string;
    total_amount: number;
    transaction_number: string;
};

type Feedback = {
    image: string;
    statements: string[];
};

type FlashSuccess = {
    message: string;
    booking?: Booking;
    feedback?: Feedback;
};

type PackageType = {
    package_id: string;
    package_name: string;
    package_description: string;
    package_price: number;
};

type promoType = {
    package_id: string;
    package_name: string;
    package_promo: number;
};

const Homepage = () => {
    const { flash, feedbacks, packages, promo } = usePage<{
        flash: { success?: FlashSuccess; error?: string; message?: string };
        feedbacks: any[];
        packages: PackageType[];
        promo: promoType;
    }>().props;

    useEffect(() => {
        console.log('Packages in Homepage:', packages);
    }, [packages]);

    const [open, setOpen] = useState(false);
    const [bookingData, setBookingData] = useState<FlashSuccess | null>(null);
    useEffect(() => {
        if (flash.success) {
            setBookingData(flash.success);
            setOpen(true);
        }
    }, [flash.success]);

    return (
        <>
            <Head title="Homepage" />
            <Preloader />
            {/* <div className="my-6 text-center">
                <Button onClick={() => router.get(route('booking.track'))} className="bg-pink-600 text-white hover:bg-pink-700">
                    Track Your Booking Here!
                </Button>
            </div> */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md overflow-visible">
                    {bookingData?.booking && (
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
                                <img src={`/storage/Home Page (1) 1.png`} alt="Appointment Verified" className="h-24 w-24 object-contain" />
                            </motion.div>

                            <div className="mt-20 w-full max-w-md px-4">
                                <DialogHeader className="flex flex-col items-center justify-center gap-4 text-center">
                                    <DialogTitle className="text-2xl font-semibold text-emerald-500">{bookingData.message}</DialogTitle>

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
                                        <img src={`/storage/Home Page (2) 1.png`} alt="Email Sent" className="h-24 w-40 object-contain" />
                                    </motion.div>

                                    <DialogDescription className="leading-relaxed text-gray-600">
                                        <strong>Event:</strong> {bookingData.booking.event_name}
                                        <br />
                                        <strong>Date & Time:</strong> {bookingData.booking.event_date} | {bookingData.booking.event_time}
                                        <br />
                                        <strong>Total Amount:</strong> ₱{bookingData.booking.total_amount}
                                        <br />
                                        <strong>Transaction #:</strong> {bookingData.booking.transaction_number}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>
                    )}

                    {bookingData?.feedback && (
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
                                <img src={`/storage/Home Page (1) 1.png`} alt="Appointment Verified" className="h-24 w-24 object-contain" />
                            </motion.div>

                            <div className="mt-20 w-full max-w-md px-4">
                                <DialogHeader className="flex flex-col items-center justify-center gap-4 text-center">
                                    <DialogTitle className="text-center text-2xl font-semibold text-emerald-500">{bookingData.message}</DialogTitle>
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
                                        <img src={`/storage/Home Page (2) 1.png`} alt="Feedback" className="h-24 w-40 object-contain" />
                                    </motion.div>
                                    <DialogDescription className="leading-relaxed text-gray-600">
                                        {bookingData.feedback.statements.join(' ')}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="bg-white">
                <HeroSection packages={packages} promo={promo?.package_promo} />
                <ServicesSection />
                <PackagesSection />
                <AboutUs />
                <ReviewsSection feedbacks={feedbacks} />
                <div className="mt-20 w-full rotate-180">
                    <WavesBackground />
                </div>
                <div className="bg-[#FFECEC]">
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default Homepage;
