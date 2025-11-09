import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NavMain({ items = [], title }: { items: NavItem[]; title?: string }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const newOpenItems: Record<string, boolean> = { ...openItems };
        items.forEach((item) => {
            if (item.children && item.children.length > 0) {
                const shouldOpen = item.children.some((child) => page.url.startsWith(child.href));
                newOpenItems[item.title] = shouldOpen;
            }
        });
        setOpenItems(newOpenItems);
    }, [page.url, items]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = openItems[item.title] || false;
                    const isActive = page.url.startsWith(item.href) || (hasChildren && item.children!.some((child) => page.url.startsWith(child.href)));

                    if (hasChildren) {
                        return (
                            <Collapsible key={item.title} open={isOpen} onOpenChange={(open) => setOpenItems(prev => ({ ...prev, [item.title]: open }))}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton isActive={isActive} tooltip={{ children: item.title }}>
                                            {item.icon && <item.icon />}
                                            <div className="flex w-full items-center justify-between">
                                                <span>{item.title}</span>
                                                {item.badge && <Badge variant="destructive" className='bg-accent2'>{item.badge}</Badge>}
                                            </div>
                                            <ChevronRight className={`ml-auto transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="ml-6 border-l border-gray-300 pl-2">
                                            <SidebarMenu className="mt-1">
                                                {item.children!.map((child) => (
                                                    <SidebarMenuItem key={child.title}>
                                                        <SidebarMenuButton asChild isActive={page.url.startsWith(child.href)} tooltip={{ children: child.title }}>
                                                            <Link href={child.href} prefetch>
                                                                {child.icon && <child.icon />}
                                                                <span>{child.title}</span>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </div>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    } else {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <div className="flex w-full items-center justify-between">
                                            <span>{item.title}</span>
                                            {item.badge && <Badge variant="destructive" className='bg-accent2'>{item.badge}</Badge>}
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
