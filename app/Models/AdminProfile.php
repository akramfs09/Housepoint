<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminProfile extends Model
{
    protected $fillable = [
        'user_id',
        'nama_lengkap',
        'divisi',
        'jabatan',
        'no_hp',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}