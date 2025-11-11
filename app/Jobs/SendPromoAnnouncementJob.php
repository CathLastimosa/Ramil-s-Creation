<?php

namespace App\Jobs;

use App\Models\Package;
use App\Notifications\PromoAnnouncement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class SendPromoAnnouncementJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $package;
    protected $emails;

    /**
     * Create a new job instance.
     */
    public function __construct(Package $package, array $emails)
    {
        $this->package = $package;
        $this->emails = $emails;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Notification::route('mail', $this->emails)->notify(new PromoAnnouncement($this->package));
    }
}
