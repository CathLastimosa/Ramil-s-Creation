import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Ban, CheckCircle, Eye, LucidePlus, Mail, Pencil, Phone, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Staff', href: 'staff' }];

interface StaffType {
    staff_id: string;
    staff_name: string;
    email: string;
    contact_no: string;
    status: string;
    role: string;
    color: string;
    availability?: { availability_id: number; day_of_week: string; start_time: string; end_time: string; status: string }[];
    bookings?: { booking_id: number; event_name: string; event_date: string; status: string; transaction_number: string }[];
    service_bookings?: { service_booking_id: number; title: string; service_name: string; date: string; status: string }[];
}

const DEFAULT_START = '7:00 AM';
const DEFAULT_END = '8:00 PM';

export default function Staff({ staff }: { staff: StaffType[] }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('staff.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value);

    const confirmDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            router.delete(route('staff.destroy', { id }), { preserveScroll: true });
        }
    };

    const [useBusinessHours, setUseBusinessHours] = useState(true);
    const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set());

    const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        contact: '',
        role: '',
        color: '',
        availability: {} as Record<string, { start_time?: string; end_time?: string; status: 'available' | 'blocked' }>,
    });

    const generateTimeOptions = () => {
        const times: string[] = [];
        for (let h = 7; h <= 20; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = h % 12 === 0 ? 12 : h % 12;
                const minute = m === 0 ? '00' : m.toString();
                const ampm = h < 12 ? 'AM' : 'PM';
                times.push(`${hour}:${minute} ${ampm}`);
            }
        }
        return times;
    };
    const timeOptions = generateTimeOptions();

    useEffect(() => {
        if (!useBusinessHours) {
            const initialAvailability: Record<string, { start_time?: string; end_time?: string; status: 'available' | 'blocked' }> = {};
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days.forEach((day) => {
                const isBlocked = blockedDays.has(day);
                initialAvailability[day] = {
                    start_time: isBlocked ? undefined : DEFAULT_START,
                    end_time: isBlocked ? undefined : DEFAULT_END,
                    status: isBlocked ? 'blocked' : 'available',
                };
            });
            setData('availability', initialAvailability);
        }
    }, [useBusinessHours, blockedDays]);

    const handleStartTimeChange = (day: string, value: string) => {
        if (useBusinessHours || blockedDays.has(day)) return;
        setData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    start_time: value,
                    status: 'available',
                },
            },
        }));
    };

    const handleEndTimeChange = (day: string, value: string) => {
        if (useBusinessHours || blockedDays.has(day)) return;
        setData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    end_time: value,
                    status: 'available',
                },
            },
        }));
    };

    const toggleBlockDay = (day: string) => {
        if (useBusinessHours) return;

        const newSet = new Set(blockedDays);
        const isBlocking = !newSet.has(day);
        if (isBlocking) {
            newSet.add(day);
        } else {
            newSet.delete(day);
        }
        setBlockedDays(newSet);

        setData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    start_time: isBlocking ? undefined : DEFAULT_START,
                    end_time: isBlocking ? undefined : DEFAULT_END,
                    status: isBlocking ? 'blocked' : 'available',
                },
            },
        }));
    };

    const saveStaff = (e: React.FormEvent) => {
        e.preventDefault();

        let submitData = { ...data };
        if (useBusinessHours) {
            const businessAvailability: Record<string, { start_time: string; end_time: string; status: 'available' }> = {};
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days.forEach((day) => {
                businessAvailability[day] = {
                    start_time: DEFAULT_START,
                    end_time: DEFAULT_END,
                    status: 'available',
                };
            });
            submitData = { ...data, availability: businessAvailability };
        }

        setData(submitData);
        post(route('staff.store'), {
            onSuccess: () => {
                reset();
                setBlockedDays(new Set());
                setUseBusinessHours(true); // Reset to default
                router.reload({ only: ['staff'] }); // Refresh staff list
            },
            onError: () => toast.error('Failed to save staff'),
        });
    };

    const getDayAvailability = (day: string) => data.availability[day] || { start_time: DEFAULT_START, end_time: DEFAULT_END, status: 'available' };

    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Staff</CardTitle>
                <CardDescription className="mb-2">You can manage staff here.</CardDescription>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-1/3">
                        <Input id="search" className="peer ps-9" placeholder="Search Staff" type="search" onChange={onSearchChange} />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                            <Search size={16} aria-hidden="true" />
                        </div>
                    </div>

                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="h-4 w-4" />
                                Add Staff
                            </Button>
                        </SheetTrigger>

                        {/* 🗂 Sheet Content */}
                        <SheetContent side="right" className="w-[440px] overflow-y-auto rounded-l-2xl bg-white p-6 shadow-xl sm:w-[500px]">
                            <form onSubmit={saveStaff}>
                                {/* Header */}
                                <SheetHeader className="mb-4 border-b pb-4">
                                    <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                        <UserPlus className="" />
                                        Add Staff
                                    </SheetTitle>

                                    <SheetDescription className="text-sm text-gray-500">
                                        Fill out the form to add a new staff member.
                                    </SheetDescription>
                                </SheetHeader>

                                {/* Body */}
                                <div className="space-y-6">
                                    {/* 🧾 Personal Info */}
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700">Basic Information</p>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Enter full name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="rounded-xl border-gray-300 focus:ring-0 focus:ring-offset-0"
                                                />
                                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                    Email
                                                </Label>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Enter email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="rounded-xl border-gray-300 pl-10 focus:ring-0 focus:ring-offset-0"
                                                    />
                                                </div>
                                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                                                    Contact Number
                                                </Label>
                                                <div className="relative">
                                                    <Phone size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="contact"
                                                        type="tel"
                                                        placeholder="Enter phone number"
                                                        value={data.contact}
                                                        onChange={(e) => setData('contact', e.target.value)}
                                                        className="rounded-xl border-gray-300 pl-10 focus:ring-0 focus:ring-offset-0"
                                                    />
                                                </div>
                                                {errors.contact && <p className="text-xs text-red-500">{errors.contact}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                                    Role
                                                </Label>
                                                <Input
                                                    id="role"
                                                    type="text"
                                                    placeholder="e.g., Manager, Coordinator"
                                                    value={data.role}
                                                    onChange={(e) => setData('role', e.target.value)}
                                                    className="rounded-xl border-gray-300 focus:ring-0 focus:ring-offset-0"
                                                />
                                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🎨 Color */}
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700">Staff Color Tag</p>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="color"
                                                type="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="h-10 w-12 cursor-pointer rounded-md border border-gray-300"
                                            />
                                            <span className="text-sm text-gray-500">Select a color for this staff member</span>
                                        </div>
                                        {errors.color && <p className="text-xs text-red-500">{errors.color}</p>}
                                    </div>

                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700">Availability</p>
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                                            <div>
                                                <Label htmlFor="business-hours" className="text-sm font-medium text-gray-700">
                                                    Use Business Hours
                                                </Label>
                                                <p className="text-xs text-gray-500">Turn off to edit custom schedule</p>
                                            </div>
                                            <Switch
                                                id="business-hours"
                                                checked={useBusinessHours}
                                                onCheckedChange={setUseBusinessHours}
                                                className="data-[state=checked]:bg-accent2"
                                            />
                                        </div>

                                        <div
                                            className={`mt-3 space-y-2 transition-opacity duration-200 ${
                                                useBusinessHours ? 'pointer-events-none opacity-50' : ''
                                            }`}
                                        >
                                            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b pb-1 text-xs font-semibold text-gray-500 uppercase">
                                                <span>Day</span>
                                                <span className="text-center">Start</span>
                                                <span className="text-center">End</span>
                                                <span className="text-center">Block</span>
                                            </div>

                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                                const dayAvail = getDayAvailability(day);
                                                const isBlocked = blockedDays.has(day) || dayAvail.status === 'blocked';
                                                const currentStart = dayAvail.start_time || DEFAULT_START;
                                                const currentEnd = dayAvail.end_time || DEFAULT_END;
                                                return (
                                                    <div
                                                        key={day}
                                                        className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b py-1.5 text-sm"
                                                    >
                                                        <span className={`font-medium ${isBlocked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                            {day}
                                                        </span>

                                                        <Select
                                                            value={currentStart}
                                                            onValueChange={(v) => handleStartTimeChange(day, v)}
                                                            disabled={useBusinessHours || isBlocked}
                                                        >
                                                            <SelectTrigger className="h-8 rounded-md border-gray-300 text-xs">
                                                                <SelectValue placeholder="7:00 AM" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {timeOptions.map((time) => (
                                                                    <SelectItem key={time} value={time}>
                                                                        {time}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <Select
                                                            value={currentEnd}
                                                            onValueChange={(v) => handleEndTimeChange(day, v)}
                                                            disabled={useBusinessHours || isBlocked}
                                                        >
                                                            <SelectTrigger className="h-8 rounded-md border-gray-300 text-xs">
                                                                <SelectValue placeholder="8:00 PM" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {timeOptions.map((time) => (
                                                                    <SelectItem key={time} value={time}>
                                                                        {time}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                                                    disabled={useBusinessHours}
                                                                    onClick={() => toggleBlockDay(day)}
                                                                >
                                                                    {isBlocked ? (
                                                                        <CheckCircle size={14} className="text-green-600" />
                                                                    ) : (
                                                                        <Ban size={14} className="text-red-500" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">
                                                                {isBlocked ? 'Unblock this day' : 'Block this day'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 flex gap-3 border-t pt-4">
                                    <Button type="button" variant="secondary" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Staff'}
                                    </Button>
                                </div>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Staff Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Email</TableHead>
                                <TableHead className="hidden sm:table-cell">Contact Number</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {staff.length > 0 ? (
                                staff.map((member) => (
                                    <TableRow key={member.staff_id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="font-medium text-white" style={{ backgroundColor: member.color }}>
                                                    {member.staff_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{member.staff_name}</span>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{member.email}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{member.contact_no}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1.5">
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`gap-1.5 border-0 px-2.5 py-1 text-xs font-medium capitalize ${
                                                    member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
                                                    aria-hidden="true"
                                                ></span>
                                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex space-x-3">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Eye
                                                        size={20}
                                                        className="cursor-pointer text-green-600 hover:text-gray-800"
                                                        onClick={() => {
                                                            setSelectedStaff(member);
                                                            setIsDialogOpen(true);
                                                        }}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>View Staff</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Pencil
                                                        onClick={() => router.visit(route('staff.edit', member.staff_id))}
                                                        className="cursor-pointer text-yellow-600 hover:text-gray-800"
                                                        size={20}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>Edit Staff</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Trash2
                                                        onClick={() => confirmDelete(member.staff_id)}
                                                        className="cursor-pointer text-red-600 hover:text-gray-800"
                                                        size={20}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>Delete Staff</TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center">
                                        <EmptyEventBookings
                                            title="No staff found"
                                            action={
                                                <Button className="gap-2" onClick={() => setIsSheetOpen(true)}>
                                                    <LucidePlus className="size-4" />
                                                    <span>Add New Staff</span>
                                                </Button>
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* View Staff Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Staff Details</DialogTitle>
                            <DialogDescription>View the details of the selected staff member.</DialogDescription>
                        </DialogHeader>
                        {selectedStaff && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="font-medium text-white" style={{ backgroundColor: selectedStaff.color }}>
                                            {selectedStaff.staff_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedStaff.staff_name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-muted-foreground" />
                                        <span>{selectedStaff.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-muted-foreground" />
                                        <span>{selectedStaff.contact_no}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="gap-1.5">
                                            {selectedStaff.status === 'active' ? (
                                                <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
                                            ) : (
                                                <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                                            )}
                                            {selectedStaff.status}
                                        </Badge>
                                    </div>
                                </div>
                                {selectedStaff.availability && selectedStaff.availability.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Availability</h4>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground uppercase">
                                                <span>Day</span>
                                                <span className="text-center">Start</span>
                                                <span className="text-center">End</span>
                                                <span className="text-center">Status</span>
                                            </div>
                                            {selectedStaff.availability.map((avail) => {
                                                const isBlocked = avail.status === 'blocked';
                                                return (
                                                    <div key={avail.availability_id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                                                        <span
                                                            className={`text-xs font-medium ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                                        >
                                                            {avail.day_of_week}
                                                        </span>
                                                        <span
                                                            className={`text-center text-xs ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                                        >
                                                            {avail.start_time || 'N/A'}
                                                        </span>
                                                        <span
                                                            className={`text-center text-xs ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                                        >
                                                            {avail.end_time || 'N/A'}
                                                        </span>
                                                        <span
                                                            className={`text-center text-xs ${isBlocked ? 'text-destructive' : 'text-emerald-500'}`}
                                                        >
                                                            {avail.status === 'blocked' ? 'Blocked' : 'Available'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedStaff.bookings && selectedStaff.bookings.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Bookings</h4>
                                        <div className="max-h-32 space-y-2 overflow-y-auto">
                                            {selectedStaff.bookings.map((booking) => (
                                                <div key={booking.booking_id} className="flex items-center justify-between rounded border p-2">
                                                    <div>
                                                        <p className="text-sm font-medium">{booking.event_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {booking.event_date} - {booking.transaction_number}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedStaff.service_bookings && selectedStaff.service_bookings.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Service Bookings</h4>
                                        <div className="max-h-32 space-y-2 overflow-y-auto">
                                            {selectedStaff.service_bookings.map((serviceBooking) => (
                                                <div
                                                    key={serviceBooking.service_booking_id}
                                                    className="flex items-center justify-between rounded border p-2"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">{serviceBooking.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {serviceBooking.service_name} - {serviceBooking.date}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {serviceBooking.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
