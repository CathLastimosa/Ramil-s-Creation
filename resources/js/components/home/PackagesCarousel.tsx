import React, { useEffect, useState } from 'react';

interface PackageImage {
    src: string;
    alt: string;
    theme: string;
    tagline: string;
    packageName: string;
}

interface PackagesCarouselProps {
    packages: PackageImage[];
    onSlideChange?: (index: number) => void;
}

const PackagesCarousel: React.FC<PackagesCarouselProps> = ({ packages, onSlideChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        onSlideChange?.(currentIndex);
    }, [currentIndex, onSlideChange]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + packages.length) % packages.length);
    };

    const getPrevIndex = (index: number) => (index - 1 + packages.length) % packages.length;

    const currentPackage = packages[currentIndex];
    const prevPackage = packages[getPrevIndex(currentIndex)];

    return (
        <div className="relative mx-auto w-full max-w-7xl">
            {/* Arrows */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2 lg:-top-13 lg:right-4 lg:bottom-auto lg:left-auto lg:translate-x-0">
                <button
                    onClick={prevSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white"
                    aria-label="Previous package"
                >
                    <svg className="h-5 w-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-800 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-red-700"
                    aria-label="Next package"
                >
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Carousel Container */}
            <div className="relative flex items-center justify-between space-x-6">
                {/* Previous Image (Small) */}
                <div className="hidden w-1/3 transition-all duration-500 ease-in-out lg:block">
                    <div className="relative overflow-hidden shadow-xl">
                        <img
                            src={prevPackage.src}
                            alt={prevPackage.alt}
                            className="h-75 w-full cursor-pointer object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                            onClick={prevSlide}
                        />
                    </div>
                </div>

                {/* Current Image (Large) */}
                <div className="w-full transition-all duration-500 ease-in-out lg:w-5xl">
                    <div className="relative overflow-hidden shadow-2xl">
                        <img src={currentPackage.src} alt={currentPackage.alt} className="h-80 w-full object-cover sm:h-96 md:h-110" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackagesCarousel;
