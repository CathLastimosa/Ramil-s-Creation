import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Accordion, AccordionContent, AccordionFooter, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { CardContent } from '@mui/material';
import debounce from 'lodash/debounce';
import { CalendarCheck, CheckIcon, LucidePlus, Mail, Pencil, Phone, PlusIcon, Search, Trash } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [{ title: 'Appointments', href: '/appointments/index' }];

interface AppointmentType {
    appointment_id: string;
    appointment_date: string;
    appointment_time_from: string;
    appointment_time_to: string;
    status: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    purpose: string;
}

interface PaginatedAppointments {
    data: AppointmentType[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function ManageAppointments({ appointments }: { appointments: PaginatedAppointments }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('adminappointments.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleSearch(e.target.value);
    }

    function confirmDelete(id: string) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(route('adminappointments.destroy', id), { preserveScroll: true });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Appointments" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Appointments</CardTitle>
                <CardDescription>You can manage appointments here.</CardDescription>
                <Tabs defaultValue="all" className="items-left">
                    <div className="mt-4 flex items-center justify-between">
                        {/* Tabs */}
                        <TabsList>
                            <TabsTrigger className="data-[state=active]:text-background" value="all">
                                All
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="reserved">
                                Upcoming
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:text-background" value="completed">
                                Completed
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative ml-4 max-w-md">
                                <Input id="search" className="peer ps-9" placeholder="Search Appointments" type="search" onChange={onSearchChange} />
                                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                                    <Search size={16} aria-hidden="true" />
                                </div>
                            </div>
                            {/* Button */}
                            <Button
                                variant="brand"
                                className="aspect-square cursor-pointer max-sm:p-0"
                                onClick={() => router.visit(route('adminappointments.create'))}
                            >
                                <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                                <span className="max-sm:sr-only">Add Appointment</span>
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="all">
                        <AppointmentAccordion appointments={appointments.data} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="reserved">
                        <AppointmentAccordion appointments={appointments.data.filter((a) => a.status === 'reserved')} confirmDelete={confirmDelete} />
                    </TabsContent>

                    <TabsContent value="completed">
                        <AppointmentAccordion
                            appointments={appointments.data.filter((a) => a.status === 'completed')}
                            confirmDelete={confirmDelete}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

/* Reusable Accordion Component */
function AppointmentAccordion({ appointments, confirmDelete }: { appointments: AppointmentType[]; confirmDelete: (id: string) => void }) {
    if (appointments.length === 0) {
        return (
            <EmptyEventBookings
                title="No appointment found"
                action={
                    <Button className="gap-2" onClick={() => router.visit(route('adminappointments.create'))}>
                        <LucidePlus className="size-4" />
                        <span>Create Appointment</span>
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

    function handleDeleteAppointment(appointmentId: string) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(route('adminappointments.destroy', appointmentId));
        }
    }

    function handleEdit(appointment: AppointmentType) {
        router.visit(route('adminappointments.edit', appointment.appointment_id));
    }

    return (
        <Accordion type="single" collapsible>
            {appointments.map((appointment) => (
                <AccordionItem
                    key={appointment.appointment_id}
                    value={appointment.appointment_id}
                    className="mb-3 overflow-hidden rounded-xl border shadow-sm"
                >
                    <AccordionTrigger className="p-4">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-900">{appointment.purpose}</span>
                                <Badge
                                    variant="outline"
                                    className={`gap-1.5 rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize ${
                                        appointment.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : appointment.status === 'completed'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : appointment.status === 'cancelled'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                    } `}
                                >
                                    {appointment.status === 'pending' ? (
                                        <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
                                    ) : appointment.status === 'completed' ? (
                                        <CheckIcon className="text-emerald-500" size={12} aria-hidden="true" />
                                    ) : appointment.status === 'cancelled' ? (
                                        <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                                    ) : (
                                        <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
                                    )}
                                    {appointment.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-xl bg-slate-200 px-3 py-3 text-sm font-medium text-slate-900">
                                    {formatDateToWords(appointment.appointment_date)}
                                    <span className="text-slate-300"> | </span>
                                    {formatTimeTo12Hour(appointment.appointment_time_from)}
                                </span>
                            </div>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="bg-gray-50/70 px-6 py-4">
                        <Card className="overflow-hidden border border-gray-200/70 shadow-sm transition-shadow duration-300 hover:shadow-md">
                            <CardHeader className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/70 px-6 py-4">
                                <CalendarCheck className="h-5 w-5 text-purple-600" />
                                <CardTitle className="text-base font-semibold text-gray-800">Appointment Details</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 p-6 text-sm text-gray-700">
                                {/* Email */}
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <Mail size={16} className="text-gray-500" />
                                    <span className="text-gray-700">{appointment.contact_email}</span>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-500" />
                                    <span className="text-gray-700">{appointment.contact_phone}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </AccordionContent>

                    <AccordionFooter className="flex w-full items-center justify-between gap-3">
                        <div className="flex items-center gap-10">
                            <div className="flex items-center space-x-1">
                                <div className="p-2">
                                    <Avatar>
                                        <AvatarImage src={`/storage/`} alt={``} />
                                        <AvatarFallback>{appointment.contact_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <CardDescription className="text-sm text-muted-foreground">{appointment.contact_name}</CardDescription>
                                    <CardDescription className="text-sm text-muted-foreground">{appointment.contact_email}</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {appointment.status === 'reserved' && (
                                    <Button
                                        variant="link"
                                        className="flex cursor-pointer items-center gap-3 p-1 underline hover:text-green-500"
                                        onClick={() => {
                                            router.put(
                                                route('adminappointments.updateStatus', appointment.appointment_id),
                                                {},
                                                { preserveScroll: true },
                                            );
                                        }}
                                    >
                                        <CheckIcon className="text-green-500" />
                                        <strong>Completed ?</strong>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {/* Actions */}
                            <div className="flex">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild variant="link" className="mr-3 flex cursor-pointer" onClick={() => handleEdit(appointment)}>
                                            <span>
                                                <Pencil size={20} className="mr-1 text-yellow-600 hover:text-gray-800" />
                                                <CardDescription>Edit</CardDescription>
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Appointment</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            asChild
                                            variant="link"
                                            className="mr-3 flex cursor-pointer"
                                            onClick={() => handleDeleteAppointment(appointment.appointment_id)}
                                        >
                                            <span>
                                                <Trash className="size={16} text-red-600 hover:text-gray-800" aria-hidden="true" />
                                                <CardDescription>Delete</CardDescription>
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Appointment</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </AccordionFooter>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
