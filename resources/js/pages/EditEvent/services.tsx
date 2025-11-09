import { Button } from '@/components/ui/button-shad';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import EditEventLayout from '@/layouts/EditEvent/layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ServiceType {
    services_id: number;
    service_name: string;
    image?: string;
}

interface BookingType {
    booking_id: number;
    services?: ServiceType[];
}

export default function EditServices({ booking, allServices, packages }: { booking: BookingType; allServices: ServiceType[]; packages: any[] }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const [selectedServices, setSelectedServices] = useState<number[]>(
        booking.services?.map(s => s.services_id) || []
    );

    const handleServiceChange = (serviceId: number, checked: boolean) => {
        if (checked) {
            setSelectedServices([...selectedServices, serviceId]);
        } else {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Selected services:', selectedServices);
        router.put(route('adminbooking.updateServices', booking.booking_id), {
            selected_services: selectedServices
        }, {
            onSuccess: () => toast.success('Services updated successfully'),
            onError: (errors) => {
                console.error('Update services error:', errors);
                toast.error('Failed to update services');
            },
        });
    };

    return (
        <EditEventLayout>
            <Head title="Edit Services" />
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {allServices.map((service) => (
                            <div key={service.services_id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`service-${service.services_id}`}
                                    checked={selectedServices.includes(service.services_id)}
                                    onCheckedChange={(checked) =>
                                        handleServiceChange(service.services_id, checked as boolean)
                                    }
                                />
                                <label
                                    htmlFor={`service-${service.services_id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {service.service_name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button type="submit">Update Services</Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('adminbooking.index'))}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </EditEventLayout>
    );
}
