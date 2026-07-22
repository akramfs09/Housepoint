<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReportMessage extends Model
{
    protected $fillable = [
        'user_report_id',
        'sender_id',
        'message',
        'is_internal',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
    ];

    public function report()
    {
        return $this->belongsTo(UserReport::class, 'user_report_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
