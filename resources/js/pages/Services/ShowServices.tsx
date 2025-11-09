import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, useForm, usePage } from '@inertiajs/react';
import { Typography } from '@mui/material';
import { LoaderCircle, LoaderIcon, Pencil, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Service {
    services_id: string;
    service_name: string;
    description: string;
    image: string;
}

interface Package {
    package_id: string;
    package_name: string;
    package_description: string;
}

interface Props {
    package: Package;
    services: Service[];
}

function confirmDelete(packageId: string, serviceId: string) {
    if (window.confirm('Are you sure you want to delete this service?')) {
        router.delete(`/package/${packageId}/services/${serviceId}`, { preserveScroll: true });
    }
}

export default function ShowServices(props: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    // form state for ADD
    const { data, setData, post, processing, errors, reset } = useForm({
        service_name: '',
        description: '',
        image: null as File | null,
    });

    // form state for EDIT
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: updating,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        service_name: '',
        description: '',
        image: null as File | null,
    });

    const [editingService, setEditingService] = useState<Service | null>(null);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const pkg = props.package;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('package.services.store', pkg.package_id), {
            forceFormData: true,
            onSuccess: () => {
                reset();
            },
            onError: () => toast.error('Failed to add service'),
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        const formData = new FormData();
        formData.append('service_name', editData.service_name);
        formData.append('description', editData.description);
        if (editData.image) {
            formData.append('image', editData.image); // only append if changed
        }

        // for PUT method simulation
        formData.append('_method', 'PUT');

        router.post(route('package.services.update', editingService.services_id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                resetEdit();
                setEditingService(null);
                toast.success('Service updated successfully');
            },
            onError: (errors) => {
                console.log(errors);
                toast.error('Failed to update service');
            },
        });
    };

    return (
        <div>
            <div className="flex flex-col gap-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <Typography>Services for {pkg.package_name}</Typography>
                        <CardDescription className="mb-6">{pkg.package_description}</CardDescription>
                    </div>
                    <div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="brand" className="flex items-center gap-2">
                                    <PlusIcon className="h-4 w-4" />
                                    Add Services
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add a New Service</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="service_name">Service Name</Label>
                                        <Input
                                            required
                                            id="service_name"
                                            name="service_name"
                                            value={data.service_name}
                                            onChange={(e) => setData('service_name', e.target.value)}
                                            placeholder="Enter service name"
                                        />
                                        {errors.service_name && <p className="text-sm text-red-500">{errors.service_name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            required
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Enter description"
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Image</Label>
                                        <Input id="image" name="image" type="file" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                                        {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                                            Add
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {props.services.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {props.services.map((service) => (
                            <div
                                key={service.services_id}
                                className="relative w-[210px] overflow-hidden rounded-2xl border shadow-md transition-all hover:shadow-xl"
                            >
                                <div className="flex h-[150px] w-full items-center justify-center overflow-hidden bg-gray-100">
                                    <img
                                        src={service.image ? `/storage/${service.image}` : '/default-image.png'}
                                        alt={service.service_name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="flex flex-col items-center justify-center bg-white p-4 text-center">
                                    <CardTitle>{service.service_name}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {service.description || 'This service contains a variety of options to suit your needs.'}
                                    </CardDescription>

                                    <div className="flex justify-center gap-2 p-2">
                                        <Dialog
                                            open={editingService?.services_id === service.services_id}
                                            onOpenChange={(open) => {
                                                if (open && service) {
                                                    setEditingService(service);
                                                    setEditData({
                                                        service_name: service.service_name,
                                                        description: service.description,
                                                        image: null,
                                                    });
                                                } else {
                                                    setEditingService(null);
                                                    resetEdit();
                                                }
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <Button variant="secondary" className="w-20">
                                                    <Pencil className="mr-1 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Service</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="edit_service_name">Service Name</Label>
                                                        <Input
                                                            required
                                                            id="edit_service_name"
                                                            name="service_name"
                                                            value={editData.service_name}
                                                            onChange={(e) => setEditData('service_name', e.target.value)}
                                                        />
                                                        {editErrors.service_name && <p className="text-sm text-red-500">{editErrors.service_name}</p>}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="edit_description">Description</Label>
                                                        <Input
                                                            required
                                                            id="edit_description"
                                                            name="description"
                                                            value={editData.description}
                                                            onChange={(e) => setEditData('description', e.target.value)}
                                                        />
                                                        {editErrors.description && <p className="text-sm text-red-500">{editErrors.description}</p>}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="edit_image">Image</Label>
                                                        <Input
                                                            id="edit_image"
                                                            name="image"
                                                            type="file"
                                                            onChange={(e) => setEditData('image', e.target.files?.[0] ?? null)}
                                                        />
                                                        {editErrors.image && <p className="text-sm text-red-500">{editErrors.image}</p>}
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <Button type="submit" disabled={updating}>
                                                            {updating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                            Update
                                                        </Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>

                                        {/* DELETE */}
                                        <Button variant="link" onClick={() => confirmDelete(pkg.package_id, service.services_id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No services found for this package.</p>
                )}
            </div>
        </div>
    );
}
