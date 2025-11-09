import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button-shad';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Services', href: '/service' },
  { title: 'Edit Service', href: '#' }, // dynamic later
];

export default function EditService() {
  const page = usePage<{ service: any }>();
  const serviceData = page.props.service || {};

  // Separate file input from image preview URL
  const [imagePreview, setImagePreview] = useState<string | null>(serviceData.image || null);

  const { data, setData, put, processing, errors } = useForm({
    serviceName: serviceData.service_name || '',
    description: serviceData.description || '',
    image: null as File | null,
  });

  useEffect(() => {
    if (serviceData.image) {
      setImagePreview(serviceData.image);
    }
  }, [serviceData.image]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setData('image', file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/service/${serviceData.services_id}/update`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Service" />
      <div className="flex flex-col gap-4 p-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label>Service Name</Label>
            <Input
              value={data.serviceName}
              onChange={(e) => setData('serviceName', e.target.value)}
              aria-invalid={!!errors.serviceName}
            />
            <InputError message={errors.serviceName} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              aria-invalid={!!errors.description}
            />
            <InputError message={errors.description} />
          </div>

          <div>
            <Label>Image</Label>
            <Input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleImageChange}
              aria-invalid={!!errors.image}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image preview"
                className="mt-2 h-24 w-24 object-cover rounded"
              />
            )}
            <InputError message={errors.image} />
          </div>

          <Button type="submit" disabled={processing}>
            {processing ? 'Updating...' : 'Update Service'}
          </Button>
        </form>
      </div>
      </AppLayout>
    
  );
}
