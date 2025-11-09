import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button-shad';
import { CardTitle as UICardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Package', href: '/package' },
    { title: 'Add New Package', href: '/package/create' },
    { title: 'Add Services', href: '/services/create' },
];

type Step2Props = {
    form: {
        serviceName?: string;
        serviceDescription?: string;
        image?: string;
    };
    services: any[];
};

const STORAGE_KEY = 'step2-form';

export default function Step2({ form, services }: Step2Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    let savedDraft: { serviceName?: string; serviceDescription?: string; imagePreview?: string | null } | null = null;
    if (typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) savedDraft = JSON.parse(raw);
        } catch {
            savedDraft = null;
        }
    }

    const { data, setData, errors, post, get } = useForm({
        serviceName: savedDraft?.serviceName ?? form.serviceName ?? '',
        serviceDescription: savedDraft?.serviceDescription ?? form.serviceDescription ?? '',
        image: null as File | null,
        imagePreview: savedDraft?.imagePreview ?? null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(data.imagePreview ?? null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    serviceName: data.serviceName ?? '',
                    serviceDescription: data.serviceDescription ?? '',
                    imagePreview: data.imagePreview ?? null,
                }),
            );
        } catch {}
    }, [data.serviceName, data.serviceDescription, data.imagePreview]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            setData('image', null);
            setData('imagePreview', null);
            setImagePreview(null);
            return;
        }
        setData('image', file);

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setData('imagePreview', result);
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    }

    function handleAddService(e: React.FormEvent) {
        e.preventDefault();
        post(route('service.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData({
                    serviceName: '',
                    serviceDescription: '',
                    image: null,
                    imagePreview: null,
                });
                setImagePreview(null);
                localStorage.removeItem(STORAGE_KEY);
            },
        });
    }

    function handleRemoveService(index: number) {
        router.post(route('service.remove'), { index }, { preserveScroll: true });
    }

    function handleSubmitAll() {
        post(route('package.save'), {});
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Services Information" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="text-xl text-slate-600">
                    <UICardTitle>Add Services Information</UICardTitle>
                </div>

                {/* Add Service Form */}
                <form onSubmit={handleAddService} encType="multipart/form-data">
                    <div className="mb-4">
                        <Label htmlFor="serviceName">Service Name</Label>
                        <Input
                            id="serviceName"
                            type="text"
                            value={data.serviceName}
                            onChange={(e) => setData('serviceName', e.target.value)}
                            placeholder="Enter Service Name"
                            aria-invalid={!!errors.serviceName}
                        />
                        <InputError message={errors.serviceName} />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="serviceDescription">Description</Label>
                        <Textarea
                            id="serviceDescription"
                            value={data.serviceDescription}
                            onChange={(e) => setData('serviceDescription', e.target.value)}
                            placeholder="Enter Description"
                            aria-invalid={!!errors.serviceDescription}
                        />
                        <InputError message={errors.serviceDescription} />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="image">Service Image</Label>
                        <Input id="image" type="file" name="image" accept="image/*" onChange={handleImageChange} />

                        {imagePreview && (
                            <div className="relative mt-3 inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Image Preview"
                                    className="h-28 w-28 rounded-md border border-gray-300 object-cover shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('image', null);
                                        setData('imagePreview', null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute top-0 right-0 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white shadow-md hover:bg-red-600"
                                    title="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    <Button type="submit" variant="outline" className="mt-2">
                        Add Service
                    </Button>
                </form>

                {/* Services Definition List View */}
                {services && services.length > 0 ? (
                    <dl className="mt-6 divide-y rounded-md border bg-white">
                        {services.map((s: any, index: number) => (
                            <div key={index} className="flex items-start justify-between px-4 py-3">
                                <div className="min-w-0">
                                    <dt className="truncate font-medium text-slate-800">{s.serviceName}</dt>
                                    <dd className="mt-1 text-sm text-gray-600">{s.serviceDescription}</dd>
                                </div>

                                <div className="ml-4 flex-shrink-0">
                                    <Button variant="destructive" type="button" onClick={() => handleRemoveService(index)}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <div className="mt-6 text-gray-500">No services added yet.</div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-end gap-2">
                    <Button type="submit" variant="secondary" onClick={() => window.history.back()}>
                        Back
                    </Button>
                    <Button onClick={handleSubmitAll} type="button">
                        <Save />
                        Save
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}