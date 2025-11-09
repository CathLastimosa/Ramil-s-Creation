<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    protected $table = 'payments';
    public $incrementing = false;
    protected $primaryKey = 'payment_id'; 
    protected $keyType = 'string';

    protected $fillable = [
        'payment_id',
        'booking_id',
        'payment_method',
        'amount',
        'payment_proof',
        'reference_No',
        'payment_status',
    ];

    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id', 'booking_id');
    }
}
