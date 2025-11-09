import React, { useState, useEffect } from "react";

interface Review {
    id: number;
    name: string;
    event: string;
    rating: number;
    testimony: string;
    image: string;
}

interface ReviewsCarouselProps {
    reviews: Review[];
}

const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({ reviews }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Auto-scroll
    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
        <div className="flex justify-end space-x-1">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${
                        i < rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );

    const getPositionClass = (index: number) => {
        if (index === currentIndex) return "center";
        if (index === (currentIndex - 1 + reviews.length) % reviews.length) return "left";
        if (index === (currentIndex + 1) % reviews.length) return "right";
        return "hidden";
    };

    return (
        <div className="relative w-full">
            {/* Carousel */}
            <div className="relative flex items-center justify-center h-[500px]">
                {reviews.map((review, index) => {
                    const position = getPositionClass(index);

                    if (position === "hidden") return null;

                    return (
                        <div
                            key={review.id}
                            className={`absolute transition-all duration-700 ease-in-out px-3 ${
                                position === "center"
                                    ? "z-20 scale-100 opacity-100 w-1/2"
                                    : "z-10 scale-90 opacity-70 w-1/3"
                            } ${
                                position === "left"
                                    ? "-translate-x-[120%]"
                                    : position === "right"
                                    ? "translate-x-[120%]"
                                    : "translate-x-0"
                            }`}
                        >
                            {/* Review Card */}
                            <div className="relative h-[450px] overflow-hidden shadow-xl">
                                <img
                                    src={review.image}
                                    alt={review.event}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0"></div>
                            </div>

                            {/* Review Content*/}
                            <div className="relative z-10 -mt-30 bg-white rounded-xl p-6 shadow-lg flex flex-col justify-between h-[40%] w-[80%] mx-auto">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                                            {review.event}
                                    </h3>
                                    <p className="text-gray-700 italic line-clamp-3">
                                            "{review.testimony}"
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <p className="font-semibold text-gray-900">{review.name}</p>
                                    <StarRating rating={review.rating} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-20 space-x-3">
                {reviews.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i === currentIndex
                                ? 'bg-red-800 scale-100 outline-red-800 outline-2 outline-offset-4' 
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReviewsCarousel;
