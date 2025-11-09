import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RiStarFill } from '@remixicon/react';

interface OverallShopRatingProps {
    averageRating: number;
    contactNames: string[];
}

export default function OverallShopRating({ averageRating, contactNames }: OverallShopRatingProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-4">
                <span className="text-base font-semibold text-secondary dark:text-gray-200">Overall Shop Rating</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-3xl font-bold tracking-tight text-secondary dark:text-gray-200">{averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 ">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <RiStarFill
                            key={`avg-star-${star}`}
                            size={18}
                            className={star <= Math.floor(averageRating) ? 'text-yellow-400' : 'text-red-200'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
