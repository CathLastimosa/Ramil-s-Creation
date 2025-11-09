<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Bookings extends Model
{
    use Notifiable;
    use SoftDeletes;
    
    protected $table = 'event_bookings';
    protected $primaryKey = 'booking_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'transaction_number',
        'event_name',
        'event_date',
        'event_time_from',
        'event_time_to',
        'event_type',
        'status',
        'guest_count',
        'special_request',
        'contact_name',
        'contact_number',
        'contact_email',
        'street_address',
        'email_verified',
        'email_verified_at',
        'city',
        'province',
        'total_amount',
    ];

    protected $casts = [
        'event_date' => 'date',
        'email_verified' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function getRouteKeyName()
    {
        return 'booking_id';
    }

    public function services()
    {
        return $this->belongsToMany(Services::class, 'booking_selected_services', 'booking_id', 'services_id')
            ->withPivot('package_id');
    }

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'booking_selected_services', 'booking_id', 'package_id')
            ->withPivot('services_id');
    }

    public function payment()
    {
        return $this->hasOne(Payments::class, 'booking_id', 'booking_id');
    }

    public function messages()
    {
        return $this->hasMany(Messages::class, 'booking_id', 'booking_id');
    }

    public function emailLogs()
    {
        return $this->hasMany(EmailNotification::class, 'booking_id', 'booking_id');
    }

    public function routeNotificationForMail($notification)
    {
        return $this->contact_email;
    }

    public function sentMessages()
    {
        return $this->morphMany(Messages::class, 'sender');
    }

    public function staff()
    {
        return $this->belongsToMany(Staff::class, 'assigned_staff', 'booking_id', 'staff_id')
            ->withPivot('assigned_role', 'booking_type')
            ->wherePivot('booking_type', 'event')
            ->withTimestamps();
    }

    public function assignedStaff()
    {
        return $this->hasMany(AssignedStaff::class, 'booking_id', 'booking_id')
            ->where('booking_type', 'event');
    }
}
