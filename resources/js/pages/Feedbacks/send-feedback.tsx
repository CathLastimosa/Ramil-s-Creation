import WavesBackground from '@/components/home/waves-background';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm, usePage } from '@inertiajs/react';
import { RiStarFill } from '@remixicon/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type FeedbackForm = {
    booking_id: string;
    rating: string;
    feedback: string;
};

const FeedbackPage: React.FC = () => {
    const { flash, errors, booking_id } = usePage<{
        flash: { success?: string; error?: string };
        booking_id: string;
        errors: Record<string, string>;
    }>().props;

    console.log('Props received:', { booking_id, flash, errors });

    if (!booking_id) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
                    <p className="text-gray-600">No booking ID provided. Please use a valid link to provide feedback.</p>
                    <button onClick={() => window.history.back()} className="mt-4 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const [hoverRating, setHoverRating] = useState('');
    const [currentRating, setCurrentRating] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const { data, setData, post, processing } = useForm<FeedbackForm>({
        booking_id: booking_id.toString(),
        rating: '',
        feedback: '',
    });

    useEffect(() => {
        setData('booking_id', booking_id.toString());
    }, [booking_id, setData]);

    const handleRatingChange = (value: string) => {
        setCurrentRating(value);
        setData('rating', value);
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFeedback(value);
        setData('feedback', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.rating) {
            toast.error('Please select a rating before submitting.');
            return;
        }

        post(route('feedbacks.store'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-white">
            <h1 className="heading-3 m-20 mb-0 text-center font-heading">Feedback</h1>
            <div className="mt-5 w-full rotate-180">
                <WavesBackground />
            </div>

            {/* Content */}
            <main className="mt-0 flex w-full flex-1 flex-col items-center bg-[#FFECEC] px-3">
                <h2 className="mt-6 mb-6 text-center text-xl font-semibold text-gray-800">How was your experience with Ramil’s Creation?</h2>

                {/* Rating Stars */}
                <fieldset className="mb-6 space-y-4">
                    <div className="flex justify-center">
                        <RadioGroup className="inline-flex gap-2" onValueChange={handleRatingChange}>
                            {['1', '2', '3', '4', '5'].map((value) => (
                                <label
                                    key={value}
                                    className="group cursor-pointer"
                                    onMouseEnter={() => setHoverRating(value)}
                                    onMouseLeave={() => setHoverRating('')}
                                >
                                    <RadioGroupItem id={`star-${value}`} value={value} className="sr-only" />
                                    <RiStarFill
                                        size={36}
                                        className={`transition-all ${
                                            (hoverRating || currentRating) >= value ? 'text-amber-500' : 'text-gray-300'
                                        } group-hover:scale-110`}
                                    />
                                    <span className="sr-only">
                                        {value} star{value === '1' ? '' : 's'}
                                    </span>
                                </label>
                            ))}
                        </RadioGroup>
                    </div>
                    <div className="mx-auto flex w-80 justify-between text-sm text-gray-600">
                        <span>Not Satisfied</span>
                        <span>Very Satisfied</span>
                    </div>
                </fieldset>

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col items-center py-2">
                    <textarea
                        id="feedback"
                        className="h-32 w-full rounded-md border border-red-300 bg-[#ffffff] p-3 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                        placeholder="Your Feedback (optional)"
                        value={feedback}
                        onChange={handleFeedbackChange}
                    />

                    <p className="mt-2 mb-6 text-xs text-gray-500">Don’t include personal or customer data in this feedback.</p>

                    {/* Display Validation Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
                            <ul className="list-disc space-y-1 pl-5">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing || !data.rating}
                        className="rounded-xl bg-gradient-to-r from-[#f46276] to-[#ffb7c1] px-8 py-3 text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                    >
                        {processing ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default FeedbackPage;
