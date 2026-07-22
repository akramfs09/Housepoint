<?php

namespace App\Models;

use App\Models\City;
use App\Models\Province;
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
        'province_id',
        'city_id',
        'gmaps_url',
        'gmaps_query',
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
        'province_id' => 'integer',
        'city_id' => 'integer',
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

    public function provinceRelation()
    {
        return $this->belongsTo(Province::class);
    }

    public function cityRelation()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * User yang memfavoritkan properti ini.
     */
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'favorites')
                    ->withTimestamps();
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function featuredListings()
    {
        return $this->hasMany(FeaturedListing::class);
    }

    public function currentFeaturedListing()
    {
        return $this->hasOne(FeaturedListing::class)
            ->where(function ($query) {
                $query->where('status', 'paid')
                    ->orWhere(function ($activeQuery) {
                        $activeQuery->where('status', 'active')
                            ->where('expires_at', '>', now());
                    });
            })
            ->latestOfMany();
    }
}
