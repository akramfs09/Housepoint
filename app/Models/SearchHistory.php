<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchHistory extends Model
{
    public ?Property $preview_property = null;

    protected $fillable = [
        'user_id',
        'search_text',
        'filters',
        'query_hash',
        'result_count',
        'search_count',
        'last_searched_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'result_count' => 'integer',
        'search_count' => 'integer',
        'last_searched_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
