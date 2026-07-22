<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = $this->role;
        $profile = null;

        if ($role && $role->nama_role === 'customer') {
            $profile = $this->customerProfile;
        } elseif ($role && in_array($role->nama_role, ['admin', 'super_admin'])) {
            $profile = $this->adminProfile;
        } elseif ($role && $role->nama_role === 'seller') {
            $profile = $this->sellerProfile;
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role?->nama_role,
            'is_banned' => $this->is_banned,
            'avatar_url' => $this->avatar_url,
            'created_at' => $this->created_at,
            // ⬇️ PERBAIKAN: tampilkan apply_count jika sellerProfile ADA, tanpa peduli role
            'apply_count' => $this->when(
                $this->relationLoaded('sellerProfile') && $this->sellerProfile !== null,
                fn() => $this->sellerProfile->apply_count ?? 0
            ),
            'appeal_pending' => $this->when(
                $this->relationLoaded('sellerProfile') && $this->sellerProfile !== null,
                fn() => $this->sellerProfile->appeals()->where('status', 'pending')->exists()
            ),
            'pending_appeal' => $this->when(
                $this->relationLoaded('sellerProfile') && $this->sellerProfile?->relationLoaded('appeals'),
                fn() => ($appeal = $this->sellerProfile->appeals->first()) ? [
                    'id' => $appeal->id,
                    'alasan' => $appeal->alasan,
                    'created_at' => $appeal->created_at,
                ] : null
            ),
            'profile' => $profile ? [
                'nama_lengkap' => $profile->nama_lengkap ?? null,
                'no_hp' => $profile->no_hp ?? null,
                'divisi' => $profile->divisi ?? null,
                'jabatan' => $profile->jabatan ?? null,
                'foto_profil' => $profile->foto_profil_url ?? null,
                'foto_agen' => $profile->foto_agen_url ?? null,
            ] : null,
        ];
    }
}
