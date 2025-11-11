import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

const Footer: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <footer id="footer" className="relative bg-transparent pt-16 pb-8 lg:pt-12">
            {/* Red line indicator */}
            <div className="mx-auto mt-12 mb-12 h-0.5 w-[80%] rounded-full bg-red-600"></div>

            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
                    {/* First Column - Brand & Contact */}
                    <div className="w-full md:col-span-2 lg:col-span-1 lg:w-[340px]">
                        <div className="space-y-6">
                            {/* Logo */}
                            <Link href="/home" className="flex items-center">
                                <img src="/images/ramilLogo.svg" alt="Ramil's Creation" className="mr-2 h-6.5" />
                            </Link>

                            {/* Description */}
                            <p className="body-small max-w-md font-body leading-relaxed text-gray-700">
                                Elevated Event Experiences with Custom Elegance — From Custom Gowns to Fine Cuisine, for Life's Most Cherished
                                Celebrations.
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-body text-gray-700">Ozamiz City, Mis. Occ.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Column - Menu */}
                    <div className="space-y-4">
                        <h4 className="body-medium font-logo font-semibold text-black">Menu</h4>
                        <ul className="body-small grid grid-cols-2 gap-y-1">
                            <li>
                                <Link href="/" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/#services" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/#packages" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    Packages
                                </Link>
                            </li>
                            <li>
                                <Link href="/#about" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/#reviews" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    Reviews
                                </Link>
                            </li>
                            <li>
                                <Link href="/calendar" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    Calendar
                                </Link>
                            </li>
                            <li>
                                <Link href="/track-booking" className="font-heading text-gray-700 transition-colors hover:text-red-500">
                                    Tracking
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Third Column - Stay Connected */}
                    <div className="space-y-4">
                        <h4 className="body-medium font-logo font-semibold text-black">Stay Connected</h4>
                        <div className="body-small">
                            <a
                                href="https://www.facebook.com/ramils.creation"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-gray-700 transition-colors hover:text-red-500"
                            >
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </a>
                        </div>
                    </div>

                    {/* Fourth Column - Message Form */}
                    <div className="space-y-4">
                        <h4 className="body-medium font-logo font-semibold text-black">Contact Us</h4>
                        <p className="body-small font-body text-gray-700">
                            Have a question?{' '}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const email = '25catswhisker@gmail.com';
                                    const mailtoLink = `mailto:${email}`;
                                    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;

                                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                                    window.location.href = isMobile ? mailtoLink : gmailLink;
                                }}
                                className="cursor-pointer font-medium text-red-700 underline transition-colors hover:text-red-800"
                            >
                                Message Us
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
