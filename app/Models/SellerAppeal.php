<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerAppeal extends Model
{
    protected $fillable = [
        'seller_profile_id',
        'alasan',
        'catatan_internal',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function sellerProfile()
    {
        return $this->belongsTo(SellerProfile::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}