<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;
use App\Models\SellerAppeal;

class NewAppealNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public SellerAppeal $appeal) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'new_appeal',
            'appeal_id' => $this->appeal->id,
            'seller_name' => $this->appeal->sellerProfile->nama_lengkap ?? '',
        ];
    }
}