<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['property_id'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'participants');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->latest();
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
}