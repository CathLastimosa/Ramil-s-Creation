<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PromoAnnouncement extends Notification
{
    use Queueable;

    protected $package;

    /**
     * Create a new notification instance.
     */
    public function __construct($package)
    {
        $this->package = $package;
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
            ->subject('New Promo Package Available!')
            ->greeting('Hello!')
            ->line('We have a new promotional package available: ' . $this->package->package_name)
            ->line('Original Price: ₱' . $this->package->package_price)
            ->line('Discounted Price: ₱' . $this->package->discounted_price)
            ->line('Promo Percentage: ' . $this->package->package_promo . '%')
            ->action('View Package', url('/package/' . $this->package->package_id))
            ->line('Thank you for choosing our services!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
