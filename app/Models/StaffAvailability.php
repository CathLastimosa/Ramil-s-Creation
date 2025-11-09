<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffAvailability extends Model
{
    use HasFactory;

    protected $table = 'staff_availability';
    protected $primaryKey = 'availability_id';

    protected $fillable = [
        'staff_id',
        'day_of_week',
        'start_time',
        'end_time',
        'status',
        'reason',
    ];

    // Each availability record belongs to one staff member
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id', 'staff_id');
    }
}
