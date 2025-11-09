import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/marquee';
import { Star } from 'lucide-react';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill={i < rating ? 'currentColor' : 'none'} stroke="currentColor" />
        ))}
    </div>
);

function TestimonialCard({ img, name, rating, body }: { img: string; name: string; rating: number; body: string }) {
    return (
        <Card className="w-90 border border-gray-200 bg-white/70 shadow-md backdrop-blur-sm">
            <CardContent>
                <div className="flex items-center gap-2.5">
                    <Avatar className="size-9">
                        <AvatarImage src={img} alt="@reui_io" />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <figcaption className="flex items-center gap-1 font-heading text-sm text-black">{name}</figcaption>
                        <StarRating rating={rating} />
                    </div>
                </div>
                <blockquote className="mt-3 font-heading text-sm text-gray-800">“{body}”</blockquote>
            </CardContent>
        </Card>
    );
}
export default function Component({ feedbacks }: { feedbacks: any[] }) {
    const testimonials = feedbacks.map((feedback) => ({
        name: feedback.booking?.contact_name || 'Anonymous',
        rating: feedback.rating_emote || 5,
        body: feedback.feedback,
        img: '/images/wedding.jpg', // Default image
    }));

    return (
        <div className="relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden bg-white py-8">
            {/* Marquee moving left to right (default) */}
            <Marquee pauseOnHover repeat={3} className="[--duration:10s]">
                {testimonials.map((review, i) => (
                    <TestimonialCard key={i} {...review} />
                ))}
            </Marquee>
            {/* Marquee moving right to left (reverse) */}
            <Marquee pauseOnHover reverse repeat={3} className="[--duration:10s]">
                {testimonials.map((review, i) => (
                    <TestimonialCard key={`r-${i}`} {...review} />
                ))}
            </Marquee>
            {/* Stylish gradient overlays (light version) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white to-transparent"></div>
            <div className="pointer-events-none absolute top-0 left-0 h-12 w-full bg-gradient-to-b from-white to-transparent"></div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent"></div>
        </div>
    );
}
