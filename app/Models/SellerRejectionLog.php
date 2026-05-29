<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerRejectionLog extends Model
{
    protected $fillable = [
        'seller_profile_id',
        'alasan',
        'rejected_by',
        'rejected_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'rejected_at' => 'datetime',
    ];

    public function sellerProfile()
    {
        return $this->belongsTo(SellerProfile::class);
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}