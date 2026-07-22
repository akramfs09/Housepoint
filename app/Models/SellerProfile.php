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
        'nama_agen',
        'no_hp',
        'alamat',
        'foto_agen',
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
        return PublicStorageUrl::make($this->foto_agen);
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

    public function getNamaTokoAttribute()
    {
        return $this->attributes['nama_agen'] ?? null;
    }

    public function setNamaTokoAttribute($value): void
    {
        $this->attributes['nama_agen'] = $value;
    }

    public function getFotoTokoAttribute()
    {
        return $this->attributes['foto_agen'] ?? null;
    }

    public function setFotoTokoAttribute($value): void
    {
        $this->attributes['foto_agen'] = $value;
    }

    public function getFotoAgenUrlAttribute()
    {
        return PublicStorageUrl::make($this->foto_agen);
    }
}
