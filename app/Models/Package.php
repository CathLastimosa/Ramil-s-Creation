<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $table = 'packages';
    protected $primaryKey = 'package_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'package_id',
        'package_name',
        'package_description',
        'status',
        'package_price',
        'package_promo',
        'discounted_price',
        'services_count',
    ];

    public function services()
    {
        return $this->belongsToMany(Services::class, 'package_services', 'package_id', 'services_id');
    }

    public function bookingSelections()
    {
        return $this->hasMany(BookingSelectedServices::class, 'package_id', 'package_id');
    }
}
