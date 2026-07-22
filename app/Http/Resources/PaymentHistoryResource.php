<?php

namespace App\Http\Resources;

use App\Support\PublicStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $property = $this->relationLoaded('property') ? $this->property : null;
        $user = $this->relationLoaded('user') ? $this->user : null;

        return [
            'id' => $this->id,
            'payment_type' => $this->payment_type,
            'payment_label' => $this->payment_label,
            'order_id' => $this->order_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'gateway_status' => $this->gateway_status,
            'payment_method' => $this->payment_method,
            'gateway_reference' => $this->gateway_reference,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'seller_name' => $this->seller_name,
            'property_title' => $this->property_title,
            'property_slug' => $this->property_slug,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->nama_role,
                'avatar_url' => $user->avatar_url,
            ] : null,
            'property' => $property ? [
                'id' => $property->id,
                'title' => $property->title,
                'slug' => $property->slug,
                'status' => $property->status,
                'price' => $property->price,
                'image_main' => $property->image_main ? PublicStorageUrl::make($property->image_main) : null,
                'city' => $property->city,
                'province' => $property->province,
            ] : null,
        ];
    }
}
