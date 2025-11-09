<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageServices extends Model
{
    protected $table = 'package_services';
    public $incrementing = false;
    protected $primaryKey = 'package_service_id'; 
    protected $keyType = 'string';

    protected $fillable = [
        'package_service_id',
        'package_id',
        'services_id',
    ];
}
