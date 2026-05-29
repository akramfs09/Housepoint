<?php

namespace App\Policies;

use App\Models\User;

class AdminPolicy
{
    public function manageAdmins(User $user): bool
    {
        return $user->role?->nama_role === 'super_admin';
    }

    public function inviteAdmin(User $user): bool
    {
        return $user->role?->nama_role === 'super_admin';
    }

    public function updateAdmin(User $user): bool
    {
        return $user->role?->nama_role === 'super_admin';
    }

    public function deactivateAdmin(User $user, User $target): bool
    {
        // Tidak bisa nonaktifkan diri sendiri
        if ($user->id === $target->id) return false;
        return $user->role?->nama_role === 'super_admin';
    }

    public function deleteAdmin(User $user, User $target): bool
    {
        // Tidak bisa hapus diri sendiri
        if ($user->id === $target->id) return false;
        return $user->role?->nama_role === 'super_admin';
    }
}