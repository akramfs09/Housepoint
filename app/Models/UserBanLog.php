<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBanLog extends Model
{
    protected $fillable = [
        'user_id',
        'alasan',
        'banned_by',
        'banned_at',
        'unbanned_by',
        'unbanned_at',
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'unbanned_at' => 'datetime',
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function banner()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    public function unbanner()
    {
        return $this->belongsTo(User::class, 'unbanned_by');
    }
}