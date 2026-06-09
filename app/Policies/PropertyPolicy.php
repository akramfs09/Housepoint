<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // semua user termasuk guest
    }

    public function view(?User $user, Property $property): bool
    {
        // Admin bisa lihat semua
        if ($user && in_array($user->role?->nama_role, ['admin', 'super_admin'])) {
            return true;
        }
        // User lain hanya bisa lihat yang published
        return $property->status === 'published';
    }

    public function create(User $user): bool
    {
        $seller = $user->sellerProfile;
        return $seller && $seller->status === 'approved';
    }

    public function update(User $user, Property $property): bool
    {
        // Pemilik bisa edit jika: draft, rejected, atau published dengan edit_count < 2
        return $user->sellerProfile?->id === $property->seller_id
            && (
                in_array($property->status, ['draft', 'rejected'])
                || ($property->status === 'published' && $property->edit_count < 2)
            );
    }

    public function delete(User $user, Property $property): bool
    {
        return $this->update($user, $property);
    }

    public function submit(User $user, Property $property): bool
    {
        return $user->sellerProfile?->id === $property->seller_id
            && $property->status === 'draft';
    }

    public function approve(User $user): bool
    {
        return in_array($user->role?->nama_role, ['admin', 'super_admin']);
    }

    public function reject(User $user): bool
    {
        return $this->approve($user);
    }
}