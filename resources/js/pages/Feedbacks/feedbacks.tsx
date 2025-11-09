import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { RiArrowUpSLine, RiStarFill } from '@remixicon/react';
import { Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Feedback', href: '/feedback' }];

type Feedback = {
    id: number;
    rating_emote: number;
    feedback: string;
    created_at: string;
    booking: {
        contact_name: string;
        contact_email: string;
        event_name: string;
    };
};

type PageProps = {
    feedbacks: Feedback[];
    totalReviews: number;
    averageRating: number;
    ratingCounts: Record<number, number>;
};

// Helper to format counts (ex: 2000 → 2.0k)
function formatCount(count: number) {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
}

export default function Feedback() {
    const { feedbacks, totalReviews, averageRating, ratingCounts } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedbacks" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* ===== Summary Section ===== */}
                <div>
                    <h2 className="mb-6 text-xl font-semibold text-gray-800">Feedback Summary</h2>

                    {/* Top summary cards (like image) */}
                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Total Reviews Card */}
                        <div className="flex flex-col items-start justify-center rounded-xl bg-accent2 p-6 shadow-lg transition-colors">
                            <div className="text-sm font-medium text-background">Total Reviews</div>

                            <div className="mt-2 flex items-end gap-2">
                                <div className="text-4xl font-semibold text-background">{formatCount(totalReviews)}</div>
                                <div className="flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600">
                                    <RiArrowUpSLine size={14} />
                                    <span>+5%</span>
                                </div>
                            </div>

                            <div className="mt-1 text-sm text-background">Growth in reviews this year</div>
                        </div>

                        {/* Average Rating Card */}
                        <div className="flex flex-col items-start justify-center rounded-xl bg-cta p-5 shadow-lg">
                            <div className="text-sm font-medium text-background">Average Rating</div>

                            <div className="mt-2 flex items-end gap-3">
                                <div className="text-4xl font-semibold text-background">{averageRating.toFixed(1)}</div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <RiStarFill
                                            key={`avg-star-${star}`}
                                            size={18}
                                            className={star <= Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mt-1 text-sm text-background">Average rating this year</div>
                        </div>

                        {/* Ratings Breakdown */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((level) => {
                                const count = ratingCounts[level] || 0;
                                const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

                                const colorClass =
                                    level === 5
                                        ? '#10b981' // green
                                        : level === 4
                                          ? '#e879f9' // pink
                                          : level === 3
                                            ? '#facc15' // yellow
                                            : level === 2
                                              ? '#38bdf8' // sky blue
                                              : '#f97316'; // orange

                                return (
                                    <div key={`rating-level-${level}`} className="flex items-center gap-2">
                                        <RiStarFill size={16} className="text-yellow-400" />
                                        <div className="w-4 text-sm font-medium text-gray-700">{level}</div>
                                        <Progress
                                            value={percentage}
                                            className="h-2 flex-1 rounded-full bg-gray-200"
                                            indicatorStyle={{ backgroundColor: colorClass }}
                                        />
                                        <div className="w-10 text-right text-sm font-medium text-gray-700">{formatCount(count)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div>
                    {feedbacks.map((feedback, index) => (
                        <div key={feedback.id}>
                            <div className="grid grid-cols-1 bg-white p-6 md:grid-cols-2">
                                {/* User Info */}
                                <div className="flex gap-4">
                                    <Avatar>
                                        <AvatarFallback className="bg-secondary font-medium text-accent2">
                                            {feedback.booking.contact_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">{feedback.booking.contact_name}</div>
                                        <div className="text-sm text-gray-600">{feedback.booking.contact_email}</div>
                                        <div className="text-sm text-gray-600">{feedback.booking.event_name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <RiStarFill
                                                    key={`feedback-star-${feedback.id}-${star}`}
                                                    size={16}
                                                    className={star <= feedback.rating_emote ? 'text-yellow-400' : 'text-background'}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-600">{new Date(feedback.created_at).toLocaleDateString()}</div>
                                        <div className="text-sm">{feedback.feedback}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this feedback?')) {
                                                router.delete(`/admin-feedback/${feedback.id}`);
                                            }
                                        }}
                                        className="mt-2 self-start text-gray-500 hover:text-gray-700"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {index < feedbacks.length - 1 && <hr className="my-4 border-gray-200" />}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
