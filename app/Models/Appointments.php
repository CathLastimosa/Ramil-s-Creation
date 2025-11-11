<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Appointments extends Model
{
    use Notifiable;
    use SoftDeletes;
    
    protected $table = 'appointments'; 
    protected $primaryKey = 'appointment_id';
    public $incrementing = true;

    protected $fillable = [
        'appointment_id',
        'contact_name',
        'contact_email',
        'contact_phone',
        'purpose',
        'appointment_date',
        'appointment_time_from',
        'appointment_time_to',
        'status',
    ];

    public function routeNotificationForMail($notification)
    {
        return $this->contact_email;
    }
}
