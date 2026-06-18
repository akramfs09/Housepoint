<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeaturedListing extends Model
{
    protected $fillable = [
        'property_id',
        'user_id',
        'order_id',
        'amount',
        'status',
        'queued_at',
        'started_at',
        'expires_at',
    ];

    protected $casts = [
        'queued_at'  => 'datetime',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}