<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && in_array($user->role?->nama_role, ['admin', 'super_admin']);
        $isOwner = $user && $user->sellerProfile?->id === $this->seller_id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'type' => $this->type,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'land_area' => $this->land_area,
            'building_area' => $this->building_area,
            'status' => $this->status,
            'image_main' => $this->image_main,
            'views_count' => $this->views_count,
            'published_at' => $this->published_at,
            // Field sensitif dibatasi
            'alasan_tolak' => $this->when($isOwner || $isAdmin, $this->alasan_tolak),
            'seller_id' => $this->when($isAdmin, $this->seller_id),
            'seller' => new UserResource($this->whenLoaded('sellerProfile.user')),
            'images' => PropertyImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at,
        ];
    }
}