<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;
use App\Models\SellerProfile;

class NewSellerApplication extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public SellerProfile $seller) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'new_seller_application',
            'seller_id' => $this->seller->id,
            'seller_name' => $this->seller->nama_lengkap,
        ];
    }
}