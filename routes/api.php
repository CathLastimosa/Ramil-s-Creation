<?php

use Illuminate\Support\Facades\Route;
use App\Models\EmailNotification;

Route::middleware('api')->group(function () {
    Route::get('/notifications', function () {
        $notifications = EmailNotification::query()
            ->leftJoin('event_bookings', 'email_notifications.recipient_id', '=', 'event_bookings.booking_id')
            ->leftJoin('appointments', 'email_notifications.recipient_id', '=', 'appointments.appointment_id')
            ->leftJoin('service_bookings', 'email_notifications.recipient_id', '=', 'service_bookings.service_booking_id')
            ->leftJoin('messages', 'email_notifications.recipient_id', '=', 'messages.message_id')
            ->leftJoin('event_bookings as sender', 'messages.sender_id', '=', 'sender.booking_id')
            ->leftJoin('event_bookings as receiver', 'messages.receiver_id', '=', 'receiver.booking_id')
            ->leftJoin('staff', 'email_notifications.recipient_id', '=', 'staff.staff_id')

            ->select(
                'email_notifications.id',
                'email_notifications.subject',
                'email_notifications.type',
                'email_notifications.status',
                'email_notifications.created_at',
                'email_notifications.recipient_type',

                // Event bookings
                'event_bookings.contact_name as event_contact_name',
                'event_bookings.contact_email as event_contact_email',
                'event_bookings.event_name',
                'event_bookings.event_date',

                // Appointments
                'appointments.contact_name as appointment_contact_name',
                'appointments.contact_email as appointment_contact_email',
                'appointments.purpose',
                'appointments.appointment_date',

                // Service bookings
                'service_bookings.contact_name as service_contact_name',
                'service_bookings.contact_email as service_contact_email',
                'service_bookings.service_name',
                'service_bookings.date as service_date',

                // Messages
                'messages.subject as message_subject',
                'messages.message',
                'messages.receiver_email',
                'messages.sender_type',

                //sender details from event bookings
                'sender.contact_name as sender_contact_name',
                'sender.contact_email as sender_contact_email',
                'sender.event_name as sender_event_name',

                //receiver details from event bookings
                'receiver.contact_name as receiver_contact_name',
                'receiver.contact_email as receiver_contact_email',
                'receiver.event_name as receiver_event_name',

                // Staff details
                'staff.staff_name',
                'staff.email as staff_email'
            )
            ->orderByDesc('email_notifications.created_at')
            ->get();

        return response()->json($notifications);
    });
});