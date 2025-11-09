<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class BookingSelectedServices extends Pivot
{
    protected $table = 'booking_selected_services';
    protected $primaryKey = 'booking_selected_service_id'; 
    public $incrementing = false; 
    protected $keyType = 'string';
    protected $fillable = [
        'booking_selected_service_id',
        'booking_id',
        'services_id',
        'package_id',
    ];

    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id', 'booking_id');
    }

    public function service()
    {
        return $this->belongsTo(Services::class, 'services_id', 'services_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id', 'package_id');
    }
}
