<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = ['province_id', 'nama'];

    public function province()
    {
        return $this->belongsTo(Province::class);
    }
}