import ButtonPrimary from '@/components/home/ButtonPrimary';
import ButtonSecondary from '@/components/home/ButtonSecondary';
import ImageCarousel from '@/components/home/ImageCarousel';
import Navbar from '@/components/home/navbar';
import News from '@/components/home/news-ticker';
import React, { useEffect, useState } from 'react';

type HeroSectionProps = {
    promo?: number;
};

const HeroSection: React.FC<HeroSectionProps & { packages: any[] }> = ({ packages, promo }) => {
    const [showNews, setShowNews] = useState(true);
    const carouselImages = ['/images/wedding.webp', '/images/decoration1.webp', '/images/sweets.webp'];

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
            {showNews && <News promo={promo} />}
            <div id="hero" className="relative min-h-screen overflow-hidden bg-white">
                {/* Navigation */}
                <Navbar packages={packages} />

                {/* Main Content */}
                {/* Hero Section */}
                <div className="relative flex min-h-screen items-center">
                    <div className="mx-auto w-full max-w-7xl px-6 py-40 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            {/*Text Content */}
                            <div className="z-10 text-center">
                                <h3 className="heading-3 font-heading text-black">Turning Your Dream Celebrations Into Elegant Realities</h3>
                                <p className="body-medium m-10 font-body leading-relaxed text-gray-800">
                                    Elevated Event Experiences with Custom Elegance — From Custom Gowns to Fine Cuisine, for Life's Most Cherished
                                    Celebrations.
                                </p>
                                {/* Image Carousel */}
                                <div className="relative mb-5 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-1/2">
                                    <div className="lg:absolute lg:inset-y-0 lg:left-15 lg:h-screen lg:w-full">
                                        <ImageCarousel images={carouselImages} />
                                    </div>
                                </div>
                                {/* CTA Buttons */}
                                <div className="body-medium flex w-full flex-col items-center justify-center font-heading sm:flex-row sm:space-x-4">
                                    <ButtonPrimary href="/booking/PKG-001/services" className="mb-4 w-full sm:mb-0 sm:w-auto">
                                        Book Now
                                    </ButtonPrimary>
                                    <ButtonSecondary href="/appointment" className="w-full sm:w-auto">
                                        Schedule a Visit
                                    </ButtonSecondary>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HeroSection;
