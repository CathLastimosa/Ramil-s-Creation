<?php

namespace App\Notifications;

use App\Models\ServiceBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\EmailNotification;

class ServiceBookingSuccessfullNotification extends Notification
{
    use Queueable;

    protected $serviceBooking;

    /**
     * Create a new notification instance.
     */
    public function __construct(ServiceBooking $serviceBooking)
    {
        $this->serviceBooking = $serviceBooking;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Service Booking Has Been Successfully Created')
            ->greeting('Hello ' . ($this->serviceBooking->contact_name ?? 'Valued Client') . ',')
            ->line('We’re pleased to inform you that your service booking has been successfully processed.')
            ->line('Here are the details of your booking:')
            ->line('Title: ' . $this->serviceBooking->title)
            ->line('Service Name: ' . $this->serviceBooking->service_name)
            ->line('Date: ' . optional($this->serviceBooking->date)->format('F d, Y'))
            ->line('Time: ' . $this->serviceBooking->start_time . ' – ' . $this->serviceBooking->end_time)
            ->line('Total Amount: ₱' . number_format($this->serviceBooking->total_amount, 2))
            ->line('Paid Amount: ₱' . number_format($this->serviceBooking->paid_amount, 2))
            ->line('If you have any questions or would like to make changes to your booking, please don’t hesitate to reach out to us.')
            ->line('Thank you for choosing ' . config('app.name') . '. We look forward to serving you soon!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'service_booking_id' => $this->serviceBooking->service_booking_id,
            'title' => $this->serviceBooking->title,
            'service_name' => $this->serviceBooking->service_name,
            'date' => $this->serviceBooking->date,
        ];
    }

}
