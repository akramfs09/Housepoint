<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;
use App\Models\Property;

class PaymentSuccessNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public Property $property,
        public string $paymentType = 'property_upload'
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'payment_success',
            'payment_type' => $this->paymentType,
            'property_id' => $this->property->id,
            'title' => $this->property->title,
        ];
    }
}
