import { CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Typography } from '@mui/material';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Packages', href: '/package' },
  { title: 'View Package', href: '/view-package' },
];

type Package = {
  package_id: number;
  package_name: string;
  package_description: string;
  status: string;
  package_price: number;
  package_promo:number;
  services_count: number;
  created_at?: string;
  updated_at?: string;
};

type ViewPackageProps = {
  package: Package;
};

export default function ViewPackage({ package: pkg }: ViewPackageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Package: ${pkg.package_name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-3">
            <Typography>Package ID:</Typography>
            <Typography>{pkg.package_id}</Typography>
        </div>
        <div>
            <Typography>{pkg.package_name}</Typography>
            <CardDescription>{pkg.package_description}</CardDescription>
        </div>
        <div>
            <Typography>Price</Typography>
            <CardDescription>{pkg.package_price}</CardDescription>
        </div>
        <div>
            <Typography>Promo</Typography>
            <CardDescription>{pkg.package_promo}</CardDescription>
        </div>
        <div>
            <Typography>Number of Services</Typography>
            <CardDescription>{pkg.services_count}</CardDescription>
        </div>
        <div>
            <Typography>Status</Typography>
            <CardDescription>{pkg.status}</CardDescription>
        </div>
      </div>
    </AppLayout>
  );
}
