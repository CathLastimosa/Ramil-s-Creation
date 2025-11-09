import React, { useState, useEffect } from 'react';

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
        <div className="relative w-full max-w-7xl mx-auto">
            {/* Arrows */}
            <div className="
                absolute z-20 flex space-x-2
                lg:-top-13 lg:right-4 
                bottom-4 left-1/2 -translate-x-1/2
                lg:bottom-auto lg:left-auto lg:translate-x-0
            ">
                <button
                    onClick={prevSlide}
                    className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                    aria-label="Previous package"
                >
                    <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="w-10 h-10 bg-red-800 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                    aria-label="Next package"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Carousel Container */}
            <div className="relative flex items-center justify-between space-x-6">
                {/* Previous Image (Small) */}
                <div className="hidden lg:block w-1/3 transition-all duration-500 ease-in-out">
                    <div className="relative overflow-hidden shadow-xl">
                        <img
                            src={prevPackage.src}
                            alt={prevPackage.alt}
                            className="w-full h-75 object-cover opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            onClick={prevSlide}
                        />
                    </div>
                </div>

                {/* Current Image (Large) */}
                <div className="w-full lg:w-5xl transition-all duration-500 ease-in-out">
                    <div className="relative overflow-hidden shadow-2xl">
                        <img
                            src={currentPackage.src}
                            alt={currentPackage.alt}
                            className="w-full h-80 sm:h-96 md:h-110 object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackagesCarousel;