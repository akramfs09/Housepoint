<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class SellerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role?->nama_role === 'super_admin'
                || $request->user()?->role?->nama_role === 'admin';

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nama_lengkap' => $this->nama_lengkap,
            'nama_toko' => $this->nama_toko,
            'no_hp' => $this->no_hp,
            'alamat' => $this->alamat,
            'deskripsi' => $this->deskripsi,
            // URL lengkap foto profil akun
            'foto_profil' => $this->foto_profil
                ? Storage::disk('r2_public')->url($this->foto_profil)
                : null,
            // URL lengkap foto toko (baru)
            'foto_toko' => $this->foto_toko
                ? Storage::disk('r2_public')->url($this->foto_toko)
                : null,
            'status' => $this->status,
            'no_hp_verified' => $this->no_hp_verified,
            'rekening' => $this->when($this->user_id === $request->user()?->id, $this->rekening),
            'alasan_tolak' => $this->alasan_tolak,
            'last_apply_at' => $this->last_apply_at,
            'apply_count' => $this->apply_count,
            'verified_at' => $this->verified_at,
            // Field sensitif hanya untuk super admin
            'ktp_url' => $this->when($isAdmin, fn () => $this->ktp_path
                ? Storage::disk('r2_private')->temporaryUrl($this->ktp_path, now()->addMinutes(15))
                : null),
            'selfie_url' => $this->when($isAdmin, fn () => $this->selfie_path
                ? Storage::disk('r2_private')->temporaryUrl($this->selfie_path, now()->addMinutes(15))
                : null),
            'created_at' => $this->created_at,
        ];
    }
}