<?php

namespace App\Http\Resources;

use App\Support\PublicStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PropertyImageResource;
use App\Http\Resources\UserResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user() ?: Auth::guard('sanctum')->user();
        $isAdmin = $user && in_array($user->role?->nama_role, ['admin', 'super_admin']);
        $isOwner = $user && $user->sellerProfile?->id === $this->seller_id;
        $mainImage = $this->image_main ?: $this->firstGalleryImagePath();
        $featuredListing = $this->relationLoaded('currentFeaturedListing')
            ? $this->currentFeaturedListing
            : null;

        return [
            'id'             => $this->id,
            // ✅ Selalu tampilkan is_favorited, default false jika guest
            'is_favorited'   => $user
                ? ($this->relationLoaded('favoritedByUsers')
                    ? $this->favoritedByUsers->contains('id', $user->id)
                    : $this->favoritedByUsers()->where('user_id', $user->id)->exists())
                : false,
            'title'          => $this->title,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'price'          => $this->price,
            'type'           => $this->type,
            'status_jual'    => $this->status_jual,
            'address'        => $this->address,
            'province_id'    => $this->province_id,
            'city_id'        => $this->city_id,
            'gmaps_url'      => $this->gmaps_url,
            'gmaps_query'    => $this->gmaps_query,
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
            'seller_id'      => $this->seller_id,
            'featured_status' => $featuredListing?->status,
            'featured_queue_position' => $featuredListing && $featuredListing->status === 'paid'
                ? $this->featuredQueuePosition($featuredListing)
                : null,
            'seller'         => $this->when(
                $this->relationLoaded('sellerProfile') && $this->sellerProfile?->relationLoaded('user'),
                fn () => new UserResource($this->sellerProfile->user)
            ),
            'sellerProfile'  => $this->whenLoaded('sellerProfile', fn () => [
                'id' => $this->sellerProfile->id,
                'nama_lengkap' => $this->sellerProfile->nama_lengkap,
                'nama_agen' => $this->sellerProfile->nama_agen,
                'deskripsi' => $this->sellerProfile->deskripsi,
                'foto_agen' => PublicStorageUrl::make($this->sellerProfile->foto_agen),
            ]),
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

        return PublicStorageUrl::make($path);
    }

    private function featuredQueuePosition($featuredListing): ?int
    {
        if (! $featuredListing->queued_at) {
            return null;
        }

        return $featuredListing->newQuery()
            ->where('status', 'paid')
            ->whereNotNull('queued_at')
            ->where('queued_at', '<=', $featuredListing->queued_at)
            ->count();
    }
}
