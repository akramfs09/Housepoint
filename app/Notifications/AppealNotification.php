<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

class AppealNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public string $status, // 'approved' | 'rejected'
        public ?string $catatan = null
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'appeal',
            'status' => $this->status,
            'catatan' => $this->catatan,
        ];
    }
}