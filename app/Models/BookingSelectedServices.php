<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingSelectedServices extends Model
{
    protected $table = 'booking_selected_services';
    protected $primaryKey = 'booking_selected_service_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'booking_id',
        'services_id',
        'package_id',
        'package_name',
        'package_description',
        'package_price',
        'package_promo',
        'discounted_price',
        'service_name',
        'service_description',
        'service_image',
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
