<?php

namespace App\Models;

use App\Support\PublicStorageUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'is_banned',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_banned' => 'boolean',
    ];

    protected $appends = [
        'avatar_url',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    public function adminProfile()
    {
        return $this->hasOne(AdminProfile::class);
    }

    public function sellerProfile()
    {
        return $this->hasOne(SellerProfile::class);
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'participants');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Properti yang difavoritkan oleh user.
     */
    public function favorites()
    {
        return $this->belongsToMany(Property::class, 'favorites')
                    ->withTimestamps();
    }

    public function searchHistories()
    {
        return $this->hasMany(SearchHistory::class);
    }

    public function reports()
    {
        return $this->hasMany(UserReport::class);
    }

    public function reportMessages()
    {
        return $this->hasMany(UserReportMessage::class, 'sender_id');
    }

    public function websiteReview()
    {
        return $this->hasOne(WebsiteReview::class);
    }

    public function getAvatarUrlAttribute()
    {
        $customerPhoto = $this->customerProfile?->foto_profil;
        if ($customerPhoto) {
            return PublicStorageUrl::make($customerPhoto);
        }

        $sellerPhoto = $this->sellerProfile?->foto_profil;
        if ($sellerPhoto) {
            return PublicStorageUrl::make($sellerPhoto);
        }

        $storePhoto = $this->sellerProfile?->foto_agen;
        if ($storePhoto) {
            return PublicStorageUrl::make($storePhoto);
        }

        return null;
    }

    public function receivesBroadcastNotificationsOn(): string
    {
        return 'user.' . $this->id;
    }
}
