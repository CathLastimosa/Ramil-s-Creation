import { printAppointments, printBookings, printServiceBookings } from '@/components/PrintUtils';
import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Download, Filter, Printer, Search, Send, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Report', href: 'report' }];

interface BookingType {
    booking_id: string;
    transaction_number: string;
    event_name: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    event_type: string;
    guest_count: number;
    special_request: string;
    contact_name: string;
    contact_number: string;
    contact_email: string;
    street_address: string;
    city: string;
    province: string;
}

interface AppointmentType {
    appointment_id: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    purpose: string;
    appointment_date: string;
    appointment_time_from: string;
    appointment_time_to: string;
}

interface ServiceBookingType {
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
    created_at: string;
}

export default function Report({
    booking,
    appointment,
    service_booking,
}: {
    booking: BookingType[];
    appointment: AppointmentType[];
    service_booking: ServiceBookingType[];
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const [activeTab, setActiveTab] = useState('bookings');

    // Filter states
    const [filters, setFilters] = useState({
        date: '',
        month: '',
        year: '',
        package_name: '',
    });

    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('report.index'), { search: query, ...filters }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleSearch(e.target.value);
    }

    const applyFilters = () => {
        router.get(route('report.index'), { search: '', ...filters }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFilters({ date: '', month: '', year: '', package_name: '' });
        router.get(route('report.index'), { search: '' }, { preserveState: true, replace: true });
    };

    const clearFilter = (filterKey: keyof typeof filters) => {
        const newFilters = { ...filters, [filterKey]: '' };
        setFilters(newFilters);
        router.get(route('report.index'), { search: '', ...newFilters }, { preserveState: true, replace: true });
    };

    const confirmDeleteBooking = (id: string) => {
        if (window.confirm('Are you sure you want to permanently delete this booking?')) {
            router.delete(route('booking.report.destroy', { id }), {
                preserveScroll: true,
            });
        }
    };

    function confirmDeleteAppointment(id: string) {
        if (window.confirm('Are you sure you want to permanently delete this appointment?')) {
            router.delete(route('appointment.report.destroy', { id }), { preserveScroll: true });
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    const openReportPdf = (bookingId: string) => {
        window.open(`/admin-booking/${bookingId}/report-pdf`, '_blank');
    };

    const monthNames: { [key: string]: string } = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Report</CardTitle>
                <CardDescription className="mb-2">You can manage bookings and appointments reports here.</CardDescription>
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-1/4">
                        <Input id="search" className="peer ps-9" placeholder="Search Reports" type="search" onChange={onSearchChange} />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                            <Search size={16} aria-hidden="true" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <div className="flex flex-wrap gap-2">
                            {filters.date && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Date: {filters.date}
                                    <button type="button" className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('date')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.month && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Month: {monthNames[filters.month]}
                                    <button type="button" className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('month')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.year && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Year: {filters.year}
                                    <button type="button" className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('year')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.package_name && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Package: {filters.package_name}
                                    <button type="button" className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('package_name')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Filters
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-85 rounded-2xl border border-gray-100 bg-white shadow-xl">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="leading-none font-medium">Filter Reports</h4>
                                                <p className="text-sm text-muted-foreground">Filter by date, month, year, or package type.</p>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="date">Date</Label>
                                                    <Select value={filters.date} onValueChange={(value) => setFilters({ ...filters, date: value })}>
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue placeholder="Select date" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                                                                    {day}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="month">Month</Label>
                                                    <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue placeholder="Select month" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="01">January</SelectItem>
                                                            <SelectItem value="02">February</SelectItem>
                                                            <SelectItem value="03">March</SelectItem>
                                                            <SelectItem value="04">April</SelectItem>
                                                            <SelectItem value="05">May</SelectItem>
                                                            <SelectItem value="06">June</SelectItem>
                                                            <SelectItem value="07">July</SelectItem>
                                                            <SelectItem value="08">August</SelectItem>
                                                            <SelectItem value="09">September</SelectItem>
                                                            <SelectItem value="10">October</SelectItem>
                                                            <SelectItem value="11">November</SelectItem>
                                                            <SelectItem value="12">December</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="year">Year</Label>
                                                    <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue placeholder="Select year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                                                                <SelectItem key={year} value={year.toString()}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="package_name">Package Type</Label>
                                                    <Select
                                                        value={filters.package_name}
                                                        onValueChange={(value) => setFilters({ ...filters, package_name: value })}
                                                    >
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue placeholder="Select package" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Wedding">Wedding</SelectItem>
                                                            <SelectItem value="Birthday">Birthday</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={clearFilters}>
                                                    Clear
                                                </Button>
                                                <Button onClick={applyFilters}>Apply</Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => {
                                if (activeTab === 'bookings') {
                                    printBookings(booking);
                                } else if (activeTab === 'appointments') {
                                    printAppointments(appointment);
                                } else if (activeTab === 'service-bookings') {
                                    printServiceBookings(service_booking);
                                }
                            }}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print {activeTab === 'bookings' ? 'Bookings' : activeTab === 'appointments' ? 'Appointments' : 'Service Bookings'} Report
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="mb-2 flex items-center justify-between">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger className="data-[state=active]:text-background" value="bookings">
                                Event Bookings
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="appointments">
                                Appointments
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="service-bookings">
                                Service Bookings
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="bookings">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event Date & Time</TableHead>
                                        <TableHead>Transaction Number</TableHead>
                                        <TableHead>Event Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Event Type</TableHead>
                                        <TableHead className="hidden sm:table-cell">Contact Name</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.length > 0 ? (
                                        booking.map((b) => (
                                            <TableRow key={b.transaction_number}>
                                                <TableCell>
                                                    {formatDate(b.event_date)} {formatTime(b.event_time_from)} - {formatTime(b.event_time_to)}
                                                </TableCell>
                                                <TableCell>{b.transaction_number}</TableCell>
                                                <TableCell>{b.event_name}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{b.event_type}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{b.contact_name}</TableCell>
                                                <TableCell className="flex items-center justify-center space-x-3">
                                                    <Button
                                                        variant="link"
                                                        className="cursor-pointer underline hover:text-accent2 hover:underline"
                                                        onClick={() => openReportPdf(b.transaction_number)}
                                                    >
                                                        <Download />
                                                    </Button>
                                                    <Trash2
                                                        className="cursor-pointer text-red-600 hover:text-gray-800"
                                                        size={18}
                                                        onClick={() => confirmDeleteBooking(b.booking_id)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                <EmptyEventBookings
                                                    title="No events found"
                                                    action={
                                                        <Button className="gap-2" onClick={() => router.visit(route('adminbooking.index'))}>
                                                            <Send className="size-4" />
                                                            <span>Go to Module</span>
                                                        </Button>
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="appointments">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Appointment Date & Time</TableHead>
                                        <TableHead>Contact Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Contact Email</TableHead>
                                        <TableHead className="hidden sm:table-cell">Contact Phone</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointment.length > 0 ? (
                                        appointment.map((a) => (
                                            <TableRow key={a.appointment_id}>
                                                <TableCell>
                                                    {formatDate(a.appointment_date)} {formatTime(a.appointment_time_from)} -{' '}
                                                    {formatTime(a.appointment_time_to)}
                                                </TableCell>
                                                <TableCell>{a.contact_name}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{a.contact_email}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{a.contact_phone}</TableCell>
                                                <TableCell>{a.purpose}</TableCell>
                                                <TableCell className="flex justify-center space-x-3">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Trash2
                                                                className="cursor-pointer text-red-600 hover:text-gray-800"
                                                                size={18}
                                                                onClick={() => confirmDeleteAppointment(a.appointment_id)}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete Appointment</TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                <EmptyEventBookings
                                                    title="No appointments found"
                                                    action={
                                                        <Button className="gap-2" onClick={() => router.visit(route('adminappointments.index'))}>
                                                            <Send className="size-4" />
                                                            <span>Go to Module</span>
                                                        </Button>
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="service-bookings">
                        <div className="overflow-x-auto">
                            <ServiceBookingTable service_booking={service_booking} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function ServiceBookingTable({ service_booking }: { service_booking: ServiceBookingType[] }) {
    const [selectedServiceBookingIds, setSelectedServiceBookingIds] = useState<Set<number>>(new Set());

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const confirmDeleteServiceBooking = (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this service booking?')) {
            router.delete(route('service-booking.report.destroy', { id }), { preserveScroll: true });
        }
    };

    const handleBulkDelete = () => {
        if (selectedServiceBookingIds.size === 0) {
            toast.error('No service bookings selected');
            return;
        }
        if (window.confirm(`Are you sure you want to permanently delete ${selectedServiceBookingIds.size} service booking(s)?`)) {
            const deletePromises = Array.from(selectedServiceBookingIds).map((id) =>
                router.delete(route('service-booking.report.destroy', { id }), { preserveScroll: true }),
            );
            Promise.all(deletePromises)
                .then(() => {
                    toast.success('Selected service bookings deleted successfully');
                    setSelectedServiceBookingIds(new Set());
                })
                .catch(() => {
                    toast.error('Failed to delete some service bookings');
                });
        }
    };

    return (
        <>
            {selectedServiceBookingIds.size > 0 && (
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedServiceBookingIds.size} service booking(s) selected</span>
                    <Button variant="destructive" onClick={handleBulkDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                    </Button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {service_booking.length > 0 ? (
                        service_booking.map((sb) => (
                            <TableRow key={sb.service_booking_id}>
                                <TableCell>
                                    {formatDate(sb.date)} {formatTime(sb.start_time)} - {formatTime(sb.end_time)}
                                </TableCell>
                                <TableCell>{sb.title}</TableCell>
                                <TableCell>{sb.service_name}</TableCell>
                                <TableCell>₱ {sb.total_amount}</TableCell>
                                <TableCell>₱ {sb.paid_amount}</TableCell>
                                <TableCell className="flex justify-center space-x-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Trash2
                                                className="cursor-pointer text-red-600 hover:text-gray-800"
                                                size={18}
                                                onClick={() => confirmDeleteServiceBooking(sb.service_booking_id)}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Delete Service Booking</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                <EmptyEventBookings
                                    title="No service found"
                                    action={
                                        <Button className="gap-2" onClick={() => router.visit(route('service-bookings.index'))}>
                                            <Send className="size-4" />
                                            <span>Go to Module</span>
                                        </Button>
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}
