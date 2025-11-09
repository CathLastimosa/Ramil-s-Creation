import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Accordion, AccordionContent, AccordionFooter, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import SharedBookingLayout from '@/layouts/shared-booking-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { CheckIcon, Plus, Search, Send, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/shared-events',
    },
];

interface Staff {
    staff_id: number;
    staff_name: string;
    email: string;
    contact_no: string;
    role: string;
    color: string;
    status: string;
    availability: { availability_id: number; day_of_week: string; start_time: string; end_time: string; status: string }[];
}

interface Booking {
    booking_id: number;
    transaction_number: string;
    event_name: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    event_type: string;
    status: string;
    guest_count: number;
    special_request: string;
    contact_name: string;
    contact_number: string;
    contact_email: string;
    street_address: string;
    city: string;
    province: string;
}

interface AssignedStaffType {
    assigned_id: number;
    booking_id: number;
    staff_id: number;
    assigned_role: string;
    staff: Staff;
    booking: Booking;
}

export default function Events({
    bookings,
    assignedEventStaff,
    staff,
}: {
    bookings: Booking[];
    assignedEventStaff: AssignedStaffType[];
    staff: Staff[];
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    // 🔍 Search debounce
    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('events.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value);

    // Map all bookings and associate assigned staff for each
    const eventBookings = (bookings || []).map((booking) => ({
        booking,
        assignedStaff: assignedEventStaff.filter((assigned) => assigned.booking_id === booking.booking_id),
    }));

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openSheet, setOpenSheet] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
    const [currentSelectedStaff, setCurrentSelectedStaff] = useState<number | null>(null);
    const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            <SharedBookingLayout>
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <CardTitle>Assign Staff to Events</CardTitle>
                    <CardDescription>View event bookings and their assigned staff. You can manage staff assignments here.</CardDescription>

                    <div className="flex items-center justify-between">
                        {/* 🔍 Search Bar */}
                        <div className="relative w-full sm:w-1/3">
                            <Input id="search" className="peer ps-9" placeholder="Search Bookings or Staff" type="search" onChange={onSearchChange} />
                            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                                <Search size={16} aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <BookingAccordion
                        bookings={eventBookings}
                        staff={staff}
                        selectedBooking={selectedBooking}
                        setSelectedBooking={setSelectedBooking}
                        openSheet={openSheet}
                        setOpenSheet={setOpenSheet}
                        selectedStaff={selectedStaff}
                        setSelectedStaff={setSelectedStaff}
                        currentSelectedStaff={currentSelectedStaff}
                        setCurrentSelectedStaff={setCurrentSelectedStaff}
                        openAccordionId={openAccordionId}
                        setOpenAccordionId={setOpenAccordionId}
                        confirmDialogOpen={confirmDialogOpen}
                        setConfirmDialogOpen={setConfirmDialogOpen}
                    />
                </div>
            </SharedBookingLayout>
        </AppLayout>
    );
}

/* Reusable Accordion Component */
function BookingAccordion({
    bookings,
    staff,
    selectedBooking,
    setSelectedBooking,
    openSheet,
    setOpenSheet,
    selectedStaff,
    setSelectedStaff,
    currentSelectedStaff,
    setCurrentSelectedStaff,
    openAccordionId,
    setOpenAccordionId,
    confirmDialogOpen,
    setConfirmDialogOpen,
}: {
    bookings: { booking: Booking; assignedStaff: AssignedStaffType[] }[];
    staff: Staff[];
    selectedBooking: Booking | null;
    setSelectedBooking: (b: Booking | null) => void;
    openSheet: boolean;
    setOpenSheet: (b: boolean) => void;
    selectedStaff: number[];
    setSelectedStaff: (ids: number[]) => void;
    currentSelectedStaff: number | null;
    setCurrentSelectedStaff: (s: number | null) => void;
    openAccordionId: string | null;
    setOpenAccordionId: (id: string | null) => void;
    confirmDialogOpen: boolean;
    setConfirmDialogOpen: (b: boolean) => void;
}) {
    if (bookings.length === 0) {
        return (
            <EmptyEventBookings
                title="No bookings found"
                action={
                    <Button className="gap-2" onClick={() => router.visit(route('adminbooking.index'))}>
                        <Send className="size-4" />
                        <span>Go to Module</span>
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
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    return (
        <TooltipProvider>
            <Accordion type="single" collapsible className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                {bookings.map(({ booking, assignedStaff }) => (
                    <AccordionItem
                        key={booking.booking_id}
                        value={String(booking.booking_id)}
                        className="mb-3 overflow-hidden rounded-xl border shadow-sm transition-all duration-200 data-[state=open]:relative data-[state=open]:z-20 data-[state=open]:bg-white"
                    >
                        <AccordionTrigger className="p-5 hover:no-underline">
                            <div className="flex w-full items-start justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">{booking.event_name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {formatDateToWords(booking.event_date)} • {formatTimeTo12Hour(booking.event_time_from)}
                                    </p>
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
                        </AccordionTrigger>
                        <AccordionContent>
                            <CardContent className="border-t bg-gray-50/70 p-6">
                                {/* INFO GRID */}
                                <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
                                    {[
                                        { label: 'Booking ID', value: booking.booking_id },
                                        { label: 'Transaction', value: booking.transaction_number },
                                        { label: 'Event Type', value: booking.event_type },
                                        { label: 'Guest Count', value: booking.guest_count },
                                        { label: 'Contact Person', value: booking.contact_name },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">{item.label}</p>
                                            <p className="font-medium">{item.value}</p>
                                        </div>
                                    ))}

                                    {booking.special_request && (
                                        <div className="col-span-full">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Special Request</p>
                                            <div className="rounded-xl border bg-white p-3 text-gray-600 italic shadow-sm">
                                                {booking.special_request}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* DIVIDER */}
                                <div className="my-6 border-t border-gray-200" />

                                {/* ASSIGNED STAFF */}
                                <div>
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">Assigned Staff</h4>
                                    {assignedStaff.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {assignedStaff.map((assigned) => (
                                                <div
                                                    key={assigned.assigned_id}
                                                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm transition hover:shadow"
                                                >
                                                    <Avatar className="h-9 w-9 border border-gray-200">
                                                        <AvatarImage src="" alt={assigned.staff.staff_name} />
                                                        <AvatarFallback
                                                            className="font-semibold text-white"
                                                            style={{ backgroundColor: assigned.staff.color }}
                                                        >
                                                            {assigned.staff.staff_name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{assigned.staff.staff_name}</p>
                                                        <p className="text-xs text-gray-500">{assigned.assigned_role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyEventBookings title="No staff assigned yet" />
                                    )}
                                </div>
                            </CardContent>
                        </AccordionContent>

                        <AccordionFooter className="rounded-b-xl border-t bg-gray-50/70">
                            <div className="flex w-full items-center gap-3">
                                {/* 👥 Overlapping Staff Avatars */}
                                <div className="flex -space-x-2">
                                    {assignedStaff.slice(0, 5).map((assigned) => (
                                        <Avatar
                                            key={assigned.assigned_id}
                                            className="m-3 rounded-full shadow-sm ring-2 ring-white transition-transform duration-150 hover:scale-105"
                                        >
                                            <AvatarImage src="" alt={assigned.staff.staff_name} />
                                            <AvatarFallback className="font-semibold text-white" style={{ backgroundColor: assigned.staff.color }}>
                                                {assigned.staff.staff_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}

                                    {/* ➕ Overflow Count */}
                                    {assignedStaff.length > 5 && (
                                        <Avatar className="h-9 w-9 rounded-full bg-gray-200 text-gray-700 ring-2 ring-white">
                                            <AvatarFallback>+{assignedStaff.length - 5}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>

                                {/* 🧩 Assign Task Button */}
                                <div className="ml-auto">
                                    <Sheet open={openSheet && selectedBooking?.booking_id === booking.booking_id} onOpenChange={setOpenSheet}>
                                        <SheetTrigger asChild>
                                            <Button
                                                className="m-2 mb-3 flex items-center gap-2 rounded-xl bg-pink-100 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-200"
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setOpenSheet(true);
                                                    setSelectedStaff([]);
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Assign Staff
                                            </Button>
                                        </SheetTrigger>

                                        {/* 🗂 Sheet Content */}
                                        <SheetContent
                                            side="right"
                                            className="w-[440px] overflow-y-auto rounded-l-2xl bg-white p-6 shadow-xl sm:w-[500px]"
                                        >
                                            {/* Header */}
                                            <SheetHeader className="mb-4 border-b pb-4">
                                                <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                                    🧾 Assign Staff
                                                </SheetTitle>
                                                <p className="text-base font-medium text-gray-800">{selectedBooking?.event_name}</p>
                                                <CardDescription className="text-sm text-gray-500">
                                                    {formatDateToWords(booking.event_date)} • {formatTimeTo12Hour(booking.event_time_from)}
                                                </CardDescription>
                                            </SheetHeader>

                                            <div className="space-y-6">
                                                {/* 🧑‍💼 Currently Assigned */}
                                                <div>
                                                    <p className="mb-3 text-sm font-semibold text-gray-700">Currently Assigned</p>
                                                    <div className="space-y-2">
                                                        {selectedBooking &&
                                                            bookings
                                                                .find((b) => b.booking.booking_id === selectedBooking.booking_id)
                                                                ?.assignedStaff.map((assigned) => (
                                                                    <div
                                                                        key={assigned.assigned_id}
                                                                        className="border-white-900 bg-white-900 flex items-center justify-between gap-3 rounded-2xl p-3 transition hover:bg-gray-100"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Avatar className="h-9 w-9 border border-white shadow-sm">
                                                                                <AvatarImage src="" alt={assigned.staff.staff_name} />
                                                                                <AvatarFallback
                                                                                    className="font-semibold text-white"
                                                                                    style={{ backgroundColor: assigned.staff.color }}
                                                                                >
                                                                                    {assigned.staff.staff_name.charAt(0)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-800">
                                                                                    {assigned.staff.staff_name}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">{assigned.assigned_role}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-gray-500 hover:text-red-600"
                                                                            onClick={() =>
                                                                                router.delete(route('assignedstaff.destroy', assigned.assigned_id))
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                    </div>
                                                </div>

                                                {/* ➕ Add New Staff */}
                                                <div>
                                                    <p className="mb-3 text-sm font-semibold text-gray-700">Add New Staff</p>

                                                    {selectedStaff.map((staffId) => {
                                                        const s = staff.find((st) => st.staff_id === staffId);
                                                        return (
                                                            <div
                                                                key={staffId}
                                                                className="mb-3 flex items-center justify-between rounded-xl border-gray-200 bg-white px-4 text-sm shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                                                            >
                                                                <span className="font-medium text-gray-700">{s?.staff_name}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-gray-500 hover:text-red-600"
                                                                    onClick={() => setSelectedStaff(selectedStaff.filter((id) => id !== staffId))}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}

                                                    <Select
                                                        value={currentSelectedStaff ? currentSelectedStaff.toString() : ''}
                                                        onValueChange={(value) => setCurrentSelectedStaff(parseInt(value))}
                                                    >
                                                        <SelectTrigger className="rounded-xl border-gray-300">
                                                            <SelectValue placeholder="Select staff to assign" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {staff
                                                                .filter(
                                                                    (s) =>
                                                                        (!selectedBooking ||
                                                                            !bookings
                                                                                .find((b) => b.booking.booking_id === selectedBooking.booking_id)
                                                                                ?.assignedStaff.some((a) => a.staff_id === s.staff_id)) &&
                                                                        !selectedStaff.includes(s.staff_id),
                                                                )
                                                                .map((s) => (
                                                                    <SelectItem key={s.staff_id} value={s.staff_id.toString()}>
                                                                        {s.staff_name} {s.role ? `(${s.role})` : ''}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* 📅 Availability */}
                                                {currentSelectedStaff && (
                                                    <div className="mt-4 space-y-2">
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {staff.find((s) => s.staff_id === currentSelectedStaff)?.staff_name}'s Availability
                                                        </p>
                                                        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b pb-1 text-xs font-semibold text-gray-500 uppercase">
                                                            <span>Day</span>
                                                            <span className="text-center">Start</span>
                                                            <span className="text-center">End</span>
                                                            <span className="text-center">Status</span>
                                                        </div>
                                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                                            const selectedStaffMember = staff.find((s) => s.staff_id === currentSelectedStaff);
                                                            const av = selectedStaffMember?.availability.find((a) => a.day_of_week === day);
                                                            const isBlocked =
                                                                av?.status === 'blocked' || av?.status === 'unavailable' || !av?.start_time;
                                                            return (
                                                                <div
                                                                    key={day}
                                                                    className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b py-1.5 text-sm"
                                                                >
                                                                    <span
                                                                        className={`font-medium ${
                                                                            isBlocked ? 'text-gray-400 line-through' : 'text-gray-700'
                                                                        }`}
                                                                    >
                                                                        {day}
                                                                    </span>
                                                                    <span className={`text-center ${isBlocked ? 'text-gray-400 line-through' : ''}`}>
                                                                        {av?.start_time ? formatTimeTo12Hour(av.start_time) : 'N/A'}
                                                                    </span>
                                                                    <span className={`text-center ${isBlocked ? 'text-gray-400 line-through' : ''}`}>
                                                                        {av?.end_time ? formatTimeTo12Hour(av.end_time) : 'N/A'}
                                                                    </span>
                                                                    <span
                                                                        className={`text-center ${isBlocked ? 'text-red-500' : 'text-emerald-500'}`}
                                                                    >
                                                                        {av?.status || (isBlocked ? 'Blocked' : 'Available')}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* ⚙️ Action Buttons */}
                                                <div className="flex gap-3 border-t pt-4">
                                                    {(() => {
                                                        const selectedStaffMember = staff.find((s) => s.staff_id === currentSelectedStaff);
                                                        const eventDate = selectedBooking ? new Date(selectedBooking.event_date) : null;
                                                        const dayOfWeek = eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'long' }) : '';
                                                        const av = selectedStaffMember?.availability.find((a) => a.day_of_week === dayOfWeek);
                                                        const isBlocked = av?.status === 'blocked' || av?.status === 'unavailable' || !av?.start_time;
                                                        const button = (
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 border-gray-300"
                                                                onClick={() => {
                                                                    if (currentSelectedStaff) {
                                                                        setSelectedStaff([...selectedStaff, currentSelectedStaff]);
                                                                        setCurrentSelectedStaff(null);
                                                                    }
                                                                }}
                                                                disabled={!currentSelectedStaff}
                                                            >
                                                                Add Staff
                                                            </Button>
                                                        );
                                                        return isBlocked ? (
                                                            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="flex-1 border-gray-300"
                                                                        onClick={() => setConfirmDialogOpen(true)}
                                                                        disabled={!currentSelectedStaff}
                                                                    >
                                                                        Add Staff
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>
                                                                            <div className="flex items-center gap-2">
                                                                                <TriangleAlert className="text-destructive" size={25} />
                                                                                Warning
                                                                            </div>
                                                                        </DialogTitle>
                                                                        <DialogDescription>
                                                                            <div>
                                                                                <p className='mb-4 mt-3'>Are you sure you want to add this staff because they are not available. </p>
                                                                                <p className='text-sm '>Note: <i>You may change Staff's availability in Staff Module.</i></p>
                                                                            </div>
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter>
                                                                        <Button variant="secondary" onClick={() => setConfirmDialogOpen(false)}>
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => {
                                                                                if (currentSelectedStaff) {
                                                                                    setSelectedStaff([...selectedStaff, currentSelectedStaff]);
                                                                                    setCurrentSelectedStaff(null);
                                                                                }
                                                                                setConfirmDialogOpen(false);
                                                                            }}
                                                                        >
                                                                            Confirm
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : (
                                                            button
                                                        );
                                                    })()}
                                                    <Button
                                                        className="flex-1 bg-pink-500 text-white hover:bg-pink-600"
                                                        onClick={() => {
                                                            if (selectedBooking) {
                                                                router.post(route('assignedstaff.store'), {
                                                                    booking_id: selectedBooking.booking_id,
                                                                    staff_ids: selectedStaff,
                                                                    assigned_role: 'Assigned',
                                                                    booking_type: 'event',
                                                                });
                                                            }
                                                            setSelectedStaff([]);
                                                            setCurrentSelectedStaff(null);
                                                            setOpenSheet(false);
                                                        }}
                                                        disabled={selectedStaff.length === 0}
                                                    >
                                                        Assign
                                                    </Button>
                                                </div>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        </AccordionFooter>
                    </AccordionItem>
                ))}
            </Accordion>
        </TooltipProvider>
    );
}
