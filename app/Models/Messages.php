<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Messages extends Model
{
    use HasFactory;

    protected $table = 'messages';

    protected $primaryKey = 'message_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sender_id',
        'sender_type',
        'receiver_id',
        'receiver_type',
        'receiver_email',
        'subject',
        'message',
        'attachment',
        'message_type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Polymorphic relationship: Who sent this message (e.g., User/Admin).
     */
    public function sender(): MorphTo
    {
        return $this->morphTo('sender');
    }

    /**
     * Polymorphic relationship: Who received this message (e.g., Bookings/Customer or Staff).
     */
    public function receiver(): MorphTo
    {
        return $this->morphTo('receiver');
    }

    // Optional: Accessors for convenience (e.g., get booking_id if receiver is Bookings)
    public function getBookingIdAttribute(): ?int
    {
        return $this->receiver_type === Bookings::class ? $this->receiver_id : null;
    }
}
