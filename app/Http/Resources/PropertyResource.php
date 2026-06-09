<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\PropertyImageResource;
use App\Http\Resources\UserResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && in_array($user->role?->nama_role, ['admin', 'super_admin']);
        $isOwner = $user && $user->sellerProfile?->id === $this->seller_id;
        $mainImage = $this->image_main ?: $this->firstGalleryImagePath();

        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'price'          => $this->price,
            'type'           => $this->type,
            'status_jual'    => $this->status_jual,
            'address'        => $this->address,
            'city'           => $this->city,
            'province'       => $this->province,
            'bedrooms'       => $this->bedrooms,
            'bathrooms'      => $this->bathrooms,
            'land_area'      => $this->land_area,
            'building_area'  => $this->building_area,
            'tahun_dibangun' => $this->tahun_dibangun,
            'garasi'         => $this->garasi,
            'jumlah_lantai'  => $this->jumlah_lantai,
            'sumber_air'     => $this->sumber_air,
            'fasilitas'      => $this->fasilitas,
            'status'         => $this->status,
            'image_main'     => $this->publicUrl($mainImage),
            'video_path'     => $this->publicUrl($this->video_path),
            'video_type'     => $this->video_type,
            'youtube_url'    => $this->youtube_url,
            'views_count'    => $this->views_count,
            'edit_count'     => $this->when($isOwner || $isAdmin, $this->edit_count),
            'published_at'   => $this->published_at,
            'alasan_tolak'   => $this->when($isOwner || $isAdmin, $this->alasan_tolak),
            'seller_id'      => $this->when($isAdmin, $this->seller_id),
            'seller'         => new UserResource($this->whenLoaded('sellerProfile.user')),
            'images'         => PropertyImageResource::collection($this->whenLoaded('images')),
            'created_at'     => $this->created_at,
        ];
    }

    private function firstGalleryImagePath(): ?string
    {
        if (! $this->relationLoaded('images')) {
            return null;
        }

        return $this->images->first()?->path;
    }

    private function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('r2_public')->url($path);
    }
}
