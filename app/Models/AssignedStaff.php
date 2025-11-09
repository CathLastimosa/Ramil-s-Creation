<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignedStaff extends Model
{
    use HasFactory;

    protected $table = 'assigned_staff';
    protected $primaryKey = 'assigned_id';
    public $timestamps = true;

    protected $fillable = [
        'booking_id',
        'staff_id',
        'service_booking_id',
        'booking_type',
        'assigned_role',
    ];

    // Each assignment belongs to a specific booking
    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id', 'booking_id');
    }

        // Each assignment belongs to a specific booking
    public function serviceBooking()
    {
        return $this->belongsTo(ServiceBooking::class, 'service_booking_id', 'service_booking_id');
    }


    // Each assignment belongs to one staff member
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id', 'staff_id');
    }
}
