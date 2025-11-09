<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedbacks extends Model
{
    use HasFactory;
    protected $table = 'feedbacks'; 
    protected $fillable = [
        'booking_id',      
        'rating_emote', 
        'feedback',     
    ];

    protected $casts = [
        'booking_id' => 'integer',  
        'rating_emote' => 'integer', 
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Bookings::class, 'booking_id', 'booking_id');
    }

}
