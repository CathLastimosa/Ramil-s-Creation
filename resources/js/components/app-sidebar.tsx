import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck2,
    CalendarRange,
    ClipboardMinus,
    Folder,
    Footprints,
    LayoutGrid,
    MessageCircle,
    Package,
    Share2,
    Star,
    UserRoundCog,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage();
    const pendingBookingsCount = (props.pendingBookingsCount as number) ?? 0;
    const reservedAppointmentsCount = (props.reservedAppointmentsCount as number) ?? 0;
    const incomingMessagesCount = (props.incomingMessagesCount as number) ?? 0;


    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            isActive: true,
        },
        {
            title: 'Calendar',
            href: '/event-calendar',
            icon: CalendarRange,
            isActive: true,
        },
        {
            title: 'Packages',
            href: '/package',
            icon: Package,
            isActive: true,
        },
        {
            title: 'Messages',
            href: '/messages',
            icon: MessageCircle,
            isActive: true,
            badge: incomingMessagesCount > 0 ? incomingMessagesCount : undefined,

        },
        {
            title: 'Staff',
            href: '/staff',
            icon: UserRoundCog,
            isActive: true,
        },
    ];

    const BookingsNavItems: NavItem[] = [
        {
            title: 'Bookings',
            href: '/admin-booking',
            icon: CalendarCheck2,
            isActive: true,
            badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
            children: [
                { title: 'Events', href: '/admin-booking', isActive: true },
                { title: 'Service', href: '/service-booking', isActive: true },
            ],
        },
        {
            title: 'Appointments',
            href: '/admin-appointments',
            icon: Footprints,
            isActive: true,
            badge: reservedAppointmentsCount > 0 ? reservedAppointmentsCount : undefined,
        },
        {
            title: 'Shared Bookings',
            href: '/shared-events',
            icon: Share2,
            isActive: true,
        },
        {
            title: 'Feedbacks',
            href: '/admin-feedback',
            icon: Star,
            isActive: true,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Report',
            href: '/report',
            icon: ClipboardMinus,
            isActive: true,
        },
        {
            title: 'User Manual',
            href: '/user-manual',
            icon: Folder,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-y-auto">
                <NavMain items={mainNavItems} title="Menu" />
                <NavMain items={BookingsNavItems} title="Bookings" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
