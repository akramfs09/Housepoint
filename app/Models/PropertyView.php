<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyView extends Model
{
    protected $fillable = ['property_id', 'user_id', 'created_at'];
    public $timestamps = false;

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}