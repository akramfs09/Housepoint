<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteContent extends Model
{
    protected $fillable = [
        'branding',
        'hero',
        'footer',
        'about',
        'contact',
        'updated_by',
    ];

    protected $casts = [
        'branding' => 'array',
        'hero' => 'array',
        'footer' => 'array',
        'about' => 'array',
        'contact' => 'array',
    ];

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
