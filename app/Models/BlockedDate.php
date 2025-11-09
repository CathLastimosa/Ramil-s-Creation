<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockedDate extends Model
{
    use HasFactory;
    protected $table = 'blocked_dates';
    protected $primaryKey = 'date_id';

    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'reason',
    ];
}
