<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentHistory extends Model
{
    protected $fillable = [
        'property_id',
        'user_id',
        'payment_type',
        'payment_label',
        'order_id',
        'amount',
        'status',
        'gateway_status',
        'payment_method',
        'gateway_reference',
        'customer_name',
        'customer_email',
        'seller_name',
        'property_title',
        'property_slug',
        'raw_payload',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'raw_payload' => 'array',
        'paid_at' => 'datetime',
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
