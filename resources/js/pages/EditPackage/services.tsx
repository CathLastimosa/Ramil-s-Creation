import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import EditPackageLayout from '@/layouts/edit-package-layout';
import ShowServices from '../Services/ShowServices';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Packages', href: '/package' },
  { title: 'Edit Package', href: '#' },
];

export default function EditServices() {
  const page = usePage<{ package: any; services: any[] }>();
  const packageData = page.props.package;
  const services = page.props.services;

   const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
  
    useEffect(() => {
      if (flash.success) toast.success(flash.success);
      if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);
  

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <EditPackageLayout>
          <ShowServices package={packageData} services={services} />
      </EditPackageLayout>
    </AppLayout>
  );
}
