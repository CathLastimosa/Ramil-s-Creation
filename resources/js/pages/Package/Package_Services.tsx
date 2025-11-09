import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import ManageServices from '../Services/ManageServices';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Packages', href: '/package' },
  { title: 'View Services', href: '#' } // dynamic title later
];


export default function PackageServices() {
  // Get data from the backend
  const page = usePage<{ package: any }>();
  const packageData = page.props.package || {};

  const { data} = useForm({
    packageName: packageData.package_name || '',
    packageDescription: packageData.package_description || '',
    packagePrice: packageData.package_price || '',
    packagePromo: packageData.package_promo || '',
    packageStatus: packageData.status || '', 
    services: packageData.services || [],
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Services" />
      <ManageServices services={data.services} package={packageData}/>
    </AppLayout>
  );
}
