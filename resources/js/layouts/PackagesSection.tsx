'use client';

import ButtonPrimary from '@/components/home/ButtonPrimary';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PackagesCarousel from '../components/home/PackagesCarousel';

const PackagesSection: React.FC = () => {
    const [currentPackageIndex, setCurrentPackageIndex] = useState(0);

    const packagesData = [
        {
            src: '/images/weddingpackage.webp',
            alt: 'Wedding Package - Eternal Love',
            theme: 'Where Love Stories Become Forever Memories',
            tagline: 'Celebrating the beginning of your forever',
            packageName: 'Wedding Package',
            packageId: 'PKG-001',
            description: 'Your dream wedding brought to life with exquisite planning, stunning venues, and memories that last a lifetime.',
        },
        {
            src: '/images/debut.webp',
            alt: 'Debut Package - Magical Celebration',
            theme: 'Where Debut Dreams Sparkle with Magic',
            tagline: 'A day to remember, filled with elegance and wonder',
            packageName: 'Debut Package',
            packageId: 'PKG-002',
            description:
                'Transform your special day into an unforgettable magical experience with our exclusive debut package. Every detail crafted to perfection.',
        },
    ];

    const currentPackage = packagesData[currentPackageIndex];

    return (
        <section id="packages" className="bg-white sm:py-10 lg:py-40 overflow-hidden">
            <div className="max-w-10xl mx-auto px-6 sm:px-8 lg:px-1">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
                    {/* LEFT COLUMN - CAROUSEL */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ amount: 0.2 }}
                        className="relative lg:col-span-3"
                    >
                        <PackagesCarousel packages={packagesData} onSlideChange={setCurrentPackageIndex} />
                    </motion.div>

                    {/* RIGHT COLUMN - PACKAGE DETAILS */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ amount: 0.2 }}
                        className="flex flex-col items-center space-y-8 pr-0 text-center lg:col-span-2 lg:items-start lg:pr-20 lg:text-left"
                    >
                        <div className="space-y-4">
                            <h3 className="heading-3 font-heading">{currentPackage.theme}</h3>
                            <div className="mx-auto h-0.5 w-20 bg-red-600 lg:mx-0"></div>
                            <p className="body-medium font-body text-gray-800 italic">{currentPackage.tagline}</p>
                        </div>

                        {/* PACKAGE NAME */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ amount: 0.2 }}
                            className="space-y-2"
                        >
                            <span className="body-xsmall font-body font-semibold tracking-wider text-red-600 uppercase">Featured Package</span>
                            <h4 className="heading-4 font-body text-gray-800">{currentPackage.packageName}</h4>
                        </motion.div>

                        {/* BOOK NOW BUTTON */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            viewport={{ amount: 0.2 }}
                            className="body-medium w-full py-4 font-heading sm:w-3/4 lg:w-auto"
                        >
                            <ButtonPrimary href={`/booking/${currentPackage.packageId}/services`} className="w-full text-center sm:w-3/4 lg:w-auto">
                                Book Now
                            </ButtonPrimary>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PackagesSection;