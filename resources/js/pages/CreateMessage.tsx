'use client';

import { Button } from '@/components/ui/button-shad';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Paperclip, SendHorizonal } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Messages', href: '/messages' },
  { title: 'Create Message', href: '/messages/create' },
];

type Customer = {
  contact_name: string;
  contact_email: string;
  booking_id: number;
};

type StaffMember = {
  staff_name: string;
  email: string;
  staff_id: number;
};

export default function CreateMessage() {
  const { contacts, staff } = usePage<{ contacts: Customer[]; staff: StaffMember[] }>().props;

  const [recipientType, setRecipientType] = useState<'customer' | 'staff' | ''>('');

  const { data, setData, post, processing, errors } = useForm({
    receiver_type: '',
    receiver_email: '',
    booking_id: null as number | null,
    subject: '',
    message: '',
    attachment: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('messages.store'), { forceFormData: true });
  };

  const handleRecipientTypeChange = (value: string) => {
    setRecipientType(value as 'customer' | 'staff');
    setData('receiver_type', value);
    setData('receiver_email', '');
    setData('booking_id', null);
  };

  const handleRecipientSelect = (value: string) => {
    if (recipientType === 'customer') {
      const [email, bookingId] = value.split('|');
      setData('receiver_email', email);
      setData('booking_id', parseInt(bookingId, 10));
    } else {
      setData('receiver_email', value);
      setData('booking_id', null);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Compose Message</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Type */}
          <div>
            <Label>Recipient Type *</Label>
            <Select onValueChange={handleRecipientTypeChange} value={recipientType}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            {errors.receiver_type && <p className="text-red-600">{errors.receiver_type}</p>}
          </div>

          {/* To field (dynamic) */}
          {recipientType && (
            <div>
              <Label>To *</Label>
              <Select
                onValueChange={handleRecipientSelect}
                value={
                  recipientType === 'customer' && data.receiver_email && data.booking_id
                    ? `${data.receiver_email}|${data.booking_id}`
                    : data.receiver_email
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${recipientType}`} />
                </SelectTrigger>
                <SelectContent>
                  {recipientType === 'customer' &&
                    contacts.map((contact) => (
                      <SelectItem
                        key={contact.booking_id}
                        value={`${contact.contact_email}|${contact.booking_id}`}
                      >
                        {contact.contact_name} ({contact.contact_email})
                      </SelectItem>
                    ))}

                  {recipientType === 'staff' &&
                    staff.map((member) => (
                      <SelectItem key={member.staff_id} value={member.email}>
                        {member.staff_name} ({member.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.receiver_email && <p className="text-red-600">{errors.receiver_email}</p>}
            </div>
          )}

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={data.subject}
              onChange={(e) => setData('subject', e.target.value)}
            />
            {errors.subject && <p className="text-red-600">{errors.subject}</p>}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              rows={6}
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
            />
            {errors.message && <p className="text-red-600">{errors.message}</p>}
          </div>

          {/* Attachment */}
          <div>
            <Label
              htmlFor="attachment"
              className="flex cursor-pointer items-center gap-2"
            >
              <Paperclip />
              Attach File
            </Label>
            <input
              id="attachment"
              type="file"
              className="hidden"
              onChange={(e) =>
                setData('attachment', e.target.files?.[0] ?? null)
              }
            />
            {data.attachment && <p>File: {data.attachment.name}</p>}
            {errors.attachment && (
              <p className="text-red-600">{errors.attachment}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button className='w-30' type="submit" disabled={processing}>
                <SendHorizonal />
              Send
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
