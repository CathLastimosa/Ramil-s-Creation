import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';

interface StaffAvailabilityItem {
    staff_id: number;
    staff_name: string;
    email: string;
    contact_no: string;
    role: string;
    status: string;
    availability: {
        availability_id: number;
        day_of_week: string;
        start_time: string;
        end_time: string;
        status: string;
        reason?: string;
    }[];
}

interface StaffAvailabilityProps {
    staffAvailability: StaffAvailabilityItem[];
}

export default function StaffAvailability({ staffAvailability }: StaffAvailabilityProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Available
                    </Badge>
                );
            case 'unavailable':
                return <Badge variant="destructive">Unavailable</Badge>;
            case 'blocked':
                return <Badge variant="secondary">Blocked</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
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
            <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-base font-semibold text-red-950 dark:text-white">
                    <CalendarClock className="size-5 text-accent2" />
                    Staff's Availability
                </span>{' '}
                <Button variant="link" className="text-sm text-red-600 dark:text-red-300" onClick={() => router.visit('/staff')}>
                    View All
                </Button>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
            <div className="space-y-3">
                {staffAvailability.length === 0 ? (
                    <p className="text-center text-gray-500">No staff available</p>
                ) : (
                    staffAvailability.map((staff) => {
                        const todayAvailability = staff.availability[0]; // Assuming one availability per day
                        return (
                            <div key={staff.staff_id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ">
                                        <AvatarFallback>{staff.staff_name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.staff_name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            {todayAvailability
                                                ? `${formatTime(todayAvailability.start_time)} - ${formatTime(todayAvailability.end_time)}`
                                                : 'No schedule'}
                                        </p>
                                    </div>
                                </div>
                                {todayAvailability ? getStatusBadge(todayAvailability.status) : <Badge variant="outline">No Schedule</Badge>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
