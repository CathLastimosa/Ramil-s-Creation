import Heading from '@/components/heading';
import { Button } from '@/components/ui/button-shad';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

interface EditStaffLayoutProps {
    children: React.ReactNode;
    breadcrumbs: any[];
    staffId: string;
    activeTab: 'details' | 'availability';
}

const sidebarNavItems = (staffId: string): NavItem[] => [
    {
        title: 'Details',
        href: route('staff.edit', staffId),
        icon: null,
    },
    {
        title: 'Availability',
        href: route('staffavailability.edit', staffId),
        icon: null,
    },
];

export default function EditStaffLayout({ children, breadcrumbs, staffId, activeTab }: EditStaffLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="px-4 py-6">
                <Heading title="Edit Staff" description="Manage staff details and availability" />

                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav className="flex flex-col space-y-1 space-x-0">
                            {sidebarNavItems(staffId).map((item, index) => (
                                <Button
                                    key={`${item.href}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-background-color text-accent2':
                                            (item.title === 'Details' && activeTab === 'details') ||
                                            (item.title === 'Availability' && activeTab === 'availability'),
                                    })}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 md:hidden" />

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-12">{children}</section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
