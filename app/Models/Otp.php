<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $fillable = [
        'email',
        'token',
        'purpose',
        'expires_at',
        'attempts',
        'register_data',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'register_data' => 'encrypted:array',
        'used_at' => 'datetime',
    ];

    public $timestamps = false;
}