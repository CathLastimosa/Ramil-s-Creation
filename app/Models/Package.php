<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
        protected $table = 'packages'; 
    protected $primaryKey = 'package_id'; //	Tells Laravel to use package_id as the primary key
    public $incrementing = false; 	// false because PKG-001 is not numeric
    protected $keyType = 'string'; // string since the ID is text, not a number

    protected $fillable = [ // These are the fields that are mass assignable — meaning you can do: Package::create($request->all()); // if validated
        'package_id',
        'package_name',
        'package_description',
        'status',
        'package_price',
        'package_promo',
        'discounted_price',
        'services_count', // This is the count of services in the package
        // Note: You don’t need created_at and updated_at in $fillable, because Eloquent handles those automatically.
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
