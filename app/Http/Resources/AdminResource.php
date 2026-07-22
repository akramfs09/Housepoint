<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role?->nama_role,
            'is_banned' => $this->is_banned,
            'avatar_url' => $this->avatar_url,
            'profile' => $this->whenLoaded('adminProfile', function () {
                return [
                    'nama_lengkap' => $this->adminProfile->nama_lengkap ?? null,
                    'divisi' => $this->adminProfile->divisi ?? null,
                    'jabatan' => $this->adminProfile->jabatan ?? null,
                ];
            }),
            'created_at' => $this->created_at,
        ];
    }
}
