import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router} from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button-shad';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardTitle as UICardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Packages', href: '/package' },
  { title: 'View Services', href: '#' } // dynamic title later
];
// Define types for the package and service objects
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
  // add other fields if needed
}

interface Props {
  package: Package;
  services: Service[];
}

export default function ManageServices(props: Props) {
  const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
  
    useEffect(() => {
      if (flash.success) toast.success(flash.success);
      if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

  const pkg = props.package;

  return (
    <div>
      <div className="flex flex-col gap-4 p-4">
        <CardTitle>Services for {pkg.package_name}</CardTitle>
        <CardDescription className="mb-6">{pkg.package_description}</CardDescription>
        {props.services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {props.services.map((service) => (
              <div
                key={service.services_id}
                className="relative w-[230px] overflow-hidden rounded-2xl border shadow-md transition-all hover:shadow-xl"
              >
                <div className="flex h-[230px] w-full items-center justify-center overflow-hidden bg-gray-100">
                  <img
                    src={service.image ? `/storage/${service.image}` : '/default-image.png'}
                    alt={service.service_name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col items-center justify-center bg-white p-4 text-center">
                  <CardTitle>{service.service_name}</CardTitle>
                  <CardDescription className="mt-1">
                    {service.description ||
                      'This subcategory contains a variety of options to suit your needs.'}
                  </CardDescription>
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


