import AppointmentChart, { type AppointmentData } from '@/components/appointment-chart';
import { AppointmentStatusRadialChart, type AppointmentStatusData } from '@/components/appointment-status-pie-chart';
import BookingChart, { type BookingData } from '@/components/booking-chart';
import { BookingStatusPieChart, type BookingStatusData } from '@/components/booking-status-pie-chart';
import CombinedBarChart, { type MonthlyData } from '@/components/combined-bar-chart';
import OverallShopRating from '@/components/overall-shop-rating';
import ServiceBookingChart, { type ServiceBookingData } from '@/components/service-booking-chart';
import StaffAvailability from '@/components/staff-availability';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UpcomingAppointments from '@/components/upcoming-appointments';
import UpcomingEvents from '@/components/upcoming-events';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
        };
    };
    appointmentsData: AppointmentData[];
    bookingsData: BookingData[];
    serviceBookingsData: ServiceBookingData[];
    monthlyData: MonthlyData[];
    bookingStatuses: BookingStatusData[];
    appointmentStatuses: AppointmentStatusData[];
    serviceBookingStatuses: BookingStatusData[];
    averageRating: number;
    contactNames: string[];
    upcomingAppointments: {
        appointment_id: string;
        appointment_date: string;
        appointment_time_from: string;
        appointment_time_to: string;
        status: string;
        contact_name: string;
        contact_phone: string;
        contact_email: string;
        purpose: string;
    }[];
    upcomingEvents: {
        booking_id: string;
        event_date: string;
        event_time_from: string;
        event_time_to: string;
        status: string;
        contact_name: string;
        contact_phone: string;
        contact_email: string;
        event_name: string;
    }[];
    staffAvailability: {
        staff_id: number;
        staff_name: string;
        email: string;
        contact_no: string;
        role: string;
        status: string;
        availability: {
            availability_id: number;
            day_of_week: string;
            start_time: string;
            end_time: string;
            status: string;
            reason?: string;
        }[];
    }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const {
        auth,
        appointmentsData,
        bookingsData,
        serviceBookingsData,
        monthlyData,
        bookingStatuses,
        appointmentStatuses,
        serviceBookingStatuses,
        averageRating,
        contactNames,
        upcomingAppointments,
        upcomingEvents,
        staffAvailability,
    } = usePage().props as unknown as PageProps;
    const typedAppointmentsData = appointmentsData;
    const typedBookingsData = bookingsData;
    const typedServiceBookingsData = serviceBookingsData;
    const typedMonthlyData = monthlyData;
    const typedBookingStatuses = bookingStatuses;
    const typedAppointmentStatuses = appointmentStatuses;

    const userName = auth.user?.name || 'User';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return 'Good Morning';
        } else if (hour < 18) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    };

    const greeting = getGreeting();

    // Filter states
    const [filters, setFilters] = useState({
        month: '',
        year: '',
    });

    const applyFilters = () => {
        router.get(route('dashboard'), { ...filters }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFilters({ month: '', year: '' });
        router.get(route('dashboard'), {}, { preserveState: true, replace: true });
    };

    const clearFilter = (filterKey: keyof typeof filters) => {
        const newFilters = { ...filters, [filterKey]: '' };
        setFilters(newFilters);
        router.get(route('dashboard'), { ...newFilters }, { preserveState: true, replace: true });
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

    const getPeriod = () => {
        if (filters.month && filters.year) {
            return `${monthNames[filters.month]} ${filters.year}`;
        } else if (filters.year) {
            return filters.year;
        } else {
            return 'Current Year';
        }
    };

    const period = getPeriod();

    useEffect(() => {
        if ((window as any).Echo) {
            const channel = (window as any).Echo.channel('appointments');
            channel.listen('.appointment.created', () => {
                router.reload({ only: ['appointmentsData'] });
            });
            channel.listen('.appointment.live.update', () => {
                router.reload({ only: ['appointmentsData'] });
            });

            return () => {
                channel.stopListening('.appointment.created');
                channel.stopListening('.appointment.live.update');
            };
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-sm">
                            <span className="text-muted-foreground">Hi {userName},</span>
                        </div>
                        <div className="text-lg font-semibold text-red-950 dark:text-white">{greeting}!</div>
                    </div>
                    <div className="flex gap-2">
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
                                            <h4 className="leading-none font-medium text-foreground">Filter Dashboard</h4>
                                            <p className="text-sm text-muted-foreground">Filter by month and year.</p>
                                        </div>
                                        <div className="grid gap-2">
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
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" onClick={clearFilters}>
                                                Clear
                                            </Button>
                                            <Button onClick={applyFilters}>Apply</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="bg-secondary relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-background-brand shadow-lg dark:border-sidebar-border">
                        <AppointmentChart appointmentsData={typedAppointmentsData} period={period} />
                    </div>
                    <div className="bg-secondary relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-background-brand shadow-lg dark:border-sidebar-border">
                        <BookingChart bookingsData={typedBookingsData} period={period} />
                    </div>
                    <div className="bg-secondary relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-background-brand shadow-lg dark:border-sidebar-border">
                        <ServiceBookingChart serviceBookingsData={typedServiceBookingsData} period={period} />
                    </div>
                    <div className="bg-gradient-to-b from-cta to-accent2 relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-lg dark:border-sidebar-border">
                        <OverallShopRating averageRating={averageRating} contactNames={contactNames} />
                    </div>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-8">
                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border border-sidebar-border/70 md:col-span-4 dark:border-sidebar-border">
                        <CombinedBarChart monthlyData={typedMonthlyData} />
                    </div>

                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border border-sidebar-border/70 md:col-span-2 dark:border-sidebar-border">
                        <BookingStatusPieChart bookingStatuses={typedBookingStatuses} serviceBookingStatuses={serviceBookingStatuses} />
                    </div>
                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:col-span-2 dark:border-sidebar-border">
                        <UpcomingAppointments upcomingAppointments={upcomingAppointments} />
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <UpcomingEvents upcomingEvents={upcomingEvents} />
                    </div>
                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <StaffAvailability staffAvailability={staffAvailability} />
                    </div>
                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <AppointmentStatusRadialChart appointmentStatuses={typedAppointmentStatuses} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
