import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button-shad';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Package', href: '/package' },
    { title: 'Add New Package', href: '/package/create' },
];

type Step1Props = {
    form: {
        packageName?: string;
        packageDescription?: string;
        packageStatus?: string;
        packagePrice?: number;
        packagePromo?: number;
        discountedPrice?: number;
        announceEmail?: boolean;
    };
};
export default function Step1({ form }: Step1Props) {
    const { data, setData, post, errors } = useForm({
        packageName: form.packageName ?? '',
        packageDescription: form.packageDescription ?? '',
        packageStatus: form.packageStatus ?? '',
        packagePrice: form.packagePrice ?? '',
        packagePromo: form.packagePromo ?? 0,
        discountedPrice: form.discountedPrice ?? '',
        announceEmail: form.announceEmail ?? false,
    });

    const { flash } = usePage<{ flash: { error?: string } }>().props;
    useEffect(() => {
        if (flash.error) toast.error(flash.error);
    }, [flash.error]);

    useEffect(() => {
        const price = parseFloat(data.packagePrice.toString()) || 0;
        const promo = parseFloat(data.packagePromo.toString()) || 0;
        const discount = price * (promo / 100);
        setData('discountedPrice', (price - discount).toString());
    }, [data.packagePrice, data.packagePromo]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('store');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Package Information" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Typography>Add New Package</Typography>

                <form onSubmit={handleSubmit}>
                    <div className="col-span-2 mb-6 md:col-span-1">
                        <Label htmlFor="packageName">Package Name</Label>
                        <Input
                            id="packageName"
                            value={data.packageName}
                            onChange={(e) => setData('packageName', e.target.value)}
                            placeholder="Package Name"
                            aria-invalid={!!errors.packageName}
                        />
                        <InputError message={errors.packageName} />
                    </div>

                    <div className="col-span-2 mb-6 md:col-span-1">
                        <Label htmlFor="packageDescription">Description</Label>
                        <Textarea
                            id="packageDescription"
                            value={data.packageDescription}
                            onChange={(e) => setData('packageDescription', e.target.value)}
                            placeholder="Description"
                            aria-invalid={!!errors.packageDescription}
                        />
                        <InputError message={errors.packageDescription} />
                    </div>

                    <div className="col-span-2 mb-6 md:col-span-1">
                        <Label htmlFor="packageStatus">Status</Label>
                        <Select value={data.packageStatus} onValueChange={(e) => setData('packageStatus', e)}>
                            <SelectTrigger id="packageStatus" aria-invalid={!!errors.packageStatus}>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="unpublished">Unpublish</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.packageStatus} />
                    </div>

                    <div className="col-span-2 mb-6 md:col-span-1">
                        <Label htmlFor="packagePrice">Price</Label>
                        <Input
                            id="packagePrice"
                            type="number"
                            value={data.packagePrice}
                            onChange={(e) => setData('packagePrice', e.target.value)}
                            placeholder="Enter Price"
                            aria-invalid={!!errors.packagePrice}
                        />
                        <InputError message={errors.packagePrice} />
                    </div>

                    <div className="flex w-full gap-3">
                        <div className="col-span-2 mb-6 md:col-span-1">
                            <Label htmlFor="packagePromo">Promo %</Label>
                            <Input
                                id="packagePromo"
                                type="number"
                                value={data.packagePromo}
                                onChange={(e) =>
                                    setData('packagePromo', e.target.value === '' ? 0 : Number(e.target.value))
                                }
                                placeholder="Enter Promo "
                                aria-invalid={!!errors.packagePromo}
                            />
                            <InputError message={errors.packagePromo} />
                        </div>
                        <div className="col-span-2 mb-6 md:col-span-1">
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

                    <div className="mb-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="announceEmail"
                                checked={data.announceEmail}
                                onCheckedChange={(checked) => setData('announceEmail', checked === true)}
                            />
                            <Label htmlFor="announceEmail">Announce the customer about the promo</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button onSubmit={handleSubmit}>
                            <ArrowRight />
                            Next
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
