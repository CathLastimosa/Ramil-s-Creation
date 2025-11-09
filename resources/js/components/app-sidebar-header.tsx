import { Breadcrumbs } from '@/components/breadcrumbs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface Notification {
    id: number;
    subject: string;
    type: string;
    status: string;
    created_at: string;
    recipient_type?: string;

    event_contact_name?: string;
    event_contact_email?: string;
    event_name?: string;
    event_date?: string;

    appointment_contact_name?: string;
    appointment_contact_email?: string;
    purpose?: string;
    appointment_date?: string;

    service_contact_name?: string;
    service_contact_email?: string;
    service_name?: string;
    service_date?: string;

    message?: string;
    message_subject?: string;
    receiver_email?: string;

    sender_contact_name?: string;
    sender_contact_email?: string;
    sender_type?: string;
    sender_event_name?: string;

    receiver_contact_name?: string;
    receiver_contact_email?: string;
    receiver_event_name?: string;

    staff_name?: string;
    staff_email?: string;
}

function timeAgo(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    if (seconds < 86400) {
        const hrs = Math.floor(seconds / 3600);
        return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    }
    if (seconds < 604800) {
        const days = Math.floor(seconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return past.toLocaleDateString();
}

function getStatusColor(status: string) {
    const lower = status?.toLowerCase();
    if (lower.includes('sent')) return 'text-green-600';
    if (lower.includes('failed')) return 'text-red-500';
    if (lower.includes('pending')) return 'text-yellow-600';
    return 'text-gray-500';
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetch('/api/notifications')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setNotifications(data);
                else {
                    console.error('Invalid notification data:', data);
                    setNotifications([]);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch notifications:', err);
                setNotifications([]);
            });
    }, []);

    const renderNotificationText = (n: Notification) => {
        const subject = (n.subject || '').toLowerCase().trim();

        if (subject === 'booking submitted') {
            return (
                <>
                    <span className="font-medium">{n.event_contact_name || 'Someone'}</span> booked an event on{' '}
                    <span className="font-medium">{n.event_date ? new Date(n.event_date).toLocaleDateString() : 'unknown date'}</span>:{' '}
                    <span className="italic">{n.event_name}</span>
                </>
            );
        }

        if (subject === 'booking confirmation') {
            return (
                <>
                    <span className="font-medium">{n.event_contact_name || 'Someone'}</span> confirmed a booking for{' '}
                    <span className="italic">{n.event_name || 'an event'}</span> on{' '}
                    <span className="font-medium">{n.event_date ? new Date(n.event_date).toLocaleDateString() : 'unknown date'}</span>
                </>
            );
        }

        if (subject === 'booking completed') {
            return (
                <>
                    <span className="font-medium">{n.event_contact_name || 'Someone'}</span> completed an event:{' '}
                    <span className="italic">{n.event_name || 'Unknown event'}</span> on{' '}
                    <span className="font-medium">{n.event_date ? new Date(n.event_date).toLocaleDateString() : 'unknown date'}</span>
                </>
            );
        }

        if (subject === 'service booking submitted') {
            return (
                <>
                    <span className="font-medium">{n.service_contact_name || 'Someone'}</span> booked a service on{' '}
                    <span className="font-medium">{n.service_date ? new Date(n.service_date).toLocaleDateString() : 'unknown date'}</span>:{' '}
                    <span className="italic">{n.service_name}</span>
                </>
            );
        }

        if (subject === 'service booking completed') {
            return (
                <>
                    <span className="font-medium">{n.service_contact_name || 'Someone'}</span> completed a service:{' '}
                    <span className="italic">{n.service_name || 'Unknown service'}</span> on{' '}
                    <span className="font-medium">{n.service_date ? new Date(n.service_date).toLocaleDateString() : 'unknown date'}</span>
                </>
            );
        }

        // Appointments
        if (subject === 'appointment submitted') {
            return (
                <>
                    <span className="font-medium">{n.appointment_contact_name || 'Someone'}</span> scheduled an appointment on{' '}
                    <span className="font-medium">{n.appointment_date ? new Date(n.appointment_date).toLocaleDateString() : 'unknown date'}</span>:{' '}
                    <span className="italic">{n.purpose}</span>
                </>
            );
        }

        if (n.type === 'message') {
            if (n.sender_type === 'App\\Models\\User') {
                if (n.recipient_type === 'App\\Models\\Bookings') {
                    return (
                        <>
                            You sent a message to a customer <span className="font-medium">{n.event_contact_name || 'Someone'}</span> (
                            <span className="font-medium">{n.event_contact_email || 'Unknown email'}</span>):{' '}
                            <span className="italic">{n.subject || 'No subject'}</span>
                        </>
                    );
                } else if (n.recipient_type === 'App\\Models\\Staff') {
                    return (
                        <>
                            You sent a message to a staff <span className="font-medium">{n.staff_name || 'Someone'}</span> (
                            <span className="font-medium">{n.staff_email || 'Unknown email'}</span>):{' '}
                            <span className="italic">{n.subject || 'No subject'}</span>
                        </>
                    );
                }
            }
            // For received messages (when sender_type is Bookings, meaning customer sent it)
            else if (n.sender_type === 'App\\Models\\Bookings') {
                return (
                    <>
                        <span className="font-medium">{n.sender_contact_name || 'Someone'}</span> sent a message:{' '}
                        <span className="italic">{n.subject || 'No subject'}</span> from{' '}
                        <span className="font-medium">{n.sender_event_name || 'Unknown event'}</span>
                    </>
                );
            } else {
                return (
                    <>
                        <span className="font-medium">{n.receiver_email || 'Someone'}</span> received a message from{' '}
                        <span className="font-medium">{n.sender_contact_name || n.sender_contact_email || 'Unknown sender'}</span>:{' '}
                        <span className="text-gray-700">“{n.message || 'No content'}”</span>
                    </>
                );
            }
        }

        return (
            <>
                <span className="font-medium">
                    {n.sender_contact_name || 'Someone'} ({n.receiver_email || 'unknown receiver'})
                </span>{' '}
                sent a message <span className="text-gray-700">“{n.message || 'No content'}”</span>
            </>
        );
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:bg-black">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-600 dark:text-white">
                    {(() => {
                        const now = new Date();
                        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
                        const month = now.toLocaleDateString('en-US', { month: 'short' });
                        const date = now.getDate();
                        const hour = now.getHours();
                        const ampm = hour >= 12 ? 'pm' : 'am';
                        const hour12 = hour % 12 || 12;
                        return `${day}, ${month} ${date} : ${hour12}${ampm}`;
                    })()}
                </span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="outline" className="relative bg-white shadow-sm hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-900">
                            <Bell className="text-gray-700 dark:text-white" />
                            {notifications.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent align="end" className="w-85 rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                            <h4 className="text-sm font-semibold text-gray-800">Notifications</h4>
                        </div>

                        <ScrollArea className="h-96">
                            {notifications.length === 0 ? (
                                <div className="p-3 text-center text-sm text-gray-400">No notifications yet.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className="cursor-pointer space-y-2 rounded-lg bg-white px-3 py-3 transition hover:bg-gray-50"
                                        >
                                            <div className="text-[13px] leading-relaxed text-gray-800">{renderNotificationText(notif)}</div>

                                            <div className="flex items-center gap-2">
                                                <div className="mt-1 text-xs text-gray-400">Email status:</div>
                                                <div className={`mt-1 text-xs ${getStatusColor(notif.status)}`}>{notif.status || 'Unknown'}</div>
                                            </div>

                                            <div className="text-[11px] text-gray-400">{timeAgo(notif.created_at)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
