'use client';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button-shad';
import { CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/shadcn-calendar';
import { Toaster } from '@/components/ui/sonner';
import Tags, { Tag } from '@/components/ui/tag';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    { title: 'Appointments', href: '/admin-appointments' },
    { title: 'Add Appointment', href: '/' },
];

interface AppointmentTime {
    from: string;
    to: string;
    status: string;
}

interface PageProps extends InertiaPageProps {
    appointmentTimes: Record<string, AppointmentTime[]>;
    blockedtimes: Record<string, BlockedTime[]>;
}

interface BlockedTime {
    from: string;
    to: string;
}

export default function AppointmentForm({ appointmentTimes, blockedtimes }: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; message?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.message) toast.message(flash.message);
    }, [flash.success, flash.error, flash.message]);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm<{
        purposeTags: string[];
        datetime: string;
        fullName: string;
        email: string;
        phone: string;
    }>({
        purposeTags: [],
        datetime: '',
        fullName: '',
        email: '',
        phone: '',
    });

    // Appointment slots
    const appointmentSlots = [
        { from: '07:00', to: '09:00' },
        { from: '09:10', to: '11:00' },
        { from: '13:00', to: '15:00' },
        { from: '15:10', to: '18:00' },
        { from: '18:10', to: '20:00' },
        { from: '20:10', to: '22:00' },
    ];

    const formatTo12Hour = (time24: string) => {
        let [hour, minute] = time24.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    function formatLocalDate(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        if (date && selectedSlot !== null) {
            const slot = appointmentSlots[selectedSlot];
            setData('datetime', `${formatLocalDate(date)} ${slot.from}-${slot.to}`);
        }
    }, [date, selectedSlot]);

    useEffect(() => {
        setSelectedSlot(null);
        setData('datetime', '');
    }, [date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('adminappointments.store'));
    };

    return (
        <div className="mx-auto w-full max-w-5xl">
            <Toaster richColors position="top-center" />
            <form id="appointmentForm" onSubmit={handleSubmit} className="space-y-8">
                {/* Step 0: Purpose */}
                <section className="w-full space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-l font-semibold">Purpose of Appointment</h2>
                        <CardDescription>Select the purpose(s) for your appointment.</CardDescription>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="purpose">Purpose</Label>
                            <Tags
                                value={data.purposeTags.map((text) => ({ id: text, text }))}
                                onChange={(newTags: Tag[]) =>
                                    setData(
                                        'purposeTags',
                                        newTags.map((t) => t.text),
                                    )
                                }
                                ariaInvalid={!!errors.purposeTags}
                            />
                            <InputError message={errors.purposeTags} />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                'Rent',
                                'Gown',
                                'Suit',
                                'Make-Up',
                                'Catering',
                                'Inquire',
                                'Follow-ups',
                                'Design Consultation',
                                'Venue Decoration',
                                'Church Decoration',
                            ].map((purpose) => (
                                <Button
                                    key={purpose}
                                    className="w-full"
                                    type="button"
                                    variant={data.purposeTags.includes(purpose) ? 'default' : 'outline'}
                                    onClick={() => {
                                        if (data.purposeTags.includes(purpose)) {
                                            setData(
                                                'purposeTags',
                                                data.purposeTags.filter((tag) => tag !== purpose),
                                            );
                                        } else {
                                            setData('purposeTags', [...data.purposeTags, purpose]);
                                        }
                                    }}
                                >
                                    {purpose}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* Step 1: Date & Time */}
                <section className="w-full space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-l font-semibold">Select Appointment Date & Time</h2>
                        <CardDescription>Choose a date and available time slot for your appointment.</CardDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-6">
                        <div className="flex justify-center lg:justify-start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="w-full max-w-sm rounded-lg border"
                                captionLayout="dropdown"
                                disabled={(day) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    if (day < today) return true;
                                    const dayKey = formatLocalDate(day);
                                    const fullyBooked = appointmentSlots.every((slot) => {
                                        const appointment = appointmentTimes[dayKey]?.some(
                                            (t) =>
                                                (slot.from >= t.from && slot.from < t.to) ||
                                                (slot.to > t.from && slot.to <= t.to) ||
                                                (slot.from <= t.from && slot.to >= t.to),
                                        );
                                        const blocked = blockedtimes[dayKey]?.some(
                                            (b) =>
                                                (slot.from >= b.from && slot.from < b.to) ||
                                                (slot.to > b.from && slot.to <= b.to) ||
                                                (slot.from <= b.from && slot.to >= b.to),
                                        );
                                        return appointment || blocked;
                                    });
                                    return fullyBooked;
                                }}
                            />
                        </div>
                        {date && (
                            <div className="flex flex-col justify-center space-y-2">
                                <h3 className="text-l">Available Slots for {date.toDateString()}</h3>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {appointmentSlots.map((slot, idx) => {
                                        const dateKey = formatLocalDate(date!);
                                        const isAppointment =
                                            appointmentTimes[dateKey]?.some(
                                                (t) =>
                                                    (slot.from >= t.from && slot.from < t.to) ||
                                                    (slot.to > t.from && slot.to <= t.to) ||
                                                    (slot.from <= t.from && slot.to >= t.to),
                                            ) ?? false;
                                        const isBlocked =
                                            blockedtimes[dateKey]?.some(
                                                (b) =>
                                                    (slot.from >= b.from && slot.from < b.to) ||
                                                    (slot.to > b.from && slot.to <= b.to) ||
                                                    (slot.from <= b.from && slot.to >= b.to),
                                            ) ?? false;
                                        const disabled = isAppointment || isBlocked;

                                        return (
                                            <Button
                                                key={idx}
                                                type="button"
                                                variant={disabled ? 'ghost' : selectedSlot === idx ? 'default' : 'outline'}
                                                className={`${disabled ? 'cursor-not-allowed text-gray-400 line-through' : 'cursor-pointer'}`}
                                                disabled={disabled}
                                                onClick={() => {
                                                    if (!disabled) {
                                                        setSelectedSlot(idx);
                                                    }
                                                }}
                                            >
                                                {formatTo12Hour(slot.from)} - {formatTo12Hour(slot.to)}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    {data.datetime && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm font-medium text-blue-800">Selected: {data.datetime}</p>
                        </div>
                    )}
                </section>

                <hr className="border-gray-200" />

                {/* Step 2: Booking Info */}
                <section className="w-full space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-l font-semibold">Contact Information</h2>
                        <CardDescription>Provide your contact details to complete the booking.</CardDescription>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={data.fullName || ''}
                                onChange={(e) => setData('fullName', e.target.value)}
                                aria-invalid={!!errors.fullName}
                            />
                            <InputError message={errors.fullName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={data.email || ''}
                                onChange={(e) => setData('email', e.target.value)}
                                aria-invalid={!!errors.email}
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={data.phone || ''}
                                onChange={(e) => setData('phone', e.target.value)}
                                aria-invalid={!!errors.phone}
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* Submit Button */}
                <div className="flex justify-end items-center gap-2">
                    <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        Submit
                        {processing && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                    </Button>
                </div>
            </form>
        </div>
    );
}
