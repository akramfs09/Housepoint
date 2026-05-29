<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = [
        'nama_lengkap',
        'no_hp',
        'alamat',
        'tanggal_lahir',
        'jenis_kelamin',
        'pekerjaan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}