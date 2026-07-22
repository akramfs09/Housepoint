<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteReview extends Model
{
    protected $fillable = [
        'user_id',
        'rating',
        'review',
        'show_name',
        'status',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'show_name' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
