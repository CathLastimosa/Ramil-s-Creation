import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CalendarClock, CheckIcon } from 'lucide-react';

interface Event {
    booking_id: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    status: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    event_name: string;
}

interface UpcomingEventsProps {
    upcomingEvents: Event[];
}

export default function UpcomingEvents({ upcomingEvents }: UpcomingEventsProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hoursStr, minutes] = timeStr.split(':');
        let hours = parseInt(hoursStr, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${suffix}`;
    };

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-base font-semibold text-red-950 dark:text-white">
                    <CalendarClock className="size-5 text-accent2" />
                    Upcoming Events
                </span>
                <Button variant="link" className="text-sm text-red-600 dark:text-red-300" onClick={() => router.visit('/admin-booking')}>
                    View All
                </Button>
            </div>
            <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-300">No upcoming events</p>
                ) : (
                    upcomingEvents.map((event) => (
                        <div key={event.booking_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{event.contact_name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{event.contact_name}</p>
                                    <p className="text-xs text-gray-600">
                                        {formatDate(event.event_date)} at {formatTime(event.event_time_from)}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-green-200 hover:text-green-700"
                                onClick={() => {
                                    router.put(`/admin-bookings/${event.booking_id}/complete`, {}, { preserveScroll: true });
                                }}
                            >
                                <CheckIcon size={16} />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
