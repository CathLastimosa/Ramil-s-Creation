import { Button } from '@/components/ui/button-shad';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import EditStaffLayout from '@/layouts/EditStaff/layout';
import { useEffect } from 'react';

interface StaffType {
    staff_id: string;
    staff_name: string;
    email: string;
    contact_no: string;
    role: string;
    status: 'active' | 'inactive';
}

interface Props {
    staff: StaffType;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff', href: '/staff' },
    { title: 'Edit Staff', href: '/' },
];

export default function EditStaffDetails({ staff }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: staff.staff_name || '',
        email: staff.email || '',
        contact: staff.contact_no || '',
        role: staff.role || '',
        status: staff.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('staff.update', staff.staff_id), {
            onSuccess: () => {
                toast.success('Staff updated successfully.');
                router.visit(route('staff.index'));
            },
            onError: (errors) => {
                toast.error('Failed to update staff.');
            },
        });
    };

    return (
        <>
            <Head title={`Edit ${staff.staff_name}`} />
            <EditStaffLayout breadcrumbs={breadcrumbs} staffId={staff.staff_id} activeTab="details">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact Number</Label>
                            <Input
                                id="contact"
                                type="tel"
                                placeholder="Enter phone number"
                                value={data.contact}
                                onChange={(e) => setData('contact', e.target.value)}
                            />
                            {errors.contact && <p className="text-xs text-red-500">{errors.contact}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                type="text"
                                placeholder="Enter role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                maxLength={50}
                            />
                            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 items-center">
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
