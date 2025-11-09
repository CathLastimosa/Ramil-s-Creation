<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MessageSendingNotification extends Notification 
{
    use Queueable;

    protected $data;

    /**
     * Create a new notification instance.
     */
    public function __construct($data)
    {
        $this->data = $data;
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
            ->subject('You Have a New Message Regarding Your Booking')
            ->greeting('Hello ' . ($this->data['receiver_name'] ?? 'Valued Client') . ',')
            ->line('You’ve received a new message related to your booking. Please see the details below:')
            ->line('Subject: ' . ($this->data['subject'] ?? '(No Subject)'))
            ->line('Message:')
            ->line($this->data['message'])
            ->when(!empty($this->data['attachment']), function ($mail) {
                $attachmentUrl = asset('storage/' . $this->data['attachment']);
                return $mail->line('Attachment: [Click here to download](' . $attachmentUrl . ')');
            })
            ->line('If you have any questions or wish to reply, please log in to your account or contact us directly.')
            ->line('Thank you for your prompt attention.');
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
