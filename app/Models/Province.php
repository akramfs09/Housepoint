<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $fillable = ['nama'];

    public function cities()
    {
        return $this->hasMany(City::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
