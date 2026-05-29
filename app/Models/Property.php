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
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'land_area' => 'integer',
        'building_area' => 'integer',
        'views_count' => 'integer',
        'lock_version' => 'integer',
        'published_at' => 'datetime',
    ];

    public function sellerProfile()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy('order');
    }
}