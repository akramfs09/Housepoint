<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;
use App\Models\Property;

class NewPropertySubmission extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public Property $property) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'new_property_submission',
            'property_id' => $this->property->id,
            'title' => $this->property->title,
        ];
    }
}