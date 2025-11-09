<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailNotification extends Model
{
    use HasFactory;

    protected $table = 'email_notifications';
    protected $primaryKey = 'id';
    protected $fillable = [
        'recipient_id',
        'recipient_type',
        'recipient_email',
        'sender_id',
        'subject',
        'type', 
        'status',
    ];

    protected $dates = [
        'scheduled_at'
    ];

}
