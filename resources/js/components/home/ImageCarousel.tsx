import React, { useEffect, useState } from 'react';

interface ImageCarouselProps {
    images: string[];
    autoScrollInterval?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, autoScrollInterval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, autoScrollInterval);

        return () => clearInterval(interval);
    }, [images.length, autoScrollInterval]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="relative aspect-[16/9] h-full w-full sm:aspect-[21/9] md:aspect-[2/1] lg:aspect-[3/1]">
            {/* Image Container */}
            <div className="relative h-full w-full overflow-hidden">
                {images.map((image, index) => {
                    const baseName = image.replace('/images/', '').replace('.webp', '');
                    return (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <picture>
                                <source
                                    srcSet={`/images/${baseName}-320.webp 320w, /images/${baseName}-640.webp 640w, /images/${baseName}-1024.webp 1024w, /images/${baseName}-1600.webp 1600w`}
                                    type="image/webp"
                                />
                                <source
                                    srcSet={`/images/${baseName}-320.jpg 320w, /images/${baseName}-640.jpg 640w, /images/${baseName}-1024.jpg 1024w, /images/${baseName}-1600.jpg 1600w`}
                                    type="image/jpeg"
                                />
                                <img
                                    src={`/images/${baseName}-640.webp`}
                                    alt={`Slide ${index + 1}`}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            </picture>
                        </div>
                    );
                })}
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 transform space-x-3">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-3 w-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? 'scale-100 bg-red-800 outline-2 outline-offset-4 outline-red-800'
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;