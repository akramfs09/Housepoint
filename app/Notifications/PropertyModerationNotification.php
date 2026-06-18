<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;
use App\Models\Property;

class PropertyModerationNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public Property $property,
        public string $status, // 'approved' | 'rejected'
        public ?string $alasan = null
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'property_moderation',
            'property_id' => $this->property->id,
            'title' => $this->property->title,
            'status' => $this->status,
            'alasan' => $this->alasan,
        ];
    }
}