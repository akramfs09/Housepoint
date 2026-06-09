<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'seller_id',
        'title',
        'slug',
        'description',
        'price',
        'type',
        'address',
        'city',
        'province',
        'bedrooms',
        'bathrooms',
        'land_area',
        'building_area',
        'status',
        'alasan_tolak',
        'image_main',
        'published_at',
        'edit_count',
        // Field baru
        'status_jual',
        'tahun_dibangun',
        'garasi',
        'jumlah_lantai',
        'sumber_air',
        'fasilitas',
        'video_path',
        'video_type',
        'youtube_url',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'land_area' => 'integer',
        'building_area' => 'integer',
        'views_count' => 'integer',
        'lock_version' => 'integer',
        'edit_count' => 'integer',
        'published_at' => 'datetime',
        // Cast field baru
        'tahun_dibangun' => 'integer',
        'garasi' => 'integer',
        'jumlah_lantai' => 'integer',
        'fasilitas' => 'array',
    ];

    public function sellerProfile()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy('order');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}