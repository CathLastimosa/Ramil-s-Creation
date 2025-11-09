<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Staff extends Model
{
    use HasFactory;
    use Notifiable;

    protected $table = 'staff';

    protected $primaryKey = 'staff_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'staff_name',
        'email',
        'contact_no',
        'role',
        'color',
        'status',
    ];

    public function routeNotificationForMail($notification)
    {
        return $this->email;
    }

    public function getRouteKeyName()
    {
        return 'staff_id';
    }


    // A staff can be assigned to many bookings
    public function bookings()
    {
        return $this->belongsToMany(Bookings::class, 'assigned_staff', 'staff_id', 'booking_id')
            ->withPivot('assigned_role', 'booking_type')
            ->wherePivot('booking_type', 'event')
            ->withTimestamps();
    }

    // A staff has many availability records
    public function availability()
    {
        return $this->hasMany(StaffAvailability::class, 'staff_id', 'staff_id');
    }

    // A staff can be assigned to many service bookings
    public function serviceBookings()
    {
        return $this->belongsToMany(ServiceBooking::class, 'assigned_staff', 'staff_id', 'service_booking_id')
            ->withPivot('assigned_role', 'booking_type')
            ->wherePivot('booking_type', 'service')
            ->withTimestamps();
    }
}
