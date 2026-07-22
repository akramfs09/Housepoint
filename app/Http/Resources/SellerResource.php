<?php

namespace App\Http\Resources;

use App\Support\PublicStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SellerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isSuperAdmin = $request->user()?->role?->nama_role === 'super_admin';
        $isAdmin = $isSuperAdmin || $request->user()?->role?->nama_role === 'admin';
        $reviewMode = $request->boolean('review_mode');
        $canViewKtp = $isAdmin && (
            ! $reviewMode
            || $request->user()?->role?->nama_role === 'admin'
            || Cache::get("super_admin_ktp_access:{$request->user()->id}") === true
        );

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nama_lengkap' => $this->nama_lengkap,
            'nama_agen' => $this->nama_agen,
            'no_hp' => $this->no_hp,
            'alamat' => $this->alamat,
            'deskripsi' => $this->deskripsi,
            'foto_profil' => PublicStorageUrl::make($this->foto_profil),
            'foto_agen' => PublicStorageUrl::make($this->foto_agen),
            'status' => $this->status,
            'no_hp_verified' => $this->no_hp_verified,
            'rekening' => $this->when($this->user_id === $request->user()?->id, $this->rekening),
            'alasan_tolak' => $this->alasan_tolak,
            'last_apply_at' => $this->last_apply_at,
            'apply_count' => $this->apply_count,
            'verified_at' => $this->verified_at,
            'ktp_url' => $this->when($canViewKtp, fn () => $this->ktp_path
                ? Storage::disk('r2_private')->temporaryUrl($this->ktp_path, now()->addMinutes(15))
                : null),
            'selfie_url' => $this->when($isAdmin, fn () => $this->selfie_path
                ? Storage::disk('r2_private')->temporaryUrl($this->selfie_path, now()->addMinutes(15))
                : null),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
