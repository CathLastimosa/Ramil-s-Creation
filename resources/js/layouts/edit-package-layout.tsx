import Heading from '@/components/heading';
import { Button } from '@/components/ui/button-shad';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function EditPackageLayout({ children }: PropsWithChildren) {
    const page = usePage<{ package: { package_id: number } }>();
    const packageId = page.props.package.package_id;

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Package',
            href: route('package.edit', packageId),
            icon: null,
        },
        {
            title: 'Services',
            href: route('service.editPackageServices', packageId),
            icon: null,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading title="Edit Package" description="Edit package and its services" />

            <div className="flex flex-col space-y-5 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => {
                            // Ensure we compare only pathname
                            const itemPath = new URL(item.href, window.location.origin).pathname;
                            return (
                                <Button
                                    key={`${item.href}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-background-color text-accent2': currentPath.startsWith(itemPath),
                                    })}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-5xl">
                    <section className="max-w-2xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
