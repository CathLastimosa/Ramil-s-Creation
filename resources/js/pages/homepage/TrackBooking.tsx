import Navbar from '@/components/home/navbar';
import News from '@/components/home/news-ticker';
import TrackingPage from '@/components/home/tracking-page';
import WavesBackground from '@/components/home/waves-background';
import Footer from '@/layouts/Footer';
import { Head, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type promoType = {
    package_id: string;
    package_name: string;
    package_promo: number;
};

const TrackBooking: React.FC<{ packages: any[] }> = ({ packages }) => {
    const [showNews, setShowNews] = useState(true);

    const { flash, promo } = usePage<{ flash: { success?: string; error?: string }; promo: promoType }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowNews(false);
            } else {
                setShowNews(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="Track Your Event" />
            {showNews && <News promo={promo?.package_promo} />}
            <div className="bg-white">
                <Navbar packages={packages} />
                <TrackingPage />
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

export default TrackBooking;
