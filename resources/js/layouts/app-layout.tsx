import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import Pusher from 'pusher-js';
import { type ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    useEffect(() => {
        Pusher.logToConsole = true;

        const pusher = new Pusher('c5ecd7c26e7d1988a375', {
            cluster: 'ap1',
        });

        const channel = pusher.subscribe('appointments');

        const handleStoreEvent = function (data: any) {
            console.log('Received store event:', data);

            const type = data.type || 'appointment';

            // Message payload
            if (type === 'message') {
                const m = data.message || {};
                const subject = m.subject ? `${m.subject} — ` : '';
                const preview = m.message ? `${m.message}` : '';

                toast.success('New Message', {
                    description: `${subject}${preview}`,
                });

                try {
                    router.reload({ only: ['messages'] });
                } catch (e) {
                    console.error('Failed to partial-reload messages, doing full reload', e);
                    router.reload();
                }

                return;
            }

            // Appointment / Booking payload
            const a = data.appointment || {};

            const when = a.appointment_date
                ? `${a.appointment_date} ${a.appointment_time_from || ''}-${a.appointment_time_to || ''}`
                : 'scheduled time';

            if (type === 'booking') {
                const who = a.contact_name || a.contact_email || 'New booking';
                const tx = a.transaction_number ?  `(${a.transaction_number})` : '';
                toast.success('New Booking', {
                    description: `${who}${tx} — ${when}`,
                });
                router.reload();
            } else {
                const who = a.contact_name || a.contact_email || 'New appointment';
                toast.success('New Appointment', {
                    description: `${who} — ${when}`,
                });
                router.reload({ only: ['appointmentsData'] });
            }
        };

        // Bind both possible server event names to the single handler
        channel.bind('appointments.store', handleStoreEvent);
        channel.bind('appointment.store', handleStoreEvent);

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster richColors duration={5000} position="top-center" closeButton={true} />
        </AppLayoutTemplate>
    );
};