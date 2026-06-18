<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

class SellerVerificationNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
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
            'type' => 'seller_verification',
            'status' => $this->status,
            'alasan' => $this->alasan,
        ];
    }
}