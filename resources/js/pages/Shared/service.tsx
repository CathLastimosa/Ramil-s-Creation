import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Accordion, AccordionContent, AccordionFooter, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import SharedBookingLayout from '@/layouts/shared-booking-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { CheckIcon, Plus, Search, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service',
        href: '/shared-service',
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

interface ServiceBooking {
    service_booking_id: number;
    title: string;
    service_name: string;
    description: string;
    comment: string;
    date: string;
    return_date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    paid_amount: number;
    status: string;
}

interface AssignedStaffType {
    assigned_id: number;
    service_booking_id: number;
    staff_id: number;
    assigned_role: string;
    assigned_at: string;
    booking_type: string;
    staff: Staff;
    service_booking: ServiceBooking;
}

export default function Service({
    assignedServiceStaff,
    staff,
    serviceBookings,
}: {
    assignedServiceStaff: AssignedStaffType[];
    staff: Staff[];
    serviceBookings: ServiceBooking[];
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    // 🔍 Search debounce
    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('sharedservice.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value);

    // Map all service bookings and associate assigned staff for each
    const mappedServiceBookings = (serviceBookings || []).map((serviceBooking) => ({
        serviceBooking,
        assignedStaff: assignedServiceStaff.filter((assigned) => assigned.service_booking_id === serviceBooking.service_booking_id),
    }));

    const [selectedServiceBooking, setSelectedServiceBooking] = useState<ServiceBooking | null>(null);
    const [openSheet, setOpenSheet] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
    const [currentSelectedStaff, setCurrentSelectedStaff] = useState<number | null>(null);
    const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service" />
            <SharedBookingLayout>
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <CardTitle>Assign Staff to Services</CardTitle>
                    <CardDescription>View service bookings and their assigned staff. You can manage staff assignments here.</CardDescription>

                    <div className="flex items-center justify-between">
                        {/* 🔍 Search Bar */}
                        <div className="relative w-full sm:w-1/3">
                            <Input id="search" className="peer ps-9" placeholder="Search Bookings or Staff" type="search" onChange={onSearchChange} />
                            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                                <Search size={16} aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <ServiceBookingAccordion
                        serviceBookings={mappedServiceBookings}
                        staff={staff}
                        selectedServiceBooking={selectedServiceBooking}
                        setSelectedServiceBooking={setSelectedServiceBooking}
                        openSheet={openSheet}
                        setOpenSheet={setOpenSheet}
                        selectedStaff={selectedStaff}
                        setSelectedStaff={setSelectedStaff}
                        currentSelectedStaff={currentSelectedStaff}
                        setCurrentSelectedStaff={setCurrentSelectedStaff}
                        openAccordionId={openAccordionId}
                        setOpenAccordionId={setOpenAccordionId}
                    />
                </div>
            </SharedBookingLayout>
        </AppLayout>
    );
}

/* Service Booking Accordion Component */
function ServiceBookingAccordion({
    serviceBookings,
    staff,
    selectedServiceBooking,
    setSelectedServiceBooking,
    openSheet,
    setOpenSheet,
    selectedStaff,
    setSelectedStaff,
    currentSelectedStaff,
    setCurrentSelectedStaff,
    openAccordionId,
    setOpenAccordionId,
}: {
    serviceBookings: { serviceBooking: ServiceBooking; assignedStaff: AssignedStaffType[] }[];
    staff: Staff[];
    selectedServiceBooking: ServiceBooking | null;
    setSelectedServiceBooking: (b: ServiceBooking | null) => void;
    openSheet: boolean;
    setOpenSheet: (b: boolean) => void;
    selectedStaff: number[];
    setSelectedStaff: (ids: number[]) => void;
    currentSelectedStaff: number | null;
    setCurrentSelectedStaff: (s: number | null) => void;
    openAccordionId: string | null;
    setOpenAccordionId: (id: string | null) => void;
}) {
    if (serviceBookings.length === 0) {
        return (
            <EmptyEventBookings
                title="No appointment found"
                action={
                    <Button className="gap-2" onClick={() => router.visit(route('service-bookings.index'))}>
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
        <Accordion type="single" collapsible className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
            {serviceBookings.map(({ serviceBooking, assignedStaff }) => (
                <AccordionItem
                    key={serviceBooking.service_booking_id}
                    value={String(serviceBooking.service_booking_id)}
                    className="mb-3 overflow-hidden rounded-xl border shadow-sm transition-all duration-200 data-[state=open]:relative data-[state=open]:z-20 data-[state=open]:bg-white"
                >
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex w-full items-start justify-between">
                            <div>
                                <CardTitle className="mb-2 flex items-center justify-between">{serviceBooking.title}</CardTitle>
                                <div className="text-sm text-muted-foreground">
                                    {formatDateToWords(serviceBooking.date)} | {formatTimeTo12Hour(serviceBooking.start_time)}
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={`gap-1.5 rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize ${
                                    serviceBooking.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : serviceBooking.status === 'completed'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : serviceBooking.status === 'cancelled'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                } `}
                            >
                                {serviceBooking.status === 'pending' ? (
                                    <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
                                ) : serviceBooking.status === 'completed' ? (
                                    <CheckIcon className="text-emerald-500" size={12} aria-hidden="true" />
                                ) : serviceBooking.status === 'cancelled' ? (
                                    <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                                ) : (
                                    <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
                                )}
                                {serviceBooking.status}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CardContent className="p-4">
                            <div className="space-y-2 text-sm">
                                <p>
                                    <strong>ID:</strong> {serviceBooking.service_booking_id}
                                </p>
                                <p>
                                    <strong>Service:</strong> {serviceBooking.service_name}
                                </p>
                                <p>
                                    <strong>Description:</strong> {serviceBooking.description}
                                </p>
                                <p>
                                    <strong>Amount:</strong> ₱{serviceBooking.total_amount}
                                </p>
                                <p>
                                    <strong>Status:</strong> {serviceBooking.status}
                                </p>
                                {serviceBooking.comment && (
                                    <p>
                                        <strong>Comment:</strong> {serviceBooking.comment}
                                    </p>
                                )}
                            </div>
                            <div className="mt-4">
                                <h4 className="mb-2 text-sm font-semibold">Assigned Staff:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {assignedStaff.map((assigned) => (
                                        <div key={assigned.assigned_id} className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" alt={assigned.staff.staff_name} />
                                                <AvatarFallback className="font-medium text-white" style={{ backgroundColor: assigned.staff.color }}>
                                                    {assigned.staff.staff_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{assigned.staff.staff_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </AccordionContent>
                    <AccordionFooter>
                        <div className="flex w-full items-center pl-3">
                            <div className="flex -space-x-[0.675rem]">
                                {assignedStaff.slice(0, 5).map((assigned) => {
                                    return (
                                        <Avatar key={assigned.assigned_id} className={`h-9 w-9 rounded-full ring-2 ring-background`}>
                                            <AvatarImage src="" alt={assigned.staff.staff_name} />
                                            <AvatarFallback className="font-medium text-white" style={{ backgroundColor: assigned.staff.color }}>
                                                {assigned.staff.staff_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    );
                                })}
                                {assignedStaff.length > 5 && (
                                    <Avatar className="h-9 w-9 rounded-full bg-gray-200 ring-2 ring-background">
                                        <AvatarFallback>+{assignedStaff.length - 5}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                            <div className="ml-auto">
                                <Sheet
                                    open={openSheet && selectedServiceBooking?.service_booking_id === serviceBooking.service_booking_id}
                                    onOpenChange={setOpenSheet}
                                >
                                    <SheetTrigger asChild>
                                        <Button
                                            className="m-2 mb-3 flex items-center gap-2 rounded-xl bg-pink-100 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-200"
                                            onClick={() => {
                                                setSelectedServiceBooking(serviceBooking);
                                                setOpenSheet(true);
                                                setSelectedStaff([]);
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Assign Staff
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent
                                        side="right"
                                        className="w-[440px] overflow-y-auto rounded-l-2xl bg-white p-6 shadow-xl sm:w-[500px]"
                                    >
                                        {/* Header */}
                                        <SheetHeader className="mb-4 border-b pb-4">
                                            <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                                🧾 Assign Staff
                                            </SheetTitle>
                                            <p className="text-base font-medium text-gray-800">{selectedServiceBooking?.title}</p>
                                            <CardDescription className="text-sm text-gray-500">
                                                {formatDateToWords(serviceBooking.date)} | {formatTimeTo12Hour(serviceBooking.start_time)}
                                            </CardDescription>
                                        </SheetHeader>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="mb-3 text-sm font-semibold text-gray-700">Currently Assigned</p>
                                                <div className="space-y-2">
                                                    {selectedServiceBooking &&
                                                        serviceBookings
                                                            .find(
                                                                (b) =>
                                                                    b.serviceBooking.service_booking_id === selectedServiceBooking.service_booking_id,
                                                            )
                                                            ?.assignedStaff.map((assigned) => (
                                                                <div
                                                                    key={assigned.assigned_id}
                                                                    className="border-white-900 bg-white-900 flex items-center justify-between gap-3 rounded-2xl p-3 transition hover:bg-gray-100"
                                                                >
                                                                    <div className="flex items-center gap-3">
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
                                                                            <p className="text-sm font-medium text-gray-900">
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
                                                                    (!selectedServiceBooking ||
                                                                        !serviceBookings
                                                                            .find(
                                                                                (b) =>
                                                                                    b.serviceBooking.service_booking_id ===
                                                                                    selectedServiceBooking.service_booking_id,
                                                                            )
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
                                                        const isBlocked = av?.status === 'blocked' || av?.status === 'unavailable' || !av?.start_time;
                                                        return (
                                                            <div
                                                                key={day}
                                                                className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b py-1.5 text-sm"
                                                            >
                                                                <span
                                                                    className={`text-xs font-medium ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                                                >
                                                                    {day}
                                                                </span>
                                                                <span
                                                                    className={`text-center text-xs ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                                                >
                                                                    {av?.start_time ? formatTimeTo12Hour(av.start_time) : 'N/A'}
                                                                </span>
                                                                <span
                                                                    className={`text-center text-xs ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                                                >
                                                                    {av?.end_time ? formatTimeTo12Hour(av.end_time) : 'N/A'}
                                                                </span>
                                                                <span
                                                                    className={`text-center text-xs ${isBlocked ? 'text-destructive' : 'text-emerald-500'}`}
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
                                                <Button
                                                    className="flex-1 bg-pink-500 text-white hover:bg-pink-600"
                                                    onClick={() => {
                                                        if (selectedServiceBooking) {
                                                            router.post(route('assignedstaff.store'), {
                                                                service_booking_id: selectedServiceBooking.service_booking_id,
                                                                staff_ids: selectedStaff,
                                                                assigned_role: 'Assigned', // or use a default, since roles may vary
                                                                booking_type: 'service',
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
    );
}
