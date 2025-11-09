import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button-shad';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import EditPackageLayout from '@/layouts/edit-package-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Packages', href: '/package' },
    { title: 'Edit Package', href: '#' },
];

export default function EditPackage() {
    const page = usePage<{ package: any }>();
    const packageData = page.props.package || {};

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        packageName: packageData.package_name || '',
        packageDescription: packageData.package_description || '',
        packagePrice: packageData.package_price || '',
        packagePromo: packageData.package_promo || '',
        discountedPrice: packageData.discounted_price || '',
        packageStatus: packageData.status || '',
        services: packageData.services || [],
    });

    useEffect(() => {
        const price = parseFloat(data.packagePrice.toString()) || 0;
        const promo = parseFloat(data.packagePromo.toString()) || 0;
        const discount = price * (promo / 100);
        setData('discountedPrice', (price - discount).toString());
    }, [data.packagePrice, data.packagePromo]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('package.update', packageData.package_id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Package" />

            <EditPackageLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Package information" description="Update package details and status" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="packageName">Package Name</Label>
                            <Input
                                id="packageName"
                                value={data.packageName}
                                onChange={(e) => setData('packageName', e.target.value)}
                                required
                                placeholder="Enter package name"
                            />
                            <InputError className="mt-2" message={errors.packageName} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="packageDescription">Description</Label>
                            <Textarea
                                id="packageDescription"
                                value={data.packageDescription}
                                onChange={(e) => setData('packageDescription', e.target.value)}
                                placeholder="Describe the package..."
                            />
                            <InputError className="mt-2" message={errors.packageDescription} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="packagePrice">Price</Label>
                            <Input
                                id="packagePrice"
                                type="number"
                                value={data.packagePrice}
                                onChange={(e) => setData('packagePrice', e.target.value)}
                                placeholder="0"
                            />
                            <InputError className="mt-2" message={errors.packagePrice} />
                        </div>

                        <div className="flex w-full gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="packagePromo">Promo %</Label>
                                <Input
                                    id="packagePromo"
                                    type="number"
                                    value={data.packagePromo}
                                    onChange={(e) => setData('packagePromo', e.target.value)}
                                    placeholder="0"
                                />
                                <InputError className="mt-2" message={errors.packagePromo} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discountedPrice">Discounted Price</Label>
                                <Input
                                    id="discountedPrice"
                                    type="number"
                                    value={data.discountedPrice}
                                    onChange={(e) => setData('discountedPrice', e.target.value)}
                                    placeholder="Discounted Price"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="packageStatus">Status</Label>
                            <Select value={data.packageStatus} onValueChange={(value) => setData('packageStatus', value)}>
                                <SelectTrigger id="packageStatus">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="unpublished">Unpublished</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError className="mt-2" message={errors.packageStatus} />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button variant="brand" disabled={processing}>
                                {processing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>

                            {recentlySuccessful && <p className="text-sm text-neutral-600">Saved</p>}
                        </div>
                    </form>
                </div>

                {/* <ShowServices services={data.services} package={packageData} /> */}
            </EditPackageLayout>
        </AppLayout>
    );
}
