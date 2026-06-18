<?php

namespace App\Models;

use App\Support\PublicStorageUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SellerProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'ktp_path',
        'selfie_path',
        'nama_lengkap',
        'nama_toko',  
        'no_hp',
        'alamat',
        'foto_toko',           
        'deskripsi',
        'syarat_ketentuan',
        'no_hp_verified',
        'rekening',
        'foto_profil',
    ];

    protected $casts = [
        'no_hp_verified' => 'boolean',
        'verified_at' => 'datetime',
        'last_apply_at' => 'datetime',
        'syarat_ketentuan' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFotoTokoUrlAttribute()
    {
        return PublicStorageUrl::make($this->foto_toko);
    }

    public function getFotoProfilUrlAttribute()
    {
        return PublicStorageUrl::make($this->foto_profil);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'seller_id');
    }

    public function rejectionLogs()
    {
        return $this->hasMany(SellerRejectionLog::class);
    }

    public function appeals()
    {
        return $this->hasMany(SellerAppeal::class);
    }
}