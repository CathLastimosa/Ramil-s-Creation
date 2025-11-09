import { Button } from '@/components/ui/button-shad';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ArrowLeft, Ban, CheckCircle, Save } from 'lucide-react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import EditStaffLayout from '@/layouts/EditStaff/layout';
import { useEffect, useState } from 'react';

interface AvailabilityType {
    availability_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface StaffType {
    staff_id: string;
    staff_name: string;
    availability?: AvailabilityType[];
}

interface Props {
    staff: StaffType;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff', href: '/staff' },
    { title: 'Edit Staff Availability', href: '/' },
];

const DEFAULT_START = '7:00 AM';
const DEFAULT_END = '8:00 PM';

export default function EditStaffAvailability({ staff }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const [useBusinessHours, setUseBusinessHours] = useState(true);
    const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set());

    const { data, setData, put, processing, errors } = useForm({
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

    // Initialize availability from staff data
    useEffect(() => {
        const initialAvailability: Record<string, { start_time?: string; end_time?: string; status: 'available' | 'blocked' }> = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const blockedSet = new Set<string>();

        days.forEach((day) => {
            const avail = staff.availability?.find(a => a.day_of_week === day);
            if (avail) {
                if (avail.status === 'blocked') {
                    initialAvailability[day] = { status: 'blocked' };
                    blockedSet.add(day);
                } else {
                    // Convert 24-hour to 12-hour for display
                    const startTime = avail.start_time ? convertTo12Hour(avail.start_time) : DEFAULT_START;
                    const endTime = avail.end_time ? convertTo12Hour(avail.end_time) : DEFAULT_END;
                    initialAvailability[day] = { start_time: startTime, end_time: endTime, status: 'available' };
                }
            } else {
                // Default if no availability set
                initialAvailability[day] = { start_time: DEFAULT_START, end_time: DEFAULT_END, status: 'available' };
            }
        });

        setData('availability', initialAvailability);
        setBlockedDays(blockedSet);
        // Check if all days are default business hours
        const allDefault = days.every(day => {
            const avail = initialAvailability[day];
            return avail.status === 'available' && avail.start_time === DEFAULT_START && avail.end_time === DEFAULT_END;
        });
        setUseBusinessHours(allDefault);
    }, [staff.availability]);

    const convertTo12Hour = (time24: string): string => {
        const [hour, minute] = time24.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

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

    const saveAvailability = (e: React.FormEvent) => {
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
            submitData = { availability: businessAvailability };
        }

        put(route('staffavailability.update', staff.staff_id), {
            onSuccess: () => {
                toast.success('Availability updated successfully.');
                router.visit(route('staff.index'));
            },
            onError: () => toast.error('Failed to update availability'),
        });
    };

    const getDayAvailability = (day: string) => data.availability[day] || { start_time: DEFAULT_START, end_time: DEFAULT_END, status: 'available' };

    return (
        <>
            <Head title={`Edit Availability - ${staff.staff_name}`} />
            <EditStaffLayout breadcrumbs={breadcrumbs} staffId={staff.staff_id} activeTab="availability">
                <form onSubmit={saveAvailability} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm leading-none font-semibold tracking-tight">Availability</h3>
                            <p className="text-xs text-muted-foreground">Set the days and times this staff member is available.</p>
                        </div>

                        {/* Use Business Hours Switch */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="business-hours" className="text-sm leading-none font-medium">
                                    Use business hours
                                </Label>
                                <p className="text-xs text-muted-foreground">Turn off to edit custom availability</p>
                            </div>
                            <Switch
                                id="business-hours"
                                checked={useBusinessHours}
                                onCheckedChange={setUseBusinessHours}
                                className="data-[state=checked]:bg-accent2"
                            />
                        </div>

                        {/* Weekly Schedule */}
                        <div
                            className={`space-y-2 transition-opacity duration-200 ${
                                useBusinessHours ? 'pointer-events-none opacity-50' : ''
                            }`}
                        >
                            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground uppercase">
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
                                    <div key={day} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                                        <span
                                            className={`text-xs font-medium ${isBlocked ? 'text-muted-foreground line-through' : ''}`}
                                        >
                                            {day}
                                        </span>

                                        <Select
                                            value={currentStart}
                                            onValueChange={(value) => handleStartTimeChange(day, value)}
                                            disabled={useBusinessHours || isBlocked}
                                        >
                                            <SelectTrigger className={`h-8 ${isBlocked ? 'text-muted-foreground line-through' : ''}`}>
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
                                            onValueChange={(value) => handleEndTimeChange(day, value)}
                                            disabled={useBusinessHours || isBlocked}
                                        >
                                            <SelectTrigger className={`h-8 ${isBlocked ? 'text-muted-foreground line-through' : ''}`}>
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
                                                    className="h-6 w-6 p-0"
                                                    disabled={useBusinessHours}
                                                    onClick={() => toggleBlockDay(day)}
                                                >
                                                    {isBlocked ? (
                                                        <CheckCircle size={14} className="text-green-600" />
                                                    ) : (
                                                        <Ban size={14} className="text-destructive" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                {isBlocked ? 'Unblock this day' : 'Block this day'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.visit(route('staff.index'))}
                            className="flex items-center gap-2"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save size={16} />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </EditStaffLayout>
        </>
    );
}
