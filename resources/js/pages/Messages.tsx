'use client';

import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button-shad';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Loader2, Search, Send, SquarePen, Trash2, User, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Messages', href: '/messages' }];

// Define types for clarity and type safety
type Message = {
    message_id: number;
    receiver_id: number;
    sender_id: number;
    receiver_email: string;
    subject: string | null;
    message: string;
    attachment: string | null;
    created_at: string;
    is_read: boolean;
    sender_type: string;
    sender: {
        name?: string;
        email?: string;
        event_name?: string;
    } | null;
    receiver: Receiver | null;
};

type Receiver =
    | { type: 'App\\Models\\Bookings'; booking_id: number; contact_name: string; event_name: string; contact_email: string }
    | { type: 'App\\Models\\Staff'; staff_id: number; staff_name: string; email: string }
    | { type: 'unknown'; name: string; email: string };

type ReceiverGroup = {
    id: string;
    type: string;
    name: string;
    subtitle: string;
    icon: React.ReactNode;
    messages: Message[];
};

export default function Messages() {
    // Extract props from Inertia page
    const { flash, messages: rawMessages = [] } = usePage<{
        flash: { success?: string; error?: string };
        messages?: Message[];
    }>().props;

    // Ensure messages is always an array (defensive programming)
    const messages = Array.isArray(rawMessages) ? rawMessages : [];
    console.log('Loaded messages:', messages); // Debug: Log messages for inspection

    // State for search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'inbox' | 'sent'>('inbox');

    // Filter messages based on inbox/sent
    const filteredMessages = useMemo(() => {
        if (!messages || messages.length === 0) {
            console.log('No messages to filter'); // Debug
            return [];
        }
        if (filter === 'sent') {
            // Sent: Messages where sender is the current user (App\Models\User)
            return messages.filter((m) => m.sender_type === 'App\\Models\\User');
        } else {
            // Inbox: Messages where sender is NOT the current user (e.g., bookings, staff)
            return messages.filter((m) => m.sender_type !== 'App\\Models\\User');
        }
    }, [messages, filter]);

    // Helper function to create a group for inbox (groups by sender_id for uniqueness)
    const createInboxGroup = (msg: Message): ReceiverGroup | null => {
        const senderType = msg.sender_type?.replace(/\\\\/g, '\\') || '';
        let groupId = '';
        let name = '';
        let subtitle = '';
        let type = '';
        let icon = <User className="h-4 w-4" />;

        if (senderType === 'App\\Models\\Bookings' || senderType === 'App\Models\\Bookings') {
            // Key requirement: Group by sender_id (unique per customer/booking), not name/email
            groupId = `booking-${msg.sender_id}`;
            name = msg.sender?.name || `Customer #${msg.sender_id}`;
            subtitle = msg.sender?.event_name || 'Event Booking';
            type = 'booking';
            icon = <User className="text-gold-600 h-4 w-4" />;
        } else {
            // For other sender types (e.g., staff), still use sender_id for uniqueness
            groupId = `${senderType}-${msg.sender_id}`;
            name = msg.sender?.name || msg.sender?.email || 'Unknown Sender';
            subtitle = msg.sender?.event_name || 'No Info';
            type = 'unknown';
            icon = <User className="h-4 w-4 text-gray-600" />;
        }

        return { id: groupId, type, name, subtitle, icon, messages: [msg] };
    };

    // Helper function to create a group for sent (groups by receiver)
    const createSentGroup = (msg: Message): ReceiverGroup | null => {
        const receiver = msg.receiver;
        if (!receiver) {
            console.warn('Message has no receiver, skipping:', msg); // Debug
            return null;
        }

        let groupId = '';
        let name = '';
        let subtitle = '';
        let type = '';
        let icon = <User className="h-4 w-4" />;

        if (receiver.type === 'App\\Models\\Bookings') {
            groupId = `booking-${receiver.booking_id}`;
            name = receiver.contact_name || 'Unknown Customer';
            subtitle = receiver.event_name || 'No Event';
            type = 'customer';
            icon = <User className="text-gold-600 h-4 w-4" />;
        } else if (receiver.type === 'App\\Models\\Staff') {
            groupId = `staff-${receiver.staff_id}`;
            name = receiver.staff_name || 'Unknown Staff';
            subtitle = receiver.email;
            type = 'staff';
            icon = <Users className="h-4 w-4 text-accent" />;
        } else {
            groupId = `unknown-${msg.receiver_email}`;
            name = receiver.name || msg.receiver_email;
            subtitle = 'Unknown Receiver';
            type = 'unknown';
            icon = <User className="h-4 w-4 text-gray-600" />;
        }

        return { id: groupId, type, name, subtitle, icon, messages: [msg] };
    };

    // Group messages into ReceiverGroups
    const receiverGroups = useMemo(() => {
        if (!filteredMessages || filteredMessages.length === 0) {
            console.log('No filtered messages to group'); // Debug
            return [];
        }

        const groups: Record<string, ReceiverGroup> = {};

        filteredMessages.forEach((msg) => {
            let group: ReceiverGroup | null = null;
            if (filter === 'inbox') {
                group = createInboxGroup(msg);
            } else {
                group = createSentGroup(msg);
            }

            if (group) {
                if (!groups[group.id]) {
                    groups[group.id] = group;
                } else {
                    // Add message to existing group
                    groups[group.id].messages.push(msg);
                }
            }
        });

        // Sort groups by the latest message's timestamp (newest first)
        const sortedGroups = Object.values(groups).sort((a, b) => {
            const aLatest = a.messages.reduce(
                (latest, msg) => (new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest),
                a.messages[0],
            );
            const bLatest = b.messages.reduce(
                (latest, msg) => (new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest),
                b.messages[0],
            );
            return new Date(bLatest.created_at).getTime() - new Date(aLatest.created_at).getTime(); // Newest first
        });

        console.log('Grouped and sorted messages (newest group first):', sortedGroups); // Debug
        return sortedGroups;
    }, [filteredMessages, filter]);

    // Filter groups based on search query
    const filteredGroups = useMemo(() => {
        if (!receiverGroups || receiverGroups.length === 0) return [];
        if (!searchQuery) return receiverGroups;

        return receiverGroups.filter(
            (group) =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.messages.some(
                    (msg) =>
                        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        msg.message.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
        );
    }, [receiverGroups, searchQuery]);

    // Default tab: First group's ID or empty string
    const defaultTab = filteredGroups[0]?.id || '';

    // Handle message deletion
    const handleDeleteMessage = (messageId: number) => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(route('messages.destroy', messageId), {
                onSuccess: () => toast.success('Message deleted successfully.'),
                onError: () => toast.error('Failed to delete message.'),
            });
        }
    };

    // Debounced search handler
    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('messages.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        handleSearch(query);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div className="flex items-center justify-between border-b border-muted p-4">
                <div className="flex items-center gap-4">
                    <Select value={filter} onValueChange={(value: 'inbox' | 'sent') => setFilter(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="inbox">Inbox</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative w-full max-w-sm">
                        <Input
                            className="ps-10"
                            placeholder="Search messages, recipients..."
                            type="search"
                            value={searchQuery}
                            onChange={onSearchChange}
                        />
                        <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>

                <Button variant="brand" className="flex items-center gap-1" onClick={() => router.visit(route('messages.create'))}>
                    <SquarePen className="mr-2 h-4 w-4" />
                    Send Message via Email
                </Button>
            </div>

            {filteredGroups.length === 0 ? (
                <div className="p-6 text-center">
                    <EmptyEventBookings
                        title={`No messages found`}
                        action={
                            <Button className="gap-2" onClick={() => router.visit(route('messages.create'))}>
                                <Send className="size-4" />
                                <span>Send a message</span>
                            </Button>
                        }
                    />
                </div>
            ) : (
                <Tabs defaultValue={defaultTab} orientation="vertical" className="h-[calc(100vh-10rem)] w-full">
                    <div className="grid h-full grid-cols-[320px_1fr]">
                        <TabsList className="border-gray max-h-full w-[320px] flex-col justify-start gap-2 overflow-y-auto border-r bg-transparent px-3 py-2">
                            {filteredGroups.map((group) => {
                                // Find the latest message in the group
                                const latestMessage = group.messages.reduce(
                                    (latest, current) => (new Date(current.created_at) > new Date(latest.created_at) ? current : latest),
                                    group.messages[0],
                                );

                                return (
                                    <TabsTrigger
                                        key={group.id}
                                        value={group.id}
                                        className="h-auto w-full justify-start py-3 transition hover:bg-muted/50 data-[state=active]:bg-secondary data-[state=active]:shadow-none"
                                    >
                                        <div className="flex w-full items-start justify-start gap-3 text-left">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="bg-accent2 text-accent">{group.icon}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <p className="truncate font-medium">{group.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{group.subtitle}</p>
                                                {latestMessage && (
                                                    <p className="truncate text-xs text-muted-foreground/80">{latestMessage.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <div className="flex max-h-full w-full flex-col overflow-y-auto bg-background p-6">
                            {filteredGroups.map((group) => (
                                <TabsContent key={group.id} value={group.id} className="mt-0">
                                    {group.messages.length === 0 ? (
                                        <p className="mt-12 text-center text-muted-foreground">No messages for this recipient.</p>
                                    ) : (
                                        group.messages
                                            .slice()
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((message) => (
                                                <article key={message.message_id} className="border-gray relative mb-6 border-b pb-6 last:border-b-0">
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="flex flex-1 items-start gap-2">
                                                            <Avatar>
                                                                <AvatarFallback className="bg-secondary text-xs">
                                                                    {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-1 items-start justify-between">
                                                                <div>
                                                                    <p className="font-medium">{message.sender?.name || 'Unknown Sender'}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {message.sender?.email || message.receiver_email}
                                                                    </p>
                                                                </div>
                                                                <p className="items-center pr-4 text-xs text-muted-foreground">
                                                                    {new Date(message.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            aria-label="Delete message"
                                                            onClick={() => handleDeleteMessage(message.message_id)}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <h2 className="mt-5 text-2xl font-semibold">{message.subject || '(No subject)'}</h2>
                                                    <p className="mb-3 text-xs text-muted-foreground">To: {message.receiver_email}</p>
                                                    <p className="text-left leading-relaxed whitespace-pre-wrap">{message.message}</p>

                                                    {message.attachment && (
                                                        <div className="mt-4">
                                                            <AttachmentViewer filePath={`/storage/${message.attachment}`} />
                                                        </div>
                                                    )}
                                                </article>
                                            ))
                                    )}
                                </TabsContent>
                            ))}
                        </div>
                    </div>
                </Tabs>
            )}
        </AppLayout>
    );
}

// Simplified AttachmentViewer (unchanged, but added error logging)
function AttachmentViewer({ filePath }: { filePath: string }) {
    const [previewError, setPreviewError] = useState(false);
    const ext = filePath.split('.').pop()?.toLowerCase() || '';

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const pdfExts = ['pdf'];
    const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const textExts = ['txt', 'csv', 'log', 'md'];

    if (previewError) {
        console.warn('Attachment preview failed for:', filePath); // Debug
        return (
            <div>
                <a href={filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    Download Attachment
                </a>
                <p className="mt-1 text-sm text-muted-foreground">Preview not available.</p>
            </div>
        );
    }

    const handleError = () => {
        console.error('Error loading attachment:', filePath); // Debug
        setPreviewError(true);
    };

    if (pdfExts.includes(ext)) {
        return (
            <iframe
                src={filePath}
                title="PDF Viewer"
                className="h-96 w-full rounded border"
                onError={handleError}
                onLoad={() => setPreviewError(false)}
            />
        );
    }

    if (officeExts.includes(ext) || textExts.includes(ext)) {
        const encodedUrl = encodeURIComponent(window.location.origin + filePath);
        return (
            <iframe
                src={`https://docs.google.com/gview?url=${encodedUrl}&embedded=true`}
                title="Document Viewer"
                className="h-96 w-full rounded border"
                onError={handleError}
                onLoad={() => setPreviewError(false)}
            />
        );
    }

    return (
        <div>
            <a href={filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                Download Attachment ({ext?.toUpperCase() || 'File'})
            </a>
            <p className="mt-1 text-sm text-muted-foreground">Preview not available for this file type.</p>
        </div>
    );
}
