import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Accordion, AccordionContent, AccordionFooter, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog-origin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import {
    BanknoteIcon,
    CheckCircle,
    CheckIcon,
    ChevronLeft,
    ChevronRight,
    LoaderIcon,
    Mail,
    MapPinCheckInside,
    MessageSquareX,
    Pencil,
    Phone,
    PlusIcon,
    Search,
    Send,
    ThumbsUp,
    Trash,
    TriangleAlert,
    User,
    View,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [{ title: 'Bookings', href: '/appointments/index' }];

interface ServiceType {
    services_id: number;
    service_name: string;
    image?: string;
    pivot?: {
        booking_id: number;
        services_id: number;
        package_id: number;
    };
}

interface PackageType {
    package_id: number;
    package_name: string;
    package_price: number;
    package_promo: string;
    discounted_price: number;
    services_count: number;
    pivot?: {
        booking_id: number;
        services_id: number;
    };
}

interface BookingType {
    booking_id: number;
    transaction_number: string;
    event_name: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    status: string;
    email_verified: number;
    email_verified_at: string;
    guest_count: string;
    special_request: string;
    created_at: string;
    contact_name: string;
    contact_number: string;
    contact_email: string;
    street_address: string;
    total_amount: number;
    city: string;
    province: string;

    payment?: {
        payment_id: number;
        payment_method: string;
        amount: number;
        payment_proof: string;
        reference_No: string;
    };

    services?: ServiceType[];
    packages?: PackageType[];
}

export default function ManageBookings({ bookings }: { bookings: BookingType[] }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('adminbooking.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleSearch(e.target.value);
    }

    function confirmDelete(id: number) {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            router.delete(route('adminbooking.destroy', id), { preserveScroll: true });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Bookings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Event Bookings</CardTitle>
                <CardDescription>You can manage events here.</CardDescription>
                <Tabs defaultValue="all" className="items-left">
                    <div className="mt-4 flex items-center justify-between">
                        {/* Tabs */}
                        <TabsList>
                            <TabsTrigger className="data-[state=active]:text-background" value="all">
                                All
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="pending">
                                Pending
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="confirmed">
                                Confirmed
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="completed">
                                Completed
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="cancelled">
                                Declined
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative ml-4 max-w-md">
                                <Input id="search" className="peer ps-9" placeholder="Search Booking" type="search" onChange={onSearchChange} />
                                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                                    <Search size={16} aria-hidden="true" />
                                </div>
                            </div>
                            <Button
                                variant="brand"
                                className="aspect-square cursor-pointer max-sm:p-0"
                                onClick={() => router.visit(route('adminbooking.create', 'PKG-001'))}
                            >
                                <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                                Add Booking
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="all">
                        <BookingAccordion bookings={bookings} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="pending">
                        <BookingAccordion bookings={bookings.filter((a) => a.status === 'pending')} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="confirmed">
                        <BookingAccordion bookings={bookings.filter((a) => a.status === 'confirmed')} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="completed">
                        <BookingAccordion bookings={bookings.filter((a) => a.status === 'completed')} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="cancelled">
                        <BookingAccordion bookings={bookings.filter((a) => a.status === 'cancelled')} confirmDelete={confirmDelete} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function BookingAccordion({ bookings, confirmDelete }: { bookings: BookingType[]; confirmDelete: (id: number) => void }) {
    if (bookings.length === 0) {
        return (
            <EmptyEventBookings
                title="No bookings found"
                action={
                    <Button className="gap-2" onClick={() => router.visit(`admin-booking/PKG-001/create`)}>
                        <Send className="size-4" />
                        <span>Create Event</span>
                    </Button>
                }
            />
        );
    }

    // Date and time format
    function formatTimeTo12Hour(time: string) {
        if (!time) return '';
        const [hoursStr, minutes] = time.split(':');
        let hours = parseInt(hoursStr, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // convert 0 -> 12
        return `${hours}:${minutes} ${suffix}`;
    }

    function formatDateToWords(dateStr: string) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    const [processing, setProcessing] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<Record<number, boolean>>({});
    const [amounts, setAmounts] = useState<Record<number, number>>({});
    const [processingPayments, setProcessingPayments] = useState<Record<number, boolean>>({});
    const [paymentErrors, setPaymentErrors] = useState<Record<number, any>>({});
    const servicesScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newAmounts: Record<number, number> = {};
        bookings.forEach((booking) => {
            newAmounts[booking.booking_id] = booking.payment?.amount ?? 0;
        });
        setAmounts(newAmounts);
    }, [bookings]);

    const onSubmit = (bookingId: number) => (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingPayments((prev) => ({ ...prev, [bookingId]: true }));
        router.put(
            route('adminbooking.payment.update', bookingId),
            { amount: amounts[bookingId] },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Payment updated successfully');
                    setProcessingPayments((prev) => ({ ...prev, [bookingId]: false }));
                    setPaymentErrors((prev) => ({ ...prev, [bookingId]: undefined }));
                },
                onError: (err) => {
                    toast.error('Failed to update payment');
                    setPaymentErrors((prev) => ({ ...prev, [bookingId]: err }));
                    setProcessingPayments((prev) => ({ ...prev, [bookingId]: false }));
                },
            },
        );
    };

    return (
        <Accordion type="single" collapsible>
            {bookings.map((booking) => {
                function handleDeleteBooking(bookingId: number) {
                    if (confirm('Are you sure you want to delete this booking?')) {
                        router.delete(route('adminbooking.destroy', bookingId), { preserveScroll: true });
                    }
                }

                return (
                    <AccordionItem
                        key={booking.booking_id}
                        value={String(booking.booking_id)}
                        className="mb-3 overflow-hidden rounded-xl border shadow-sm transition-all duration-200 data-[state=open]:relative data-[state=open]:z-20 data-[state=open]:bg-white data-[state=open]:shadow-xl"
                    >
                        <AccordionTrigger className="p-4">
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold text-gray-900 dark:text-gray-300">{booking.event_name}</span>
                                            <span className="text-sm text-gray-500">{booking.packages?.[0]?.package_name ?? ''}</span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`gap-1.5 rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize ${
                                            booking.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : booking.status === 'completed'
                                                  ? 'bg-emerald-100 text-emerald-700'
                                                  : booking.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                        } `}
                                    >
                                        {booking.status === 'pending' ? (
                                            <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
                                        ) : booking.status === 'completed' ? (
                                            <CheckIcon className="text-emerald-500" size={12} aria-hidden="true" />
                                        ) : booking.status === 'cancelled' ? (
                                            <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                                        ) : (
                                            <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
                                        )}
                                        {booking.status}
                                    </Badge>
                                    <div className="p-2">
                                        {booking.email_verified == 0 && !booking.email_verified_at && (
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-red-500 dark:text-red-300">Email not verified.</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        router.put(
                                                            route('adminbooking.verify-email', booking.booking_id),
                                                            {},
                                                            { preserveScroll: true },
                                                        );
                                                    }}
                                                    className="inline-flex items-center text-green-600 hover:text-green-700"
                                                >
                                                    <CheckCircle size={14} className="cursor-pointer" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-xl bg-red-200 px-3 py-3 text-sm font-medium text-red-900">
                                        {formatDateToWords(booking.event_date)}
                                        <span className="text-red-300"> | </span>
                                        {formatTimeTo12Hour(booking.event_time_from)}
                                    </span>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="rounded-b-xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 dark:from-black dark:to-black">
                            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                                {/* Booking Details */}
                                <Card className="overflow-hidden border border-gray-200/70 shadow-sm transition-shadow duration-300 hover:shadow-md">
                                    <CardHeader className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/70 px-6 py-4 dark:bg-gray-800">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-300">Booking Details</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 p-6 text-sm text-gray-700">
                                        {/* Transaction Number */}
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 dark:text-gray-300">Transaction Number</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-300">{booking.transaction_number}</span>
                                        </div>
                                        {/* Guests */}
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 dark:text-gray-300">Guests</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-300">{booking.guest_count}</span>
                                        </div>

                                        {/* Contact Name */}
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <User size={16} className="text-gray-500 dark:text-gray-300" />
                                            <span className="font-medium text-gray-800 dark:text-gray-300">{booking.contact_name}</span>
                                        </div>

                                        {/* Contact Email */}
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <Mail size={16} className="text-gray-500 dark:text-gray-300" />
                                            <span className="text-gray-700 dark:text-gray-300">{booking.contact_email}</span>
                                        </div>

                                        {/* Contact Number */}
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <Phone size={16} className="text-gray-500 dark:text-gray-300" />
                                            <span className="text-gray-700 dark:text-gray-300">{booking.contact_number}</span>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-2 border-b border-gray-100 pb-2">
                                            <MapPinCheckInside size={16} className="mt-0.5 text-gray-500 dark:text-gray-300" />
                                            <span className="leading-tight text-gray-700 dark:text-gray-300">
                                                {booking.street_address}, {booking.city}, {booking.province}
                                            </span>
                                        </div>
                                        {/* Special Request */}
                                        {booking.special_request && (
                                            <div className="flex items-start gap-2 rounded-lg bg-pink-50 px-3 py-2 text-sm font-medium">
                                                <span className="leading-tight text-accent2">📌 {booking.special_request}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Downpayment */}
                                <Card className="overflow-hidden border border-gray-200/70 shadow-sm transition-shadow duration-300 hover:shadow-md">
                                    <CardHeader className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/70 px-6 py-4 dark:bg-gray-800">
                                        <Wallet className="h-5 w-5 text-green-600" />
                                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-300">Downpayment</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 p-6 text-sm text-gray-700 ">
                                        {/* Method */}
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 dark:text-gray-300">Payment Method</span>
                                            <span className="flex items-center gap-3">
                                                {booking.payment?.payment_method === 'cash_on_delivery' ? (
                                                    <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                                                        Cash on Hand
                                                    </span>
                                                ) : booking.payment?.payment_method === 'gcash' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                            GCash
                                                        </span>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-6 w-6 border-gray-300 hover:bg-gray-100"
                                                                >
                                                                    <View size={14} className="opacity-60" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>GCash Receipt</DialogTitle>
                                                                    <DialogDescription>
                                                                        {/* You can insert an image or receipt preview here */}
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter>
                                                                    <DialogClose>
                                                                        <Button variant="outline">Close</Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                ) : (
                                                    <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                                                        Cash on Hand
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Reference No */}
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 dark:text-gray-300">Reference No.</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-300">{booking.payment?.reference_No || '—'}</span>
                                        </div>

                                        {/* Amount */}
                                        <div className="flex justify-between pt-2">
                                            <span className="text-gray-500 dark:text-gray-300">Paid Amount</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-300">
                                                ₱ {Number(booking.payment?.amount || 0).toLocaleString('en-US')}
                                            </span>
                                        </div>
                                        <div
                                            className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium ${
                                                Number(booking.payment?.amount || 0) >= Number(booking.total_amount)
                                                    ? 'bg-green-50 text-green-700 dark:bg-emerald-900/30 dark:text-green-300'
                                                    : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}
                                        >
                                            {Number(booking.payment?.amount || 0) >= Number(booking.total_amount)
                                                ? '✅ Fully Paid'
                                                : '⏳ Awaiting Remaining Balance'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Package Summary */}
                            {booking.packages && booking.packages.length > 0 && (
                                <Card className="mt-10 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
                                        <div>
                                            <p className="font-medium text-gray-600 dark:text-gray-300">Package</p>
                                            <p className="text-gray-900 dark:text-gray-300">{booking.packages[0].package_name}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600 dark:text-gray-300">Services</p>
                                            <p className="text-gray-900 dark:text-gray-300">{booking.services?.length || 0}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600 dark:text-gray-300">Promo</p>
                                            <p className="text-gray-900 dark:text-gray-300">{booking.packages[0].package_promo}%</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600 dark:text-gray-300">Total</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-300">
                                                ₱ {Number(booking.total_amount || 0).toLocaleString('en-US')}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Selected Services */}
                            {booking.services && booking.services.length > 0 && (
                                <div className="mt-10">
                                    <h4 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-300">Selected Services</h4>
                                    <div className="relative">
                                        <div ref={servicesScrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-3 ">
                                            {booking.services.map((srv) => (
                                                <div
                                                    key={srv.services_id}
                                                    className="relative w-[160px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:bg-gray-800"
                                                >
                                                    <div className="flex h-[110px] items-center justify-center overflow-hidden bg-gray-100">
                                                        <img
                                                            src={srv.image ? `/storage/${srv.image}` : '/default-image.png'}
                                                            alt={srv.service_name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="p-2 text-center">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{srv.service_name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Scroll Buttons */}
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-1/2 left-0 -translate-y-1/2 bg-white shadow-md hover:bg-gray-100"
                                            onClick={() => servicesScrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white shadow-md hover:bg-gray-100"
                                            onClick={() => servicesScrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </AccordionContent>

                        <AccordionFooter className="flex w-full items-center justify-between gap-3">
                            <div className="flex items-center gap-10">
                                <div className="flex items-center space-x-1">
                                    <div className="p-2">
                                        <Avatar>
                                            <AvatarImage src={`/storage/`} alt={``} />
                                            <AvatarFallback>{booking.contact_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <Label>{booking.contact_name}</Label>
                                        <CardDescription className="text-sm text-muted-foreground">{booking.contact_email}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {booking.status === 'pending' && (
                                        <>
                                            {/* Accept Button */}
                                            {booking.email_verified == 0 && !booking.email_verified_at ? (
                                                <Dialog
                                                    open={confirmDialogOpen[booking.booking_id] || false}
                                                    onOpenChange={(open) => setConfirmDialogOpen((prev) => ({ ...prev, [booking.booking_id]: open }))}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="link"
                                                            className="flex cursor-pointer items-center gap-3 p-1 underline hover:text-green-600"
                                                        >
                                                            <ThumbsUp className="text-green-600" />
                                                            <strong>Accept Booking</strong>
                                                        </Button>
                                                    </DialogTrigger>

                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <TriangleAlert className="text-destructive" size={25} />
                                                                Email not verified
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <DialogDescription>
                                                            Are you sure you want to accept this booking? <br /> <br />
                                                            The customer will not receive information about their booking and status. This action
                                                            cannot be undone.
                                                        </DialogDescription>

                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button variant="secondary">Cancel</Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="brand"
                                                                onClick={() => {
                                                                    setConfirmDialogOpen((prev) => ({ ...prev, [booking.booking_id]: false }));
                                                                    router.put(
                                                                        route('adminbooking.confirm', booking.booking_id),
                                                                        {},
                                                                        { preserveScroll: true },
                                                                    );
                                                                }}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Button
                                                    variant="link"
                                                    className="flex cursor-pointer items-center gap-3 p-1 underline hover:text-green-600"
                                                    onClick={() => {
                                                        router.put(route('adminbooking.confirm', booking.booking_id), {}, { preserveScroll: true });
                                                    }}
                                                >
                                                    <ThumbsUp className="text-green-600" />
                                                    <strong>Accept Booking</strong>
                                                </Button>
                                            )}

                                            {/* Decline Button */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="link"
                                                        className="flex cursor-pointer items-center gap-3 p-1 underline hover:text-red-600"
                                                    >
                                                        <MessageSquareX className="text-red-500" />
                                                        <strong>Decline</strong>
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Reason for Declination</DialogTitle>
                                                    </DialogHeader>
                                                    <DialogDescription>Please provide the reason for declining this booking.</DialogDescription>

                                                    <Textarea
                                                        value={declineReason}
                                                        onChange={(e) => setDeclineReason(e.target.value)}
                                                        placeholder="Enter reason..."
                                                    />

                                                    <DialogFooter>
                                                        <Button
                                                            disabled={processing}
                                                            variant="brand"
                                                            onClick={() => {
                                                                setProcessing(true);
                                                                router.put(
                                                                    route('adminbooking.decline', booking.booking_id),
                                                                    { decline_reason: declineReason },
                                                                    {
                                                                        preserveScroll: true,
                                                                        onFinish: () => {
                                                                            setProcessing(false);
                                                                            setDeclineReason(''); // reset
                                                                        },
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            {processing && <LoaderIcon className="mr-2 animate-spin" size={16} />}
                                                            Send
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </>
                                    )}

                                    {booking.status === 'confirmed' && (
                                        <Button
                                            variant="link"
                                            className="flex cursor-pointer items-center gap-3 p-1 underline hover:text-green-500"
                                            onClick={() => {
                                                router.put(route('adminbooking.complete', booking.booking_id), {}, { preserveScroll: true });
                                            }}
                                        >
                                            <CheckIcon className="text-green-500" />
                                            <strong>Completed ?</strong>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="aspect-square cursor-pointer max-sm:p-0">
                                                <BanknoteIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                                                <span className="max-sm:sr-only">Pay Now</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Payment</DialogTitle>
                                            </DialogHeader>
                                            <DialogDescription>Enter paid amount here!</DialogDescription>
                                            <form onSubmit={onSubmit(booking.booking_id)} className="mt-4">
                                                <Label htmlFor={`amount-${booking.booking_id}`}>Amount</Label>
                                                <Input
                                                    id={`amount-${booking.booking_id}`}
                                                    type="number"
                                                    min={0}
                                                    value={amounts[booking.booking_id] ?? 0}
                                                    onChange={(e) =>
                                                        setAmounts((prev) => ({ ...prev, [booking.booking_id]: Number(e.target.value) }))
                                                    }
                                                    disabled={processingPayments[booking.booking_id]}
                                                    className="mt-1"
                                                />
                                                {paymentErrors[booking.booking_id]?.amount && (
                                                    <p className="mt-1 text-sm text-red-600">{paymentErrors[booking.booking_id].amount}</p>
                                                )}
                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        variant="brand"
                                                        disabled={processingPayments[booking.booking_id]}
                                                        className="mt-4"
                                                    >
                                                        {processingPayments[booking.booking_id] && (
                                                            <LoaderIcon className="mr-2 animate-spin" size={16} />
                                                        )}
                                                        Save
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div>
                                    <Button variant="link" onClick={() => router.visit(route('adminbooking.edit', booking.booking_id))}>
                                        <Pencil className="mr-1 text-yellow-600 hover:text-gray-800" size={16} aria-hidden="true" />
                                        <CardDescription>Edit</CardDescription>
                                    </Button>
                                </div>
                                <div>
                                    <Button variant="link" className="" onClick={() => handleDeleteBooking(booking.booking_id)}>
                                        <Trash className="mr-1 text-red-600 hover:text-gray-800" aria-hidden="true" />
                                        <CardDescription>Delete</CardDescription>
                                    </Button>
                                </div>
                            </div>
                        </AccordionFooter>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
