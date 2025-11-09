import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AddAppointment from './add-appointment';

interface AppointmentTime {
    from: string;
    to: string;
    status: string;
}

interface BlockedTime {
    from: string;
    to: string;
}

interface PageProps {
    appointmentTimes: Record<string, AppointmentTime[]>;
    blockedtimes: Record<string, BlockedTime[]>;
}

export default function AddAppointmentLayout({ appointmentTimes, blockedtimes }: PageProps) {
    const breadcrumbs = [
        { title: 'Appointments', href: '/admin-appointments' },
        { title: 'Add Appointment', href: '/adminappointments/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Appointment" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <AddAppointment appointmentTimes={appointmentTimes} blockedtimes={blockedtimes} />
            </div>
        </AppLayout>
    );
}
