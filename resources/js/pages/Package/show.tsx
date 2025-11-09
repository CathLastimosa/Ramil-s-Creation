import { EmptyEventBookings } from '@/components/empty/empty-events';
import { Button } from '@/components/ui/button-shad';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Eye, LucidePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Packages', href: 'package' }];

interface PackageType {
    package_id: string;
    package_name: string;
    package_description: string;
    package_price: number;
    package_promo: number;
    discounted_price: number;
    services_count: number;
    status: string;
}

export default function Package({ packages }: { packages: PackageType[] }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(route('package.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
    ).current;

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleSearch(e.target.value);
    }

    function confirmDelete(id: string) {
        if (window.confirm('Are you sure you want to delete this package?')) {
            router.delete(route('package.destroy', { id }), { preserveScroll: true });
        }
    }

    // Manage statuses locally for inline edit
    const [statuses, setStatuses] = useState<Record<string, string>>(() =>
        packages.reduce(
            (acc, pkg) => {
                acc[pkg.package_id] = pkg.status;
                return acc;
            },
            {} as Record<string, string>,
        ),
    );

    function updateStatus(id: string, newStatus: string) {
        setStatuses((prev) => ({ ...prev, [id]: newStatus }));
        router.put(
            route('package.updateStatus', id),
            { status: newStatus },
            {
                preserveScroll: true,
                onError: () => toast.error('Failed to update status'),
            },
        );
    }

    // State for view package dialog
    const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    function StatusDot({ className }: { className?: string }) {
        return (
            <svg
                width="13"
                height="13"
                fill="currentColor"
                viewBox="0 0 5 5"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                aria-hidden="true"
            >
                <circle cx="2" cy="2" r="2" />
            </svg>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Packages" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CardTitle>Packages</CardTitle>
                <CardDescription className="mb-2">You can manage packages here.</CardDescription>
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-1/3">
                        <Input id="search" className="peer ps-9" placeholder="Search Package" type="search" onChange={onSearchChange} />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
                            <Search size={16} aria-hidden="true" />
                        </div>
                    </div>

                    <Button asChild variant="brand" className="flex items-center gap-1">
                        <Link href="package/create" prefetch={true}>
                            <Plus className="h-4 w-4" />
                            Add Package
                        </Link>
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package ID</TableHead>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Original Price</TableHead>
                            <TableHead>Package Promo</TableHead>
                            <TableHead>Discounted Price</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {packages.length > 0 ? (
                            packages.map((pkg) => (
                                <TableRow key={pkg.package_id}>
                                    <TableCell>{pkg.package_id}</TableCell>
                                    <TableCell>{pkg.package_name}</TableCell>
                                    <TableCell>₱{Number(pkg.package_price || 0).toLocaleString('en-US')}</TableCell>
                                    <TableCell>{pkg.package_promo}%</TableCell>
                                    <TableCell>₱{Number(pkg.discounted_price || 0).toLocaleString('en-US')}</TableCell>
                                    <TableCell>
                                        <Button asChild size="sm" variant="link" className="underline">
                                            <Link href={`package/${pkg.package_id}/show-services`} prefetch={true}>
                                                View Services
                                            </Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={statuses[pkg.package_id]} onValueChange={(value) => updateStatus(pkg.package_id, value)}>
                                            <SelectTrigger id={`packageStatus-${pkg.package_id}`}>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="published">
                                                    <span className="flex items-center gap-2">
                                                        <StatusDot className="text-green-600" />
                                                        <span className="truncate">Publish</span>
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="unpublished">
                                                    <span className="flex items-center gap-2">
                                                        <StatusDot className="text-red-500" />
                                                        <span className="truncate">Unpublish</span>
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    <TableCell className="flex space-x-3">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Eye
                                                    size={20}
                                                    className="cursor-pointer text-green-600 hover:text-gray-800"
                                                    onClick={() => {
                                                        setSelectedPackage(pkg);
                                                        setIsDialogOpen(true);
                                                    }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>View Package</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Pencil
                                                    onClick={() => router.visit(route('package.edit', pkg.package_id))}
                                                    className="cursor-pointer text-yellow-600 hover:text-gray-800"
                                                    size={20}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Package</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Trash2
                                                    className="cursor-pointer text-red-600 hover:text-gray-800"
                                                    size={20}
                                                    onClick={() => confirmDelete(pkg.package_id)}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Package</TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    <EmptyEventBookings
                                        title="No package found"
                                        action={
                                            <Button className="gap-2" onClick={() => router.visit(route('package.create'))}>
                                                <LucidePlus className="size-4" />
                                                <span>Create Package</span>
                                            </Button>
                                        }
                                    />{' '}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* View Package Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Package Details</DialogTitle>
                            <DialogDescription>View the details of the selected package.</DialogDescription>
                        </DialogHeader>
                        {selectedPackage && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{selectedPackage.package_name}</h3>
                                    <span className="text-sm text-muted-foreground">ID: {selectedPackage.package_id}</span>
                                </div>
                                <CardDescription className="text-sm">{selectedPackage.package_description}</CardDescription>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Original Price:</span>
                                        <span className="text-sm">{(selectedPackage.package_price || 0).toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Promo:</span>
                                        <span className="text-sm">{selectedPackage.package_promo}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Discounted Price:</span>
                                        <span className="text-sm">{Number(selectedPackage.discounted_price || 0).toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Number of Services:</span>
                                        <span className="text-sm">{selectedPackage.services_count}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
