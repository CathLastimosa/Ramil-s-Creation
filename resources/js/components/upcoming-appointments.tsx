import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CalendarClock, CheckIcon } from 'lucide-react';

interface Appointment {
    appointment_id: string;
    appointment_date: string;
    appointment_time_from: string;
    appointment_time_to: string;
    status: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    purpose: string;
}

interface UpcomingAppointmentsProps {
    upcomingAppointments: Appointment[];
}

export default function UpcomingAppointments({ upcomingAppointments }: UpcomingAppointmentsProps) {
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
                    Appointments
                </span>{' '}
                <Button variant="link" className="text-sm text-red-600 dark:text-white" onClick={() => router.visit('/admin-appointments')}>
                    View All
                </Button>
            </div>
            <div className="space-y-3">
                {upcomingAppointments.length === 0 ? (
                    <p className="text-center text-gray-500">No upcoming appointments</p>
                ) : (
                    upcomingAppointments.map((appointment) => (
                        <div key={appointment.appointment_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{appointment.contact_name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-300">{appointment.contact_name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time_from)}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-green-200 hover:text-green-700"
                                onClick={() => {
                                    router.put(`/admin-appointments/${appointment.appointment_id}/update-status`, {}, { preserveScroll: true });
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
