'use client';

import Gallery from '@/components/home/Gallery';
import Component from '@/components/home/TestimonialCard';
import { motion, Variants } from 'framer-motion';
import React from 'react';
// import ReviewsCarousel from '../components/home/ReviewsCarousel';

// Animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
};
const ReviewsSection: React.FC<{ feedbacks: any[] }> = ({ feedbacks }) => {
    return (
        <>
            <Gallery />
            <section id="reviews" className="relative -mt-10 overflow-hidden pt-16 pb-10 lg:pt-0">
                <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10">
                    {/* Section Header */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        className="mb-10 text-center"
                    >
                        <div className="mx-auto mb-6 h-0.5 w-20 bg-red-600"></div>
                        <h3 className="heading-3 mb-4 font-heading">What Our Clients Say</h3>
                        <p className="body-medium mx-auto w-[40%] max-w-3xl font-body text-gray-800">
                            Discover why hundreds of clients trust Ramil's Creation to make their special occasions unforgettable
                        </p>
                    </motion.div>
                    <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }}>
                        <Component feedbacks={feedbacks} />
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default ReviewsSection;
