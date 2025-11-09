<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class ServiceBooking extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $table = 'service_bookings';
    protected $primaryKey = 'service_booking_id';

    public $incrementing = true;

    protected $keyType = 'int';
    protected $fillable = [
        'title',
        'service_name',
        'description',
        'contact_name',
        'contact_number',
        'contact_email',
        'comment',
        'date',
        'return_date',
        'start_time',
        'end_time',
        'total_amount',
        'paid_amount',
        'status',
    ];

    /**
     * Get all staff assigned to this service booking.
     */
    public function assignedStaff()
    {
        return $this->hasMany(AssignedStaff::class, 'service_booking_id', 'service_booking_id')
            ->where('booking_type', 'service');
    }

    /**
     * Quick access: get staff directly as belongsToMany (optional)
     */
    public function staff()
    {
        return $this->belongsToMany(Staff::class, 'assigned_staff', 'service_booking_id', 'staff_id')
            ->withPivot('assigned_role', 'booking_type')
            ->wherePivot('booking_type', 'service')
            ->withTimestamps();
    }

    public function routeNotificationForMail($notification)
    {
        return $this->contact_email;
    }
}
