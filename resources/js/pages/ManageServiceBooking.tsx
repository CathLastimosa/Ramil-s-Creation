import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Accordion, AccordionContent, AccordionFooter, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog-origin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import {
    BanknoteIcon,
    CalendarClock,
    CheckIcon,
    Clock,
    FileText,
    LoaderIcon,
    LucidePlus,
    MessageSquare,
    Pencil,
    PlusIcon,
    Search,
    Trash,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [{ title: 'Service Bookings', href: '/service-bookings/index' }];

interface ServiceBookingType {
    service_booking_id: number;
    title: string;
    service_name: string;
    description: string;
    comment: string;
    contact_name: string;
    contact_number: string;
    contact_email: string;
    date: string;
    return_date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    created_at: string;
}

export default function ManageServiceBookings({ service_bookings }: { service_bookings: ServiceBookingType[] }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('service-bookings.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleSearch(e.target.value);
    }

    function confirmDelete(id: number) {
        if (window.confirm('Are you sure you want to delete this service booking?')) {
            router.delete(route('service-bookings.destroy', id), { preserveScroll: true });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Service Bookings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Service Bookings</CardTitle>
                <CardDescription>You can manage service bookings here.</CardDescription>
                <Tabs defaultValue="all" className="items-left">
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Tabs */}
                        <TabsList className="w-full overflow-x-auto sm:w-auto">
                            <TabsTrigger className="data-[state=active]:text-background" value="all">
                                All
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="confirmed">
                                Confirmed
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="completed">
                                Completed
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="cancelled">
                                Cancelled
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search */}
                            <div className="relative max-w-md">
                                <Input
                                    id="search"
                                    className="peer ps-9"
                                    placeholder="Search Service Booking"
                                    type="search"
                                    onChange={onSearchChange}
                                />
                                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                                    <Search size={16} aria-hidden="true" />
                                </div>
                            </div>
                            <Button
                                variant="brand"
                                className="aspect-square cursor-pointer max-sm:p-0"
                                onClick={() => router.visit(route('service-bookings.create'))}
                            >
                                <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                                Add Service Booking
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="all">
                        <ServiceBookingAccordion service_bookings={service_bookings} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="confirmed">
                        <ServiceBookingAccordion
                            service_bookings={service_bookings.filter((a) => a.status === 'confirmed')}
                            confirmDelete={confirmDelete}
                        />
                    </TabsContent>

                    <TabsContent value="completed">
                        <ServiceBookingAccordion
                            service_bookings={service_bookings.filter((a) => a.status === 'completed')}
                            confirmDelete={confirmDelete}
                        />
                    </TabsContent>

                    <TabsContent value="cancelled">
                        <ServiceBookingAccordion
                            service_bookings={service_bookings.filter((a) => a.status === 'cancelled')}
                            confirmDelete={confirmDelete}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function ServiceBookingAccordion({
    service_bookings,
    confirmDelete,
}: {
    service_bookings: ServiceBookingType[];
    confirmDelete: (id: number) => void;
}) {
    if (service_bookings.length === 0) {
        return (
            <EmptyEventBookings
                title="No service booking found"
                action={
                    <Button className="gap-2" onClick={() => router.visit(route('adminappointments.create'))}>
                        <LucidePlus className="size-4" />
                        <span>Create Service</span>
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

    return (
        <Accordion type="single" collapsible>
            {service_bookings.map((booking) => {
                const {
                    data,
                    setData,
                    put,
                    processing: paymentProcessing,
                    errors,
                } = useForm({
                    paid_amount: booking.paid_amount ?? 0,
                });
                const onSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    put(route('service-bookings.updatePayment', booking.service_booking_id), {
                        preserveScroll: true,
                        onError: () => {
                            toast.error('Failed to update payment');
                        },
                    });
                };

                function handleDeleteBooking(bookingId: number) {
                    if (confirm('Are you sure you want to delete this service booking?')) {
                        router.delete(route('service-bookings.destroy', bookingId));
                    }
                }

                return (
                    <AccordionItem
                        key={booking.service_booking_id}
                        value={String(booking.service_booking_id)}
                        className="mb-3 overflow-hidden rounded-xl border shadow-sm transition-all duration-200 data-[state=open]:relative data-[state=open]:z-20 data-[state=open]:bg-white data-[state=open]:shadow-xl"
                    >
                        <AccordionTrigger className="p-4">
                            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex flex-col text-left">
                                        <span className="font-semibold text-gray-900 dark:text-gray-300">{booking.title}</span>
                                        <span className="text-sm text-gray-500">{booking.service_name}</span>
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
                                </div>
                                <div className="flex items-center justify-center sm:justify-end">
                                    <span className="rounded-xl bg-violet-200 px-3 py-3 text-sm font-medium text-violet-900">
                                        {formatDateToWords(booking.date)}
                                        <span className="text-violet-300"> | </span>
                                        {formatTimeTo12Hour(booking.start_time)}
                                    </span>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="rounded-b-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 dark:from-black dark:to-black">
                            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                                {/* --- Left: Service Booking Details --- */}
                                <Card className="overflow-hidden border border-gray-200/70 shadow-sm transition-shadow duration-300 hover:shadow-md">
                                    <CardHeader className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/70 px-6 py-4">
                                        <FileText className="h-5 w-5 text-indigo-600" />
                                        <CardTitle className="text-base font-semibold text-gray-800">Service Booking Details</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 p-6 text-sm text-gray-700">
                                        {/* Description */}
                                        <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <FileText size={16} /> Description
                                            </span>
                                            <span className="max-w-[60%] text-right font-medium text-gray-900">{booking.description || '—'}</span>
                                        </div>

                                        {/* Comment */}
                                        <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <MessageSquare size={16} /> Comment
                                            </span>
                                            <span className="max-w-[60%] text-right font-medium text-gray-900">{booking.comment || '—'}</span>
                                        </div>

                                        {/* Return Date */}
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <CalendarClock size={16} /> Return Date
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {booking.return_date ? formatDateToWords(booking.return_date) : 'N/A'}
                                            </span>
                                        </div>

                                        {/* End Time */}
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <Clock size={16} /> End Time
                                            </span>
                                            <span className="font-medium text-gray-900">{formatTimeTo12Hour(booking.end_time)}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* --- Right: Payment Information --- */}
                                <Card className="overflow-hidden border border-gray-200/70 shadow-sm transition-shadow duration-300 hover:shadow-md">
                                    <CardHeader className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/70 px-6 py-4">
                                        <Wallet className="h-5 w-5 text-green-600" />
                                        <CardTitle className="text-base font-semibold text-gray-800">Payment Information</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 p-6 text-sm text-gray-700">
                                        {/* Total Amount */}
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">Total Amount</span>
                                            <span className="font-semibold text-gray-900">
                                                ₱ {Number(booking.total_amount || 0).toLocaleString('en-US')}
                                            </span>
                                        </div>

                                        {/* Paid Amount */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Paid Amount</span>
                                            <span className="font-semibold text-green-600">
                                                ₱ {Number(booking.paid_amount || 0).toLocaleString('en-US')}
                                            </span>
                                        </div>

                                        {/* Payment Status */}
                                        <div
                                            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                                                Number(booking.paid_amount) >= Number(booking.total_amount)
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-yellow-50 text-yellow-700'
                                            }`}
                                        >
                                            {Number(booking.paid_amount) >= Number(booking.total_amount)
                                                ? '✅ Fully Paid'
                                                : '⏳ Awaiting Remaining Balance'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </AccordionContent>

                        <AccordionFooter className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                                    {booking.status === 'confirmed' && (
                                        <Button
                                            variant="link"
                                            className="flex cursor-pointer items-center gap-3 p-1 underline hover:text-green-500"
                                            onClick={() => {
                                                router.put(
                                                    route('service-bookings.complete', booking.service_booking_id),
                                                    {},
                                                    { preserveScroll: true },
                                                );
                                            }}
                                        >
                                            <CheckIcon className="text-green-500" />
                                            <span className="max-sm:sr-only">Completed ?</span>
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
                                                <DialogTitle>Update Payment</DialogTitle>
                                            </DialogHeader>
                                            <DialogDescription>Enter paid amount here!</DialogDescription>
                                            <form onSubmit={onSubmit} className="mt-4">
                                                <Label htmlFor={`paid_amount-${booking.service_booking_id}`}>Paid Amount</Label>
                                                <Input
                                                    id={`paid_amount-${booking.service_booking_id}`}
                                                    type="number"
                                                    min={0}
                                                    value={data.paid_amount}
                                                    onChange={(e) => setData('paid_amount', Number(e.target.value))}
                                                    disabled={paymentProcessing}
                                                    className="mt-1"
                                                />
                                                {errors.paid_amount && <p className="mt-1 text-sm text-red-600">{errors.paid_amount}</p>}
                                                <DialogFooter>
                                                    <Button type="submit" variant="outline" disabled={paymentProcessing} className="mt-4">
                                                        {paymentProcessing && <LoaderIcon className="mr-2 animate-spin" size={16} />}
                                                        Save
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div>
                                    <Button
                                        variant="link"
                                        className="aspect-square cursor-pointer max-sm:p-0"
                                        onClick={() => router.visit(route('service-bookings.edit', booking.service_booking_id))}
                                    >
                                        <Pencil className="text-yellow-600 opacity-60 hover:text-gray-800 sm:-ms-1" size={16} aria-hidden="true" />
                                        <span className="max-sm:sr-only">Edit</span>
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        variant="link"
                                        className="aspect-square cursor-pointer max-sm:p-0"
                                        onClick={() => handleDeleteBooking(booking.service_booking_id)}
                                    >
                                        <Trash className="text-red-600 opacity-60 hover:text-gray-800 sm:-ms-1" aria-hidden="true" />
                                        <span className="max-sm:sr-only">Delete</span>
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
