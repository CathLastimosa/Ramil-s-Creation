'use client';

import Footer from '@/layouts/Footer';
import Navbar from '@/components/home/navbar';
import News from '@/components/home/news-ticker';
import WavesBackground from '@/components/home/waves-background';
import { Button } from '@/components/ui/button-shad';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface BookingTime {
    from: string;
    to: string;
    status: string;
}

interface BlockedTime {
    from: string;
    to: string;
}
type PackageDetails = {
    package_id: string;
    package_name: string;
    package_description: string;
    package_price: number;
};

interface PageProps {
    bookedTimes: Record<string, BookingTime[]>;
    blockedtimes: Record<string, BlockedTime[]>;
    servicebookingtimes: Record<string, BlockedTime[]>;
}
type promoType={
    package_id:string;
    package_name:string;
    package_promo: number;
}


export default function CalendarPage() {
    const { bookedTimes = {}, blockedtimes = {}, servicebookingtimes = {} } = usePage().props as unknown as PageProps;
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const { packages, promo } = usePage<{
        packages: PackageDetails[];
        promo: promoType;

    }>().props;
    const [showNews, setShowNews] = useState(true);

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
    const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDateStatus = (date: Date) => {
        const dateKey = formatLocalDate(date);
        const hasBookings = bookedTimes[dateKey] && bookedTimes[dateKey].length > 0;
        const hasBlocked = blockedtimes[dateKey] && blockedtimes[dateKey].length > 0;
        const hasServiceBookings = servicebookingtimes[dateKey] && servicebookingtimes[dateKey].length > 0;

        if (hasBlocked) return 'blocked';
        if (hasBookings) return 'booked';
        if (hasServiceBookings) return 'service';
        return 'available';
    };

    const modifiers = {
        booked: (date: Date) => getDateStatus(date) === 'booked',
        blocked: (date: Date) => getDateStatus(date) === 'blocked',
        service: (date: Date) => getDateStatus(date) === 'service',
    };

    const modifiersStyles = {
        booked: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontWeight: 'bold',
        },
        blocked: {
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            textDecoration: 'line-through',
        },
        service: {
            backgroundColor: '#fef3c7',
            color: '#d97706',
            fontWeight: 'bold',
        },
    };

    const bookingSlots = [
        { label: 'Full-Day Event', from: '07:00', to: '20:00' },
        { label: 'Half-Day Event', from: '07:00', to: '12:00' },
        { label: 'Half-Day Event', from: '13:00', to: '18:00' },
        { label: 'Short-Day Event', from: '07:00', to: '10:00' },
        { label: 'Short-Day Event', from: '11:00', to: '14:00' },
        { label: 'Short-Day Event', from: '15:00', to: '18:00' },
        { label: 'Short-Day Event', from: '19:00', to: '20:00' },
    ];

    const formatTo12Hour = (time24: string) => {
        let [hour, minute] = time24.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    const isSlotUnavailable = (slot: (typeof bookingSlots)[0], date: Date) => {
        const dateKey = formatLocalDate(date);
        const booked =
            bookedTimes[dateKey]?.some(
                (t) => (slot.from >= t.from && slot.from < t.to) || (slot.to > t.from && slot.to <= t.to) || (slot.from <= t.from && slot.to >= t.to),
            ) ?? false;

        const blocked =
            blockedtimes[dateKey]?.some(
                (t) => (slot.from >= t.from && slot.from < t.to) || (slot.to > t.from && slot.to <= t.to) || (slot.from <= t.from && slot.to >= t.to),
            ) ?? false;

        const servicebooked =
            servicebookingtimes[dateKey]?.some(
                (t) => (slot.from >= t.from && slot.from < t.to) || (slot.to > t.from && slot.to <= t.to) || (slot.from <= t.from && slot.to >= t.to),
            ) ?? false;

        return booked || blocked || servicebooked;
    };

    return (
        <>
            <Head title="Event Calendar" />
            {showNews && <News promo={promo?.package_promo} />}
            <section className="flex min-h-screen flex-col bg-white">
                <Navbar packages={packages} />
                <div className="container mx-auto p-6 mt-25">
                    <Card className="mx-auto max-w-6xl">
                        <CardHeader>
                            <CardTitle className="text-center text-3xl">Event Calendar</CardTitle>
                            <CardDescription className="text-center">Check availability for bookings and service bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-6 lg:flex-row">
                                <div className="flex-1">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        className="w-full"
                                        modifiers={modifiers}
                                        modifiersStyles={modifiersStyles}
                                        disabled={(date) => false}
                                    />
                                </div>
                                <div className="space-y-4 lg:w-1/3">
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold">Legend</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded border border-red-300 bg-red-100"></div>
                                                <span className="text-sm">Booked Events</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100 line-through"></div>
                                                <span className="text-sm">Blocked Dates</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded border border-yellow-300 bg-yellow-100"></div>
                                                <span className="text-sm">Service Bookings</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded border border-gray-300 bg-white"></div>
                                                <span className="text-sm">Available</span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedDate && (
                                        <div className="mt-6">
                                            <CardTitle className="mb-4 text-lg">Available Time Slots for {selectedDate.toDateString()}</CardTitle>
                                            {Object.entries(
                                                bookingSlots.reduce(
                                                    (groups, slot) => {
                                                        if (!groups[slot.label]) groups[slot.label] = [];
                                                        groups[slot.label].push(slot);
                                                        return groups;
                                                    },
                                                    {} as Record<string, typeof bookingSlots>,
                                                ),
                                            ).map(([label, slots], groupIdx) => (
                                                <div key={groupIdx} className="mb-4">
                                                    <h4 className="mb-2 font-semibold">{label}</h4>
                                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                        {slots.map((slot, idx) => {
                                                            const unavailable = isSlotUnavailable(slot, selectedDate);
                                                            return (
                                                                <Button
                                                                    key={idx}
                                                                    variant={unavailable ? 'ghost' : 'outline'}
                                                                    className={`p-2 text-sm ${
                                                                        unavailable
                                                                            ? 'cursor-not-allowed text-gray-400 line-through'
                                                                            : 'text-gray-800'
                                                                    }`}
                                                                    disabled
                                                                >
                                                                    {formatTo12Hour(slot.from)} - {formatTo12Hour(slot.to)}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Waves and Footer */}
                <div className="mt-20 w-full rotate-180">
                    <WavesBackground />
                </div>
                <div className="bg-[#FFECEC]">
                    <Footer />
                </div>
            </section>
        </>
    );
}
