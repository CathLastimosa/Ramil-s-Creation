import { Link } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

const Navbar: React.ComponentType<{ packages: any[] }> = ({ packages }) => {
    useEffect(() => {
        console.log('Packages in Navbar:', packages);
    }, [packages]);

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNews, setShowNews] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Smooth scroll helper
    const scrollToSection = (id: string) => {
        const section = document.querySelector(id);
        if (section) {
            const yOffset = showNews ? -128 : -70; // Adjust for navbar height + news height
            const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
            // If section not found (navigating from another page)
            window.location.href = `/${id}`;
        }
    };

    // Handle outside clicks and scroll behavior
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.mobile-menu-button')
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowNews(false);
            } else {
                setShowNews(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // <-- No dependency here (prevents the auto-scroll bug)

    // Scroll to section based on hash only once (on page load)
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const section = document.querySelector(hash);
                if (section instanceof HTMLElement) {
                    const yOffset = -100; // Adjust as needed for navbar height
                    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 300);
        }
    }, []); // <-- Run once only

    const toggleDropdown = (dropdownName: string) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setOpenDropdown(null);
    };

    const isDropdownOpen = (dropdownName: string) => openDropdown === dropdownName;

    return (
        <nav ref={dropdownRef} className={`fixed ${showNews ? 'top-7' : 'top-0'} right-0 left-0 z-50 bg-white shadow-lg`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-4">
                <div className="flex h-16 items-center justify-between font-heading">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <img src="/images/ramilLogo.svg" alt="Ramil's Creation" className="mr-2 h-6.5" />
                        </Link>
                    </div>

                    {/* Right */}
                    <div className="flex items-center space-x-6">
                        {/* Desktop Nav */}
                        <div className="body-small hidden items-center space-x-6 md:flex">
                            <button onClick={() => scrollToSection('#hero')} className="text-black hover:text-red-500">
                                Home
                            </button>

                            <button onClick={() => scrollToSection('#services')} className="text-black hover:text-red-500">
                                Services
                            </button>

                            {/* Packages Dropdown */}
                            <div
                                className="relative"
                                onMouseEnter={() => {
                                    setOpenDropdown('packages');
                                    setShowTooltip(true);
                                }}
                                onMouseLeave={() => {
                                    setOpenDropdown(null);
                                    setShowTooltip(false);
                                }}
                            >
                                <button
                                    onClick={() => {
                                        scrollToSection('#packages');
                                        setOpenDropdown(null);
                                        setShowTooltip(false);
                                    }}
                                    className="flex items-center text-black hover:text-red-500"
                                >
                                    Packages
                                    <svg
                                        className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen('packages') ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen('packages') && packages?.length > 0 && (
                                    <div className="absolute top-full left-0 z-50 w-48 rounded-lg bg-white py-2 shadow-lg">
                                        {packages.map((item) => (
                                            <Link
                                                key={item.package_name}
                                                href={`/package/${item.package_id}`}
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => {
                                                    setOpenDropdown(null);
                                                    setShowTooltip(false);
                                                }}
                                            >
                                                {item.package_name}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {showTooltip && packages?.length === 0 && (
                                    <div className="absolute top-full left-0 z-50 w-48 rounded-lg bg-white py-2 shadow-lg">
                                        <div className="px-4 py-2 text-gray-800">No package found</div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => scrollToSection('#about')} className="text-black hover:text-red-500">
                                About Us
                            </button>

                            <button onClick={() => scrollToSection('#reviews')} className="text-black hover:text-red-500">
                                Reviews
                            </button>

                            <Link href="/calendar" className="text-black hover:text-red-500">
                                Calendar
                            </Link>

                            <Link href="/track-booking" className="text-black hover:text-red-500">
                                Tracking
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMobileMenu}
                                className="mobile-menu-button inline-flex items-center justify-center rounded-md p-2 text-black hover:text-red-500 focus:outline-none"
                            >
                                <svg
                                    className={`h-6 w-6 transition-transform ${isMobileMenuOpen ? 'hidden' : 'block'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <svg
                                    className={`h-6 w-6 transition-transform ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    ref={mobileMenuRef}
                    className={`transition-all duration-300 ease-in-out md:hidden ${
                        isMobileMenuOpen ? 'max-h-96 translate-y-0 opacity-100' : 'pointer-events-none max-h-0 -translate-y-4 opacity-0'
                    }`}
                >
                    <div className="mt-2 space-y-1 rounded-lg bg-white px-2 pt-2 pb-3 font-heading shadow-lg sm:px-3">
                        <button
                            onClick={() => {
                                scrollToSection('#hero');
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex w-full rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                        >
                            Home
                        </button>

                        <button
                            onClick={() => {
                                scrollToSection('#services');
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex w-full rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                        >
                            Services
                        </button>

                        {/* Mobile Packages Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown('packages-mobile')}
                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                            >
                                <span>Packages</span>
                                <svg
                                    className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen('packages-mobile') ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen('packages-mobile') && packages?.length > 0 && (
                                <div className="mt-1 space-y-1 pl-4">
                                    {packages.map((item) => (
                                        <Link
                                            key={item.package_name}
                                            href={`/package/${item.package_id}`}
                                            className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100"
                                            onClick={() => {
                                                setOpenDropdown(null);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            {item.package_name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {isDropdownOpen('packages-mobile') && packages?.length === 0 && (
                                <div className="mt-1 space-y-1 pl-4">
                                    <div className="rounded-md px-3 py-2 text-gray-600">No package found</div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                scrollToSection('#about');
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex w-full rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                        >
                            About Us
                        </button>

                        <button
                            onClick={() => {
                                scrollToSection('#reviews');
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex w-full rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                        >
                            Reviews
                        </button>

                        <Link
                            href="/calendar"
                            className="flex w-full rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Calendar
                        </Link>

                        <Link
                            href="/track-booking"
                            className="flex w-full rounded-md px-3 py-2 text-gray-800 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tracking
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
