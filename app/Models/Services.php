<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Services extends Model
{
    protected $table = 'services';
    protected $primaryKey = 'services_id'; 
    public $incrementing = false;    
    protected $keyType = 'string';

    protected $fillable = [ 
        'services_id',
        'service_name',
        'description',
        'image',
        // Note: You don’t need created_at and updated_at in $fillable, because Eloquent handles those automatically.
    ];

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'package_services', 'services_id', 'package_id');
    }

    public function packagesThroughPivot()
    {
        return $this->hasManyThrough(
            Package::class,
            BookingSelectedServices::class,
            'services_id',   // Foreign key on pivot
            'package_id',    // Foreign key on packages
            'services_id',   // Local key on services
            'package_id'     // Local key on pivot
        );
    }
    public function pivotPackage()
    {
        return $this->belongsTo(Package::class, 'pivot_package_id', 'package_id');
    }

    public function bookingSelections()
    {
        return $this->hasMany(BookingSelectedServices::class, 'services_id', 'services_id');
    }
}
