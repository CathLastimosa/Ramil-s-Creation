import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
// Import the new print utilities
import { printAppointments, printBookings, printServiceBookings } from '@/components/PrintUtils';
import { EmptyEventBookings } from '@/components/empty/empty-events';

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

    const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());

    const toggleAllBookings = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(booking.map((pkg) => pkg.booking_id));
            setSelectedBookingIds(allIds);
        } else {
            setSelectedBookingIds(new Set());
        }
    };

    const toggleBookingSelection = (id: string, checked: boolean) => {
        setSelectedBookingIds((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const isAllBookingsSelected = selectedBookingIds.size === booking.length && booking.length > 0;
    const isIndeterminateBookings = selectedBookingIds.size > 0 && selectedBookingIds.size < booking.length;

    // Selection state for appointments
    const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<Set<string>>(new Set());

    const toggleAllAppointments = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(appointment.map((pkg) => pkg.appointment_id));
            setSelectedAppointmentIds(allIds);
        } else {
            setSelectedAppointmentIds(new Set());
        }
    };

    const toggleAppointmentSelection = (id: string, checked: boolean) => {
        setSelectedAppointmentIds((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const isAllAppointmentsSelected = selectedAppointmentIds.size === appointment.length && appointment.length > 0;
    const isIndeterminateAppointments = selectedAppointmentIds.size > 0 && selectedAppointmentIds.size < appointment.length;

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
                <div className="mb-4 flex items-center justify-between">
                    <div className="relative w-full sm:w-1/4">
                        <Input id="search" className="peer ps-9" placeholder="Search Reports" type="search" onChange={onSearchChange} />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                            <Search size={16} aria-hidden="true" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex justify-end gap-2">
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
                                                            <SelectItem value="Corporate">Corporate</SelectItem>
                                                            <SelectItem value="Debut">Debut</SelectItem>
                                                            <SelectItem value="Baptismal">Baptismal</SelectItem>
                                                            <SelectItem value="Funeral">Funeral</SelectItem>
                                                            <SelectItem value="Others">Others</SelectItem>
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
                    {/* ... (Rest of the JSX for tabs and tables remains unchanged) */}
                    <TabsContent value="bookings">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={isAllBookingsSelected || isIndeterminateBookings}
                                            onCheckedChange={toggleAllBookings}
                                            aria-label="Select all bookings"
                                        />
                                    </TableHead>
                                    <TableHead>Transaction Number</TableHead>
                                    <TableHead>Event Name</TableHead>
                                    <TableHead>Event Date</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>Contact Name</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {booking.length > 0 ? (
                                    booking.map((b) => (
                                        <TableRow key={b.booking_id}>
                                            <TableCell className="w-[50px]">
                                                <Checkbox
                                                    checked={selectedBookingIds.has(b.booking_id)}
                                                    onCheckedChange={(checked) => toggleBookingSelection(b.booking_id, checked === true)}
                                                    aria-label={`Select booking ${b.event_name}`}
                                                />
                                            </TableCell>
                                            <TableCell>{b.transaction_number}</TableCell>
                                            <TableCell>{b.event_name}</TableCell>
                                            <TableCell>{b.event_date}</TableCell>
                                            <TableCell>{b.event_type}</TableCell>
                                            <TableCell>{b.contact_name}</TableCell>
                                            <TableCell className="flex items-center justify-center space-x-3">
                                                <Button
                                                    variant="link"
                                                    className="cursor-pointer underline hover:text-accent2 hover:underline"
                                                    onClick={() => openReportPdf(b.booking_id)}
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
                                        <TableCell colSpan={7} className="text-center">
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
                    </TabsContent>
                    <TabsContent value="appointments">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={isAllAppointmentsSelected || isIndeterminateAppointments}
                                            onCheckedChange={toggleAllAppointments}
                                            aria-label="Select all appointments"
                                        />
                                    </TableHead>
                                    <TableHead>Contact Name</TableHead>
                                    <TableHead>Contact Email</TableHead>
                                    <TableHead>Contact Phone</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Appointment Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointment.length > 0 ? (
                                    appointment.map((a) => (
                                        <TableRow key={a.appointment_id}>
                                            <TableCell className="w-[50px]">
                                                <Checkbox
                                                    checked={selectedAppointmentIds.has(a.appointment_id)}
                                                    onCheckedChange={(checked) => toggleAppointmentSelection(a.appointment_id, checked === true)}
                                                    aria-label={`Select appointment ${a.purpose}`}
                                                />
                                            </TableCell>
                                            <TableCell>{a.contact_name}</TableCell>
                                            <TableCell>{a.contact_email}</TableCell>
                                            <TableCell>{a.contact_phone}</TableCell>
                                            <TableCell>{a.purpose}</TableCell>
                                            <TableCell>{a.appointment_date}</TableCell>
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
                                        <TableCell colSpan={8} className="text-center">
                                            <EmptyEventBookings
                                                title="No appointments found"
                                                action={
                                                    <Button className="gap-2" onClick={() => router.visit(route('adminappointments.index'))}>
                                                        <Send className="size-4" />
                                                        <span>Go to Module</span>
                                                    </Button>
                                                }
                                            />{' '}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="service-bookings">
                        <ServiceBookingTable service_booking={service_booking} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function ServiceBookingTable({ service_booking }: { service_booking: ServiceBookingType[] }) {
    const [selectedServiceBookingIds, setSelectedServiceBookingIds] = useState<Set<number>>(new Set());

    const toggleAllServiceBookings = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(service_booking.map((sb) => sb.service_booking_id));
            setSelectedServiceBookingIds(allIds);
        } else {
            setSelectedServiceBookingIds(new Set());
        }
    };

    const toggleServiceBookingSelection = (id: number, checked: boolean) => {
        setSelectedServiceBookingIds((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const isAllServiceBookingsSelected = selectedServiceBookingIds.size === service_booking.length && service_booking.length > 0;
    const isIndeterminateServiceBookings = selectedServiceBookingIds.size > 0 && selectedServiceBookingIds.size < service_booking.length;

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
            // Force delete all selected
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
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={isAllServiceBookingsSelected || isIndeterminateServiceBookings}
                                onCheckedChange={toggleAllServiceBookings}
                                aria-label="Select all service bookings"
                            />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {service_booking.length > 0 ? (
                        service_booking.map((sb) => (
                            <TableRow key={sb.service_booking_id}>
                                <TableCell className="w-[50px]">
                                    <Checkbox
                                        checked={selectedServiceBookingIds.has(sb.service_booking_id)}
                                        onCheckedChange={(checked) => toggleServiceBookingSelection(sb.service_booking_id, checked === true)}
                                        aria-label={`Select service booking ${sb.title}`}
                                    />
                                </TableCell>
                                <TableCell>{sb.service_booking_id}</TableCell>
                                <TableCell>{sb.title}</TableCell>
                                <TableCell>{sb.service_name}</TableCell>
                                <TableCell>{sb.date}</TableCell>
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
                            <TableCell colSpan={8} className="text-center">
                                <EmptyEventBookings
                                    title="No service found"
                                    action={
                                        <Button className="gap-2" onClick={() => router.visit(route('service-bookings.index'))}>
                                            <Send className="size-4" />
                                            <span>Go to Module</span>
                                        </Button>
                                    }
                                />{' '}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}
