<?php

namespace App\Services;

use App\Models\AdminActionLog;
use App\Models\User;
use App\Models\AdminProfile;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminManagementService
{
    public function listAdmins(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $roleAdmin = Role::where('nama_role', 'admin')->first();
        $roleSuperAdmin = Role::where('nama_role', 'super_admin')->first();

        return User::whereIn('role_id', [$roleAdmin->id, $roleSuperAdmin->id])
            ->with('adminProfile')
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $query->where(function ($q) use ($filters) {
                    $q->where('name', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('email', 'like', '%' . $filters['search'] . '%');
                });
            })
            ->when(isset($filters['role']), function ($query) use ($filters, $roleAdmin, $roleSuperAdmin) {
                if ($filters['role'] === 'admin') {
                    $query->where('role_id', $roleAdmin->id);
                } elseif ($filters['role'] === 'super_admin') {
                    $query->where('role_id', $roleSuperAdmin->id);
                }
            })
            ->when(isset($filters['status']), function ($query) use ($filters) {
                if ($filters['status'] === 'active') {
                    $query->where('is_banned', false);
                } elseif ($filters['status'] === 'inactive') {
                    $query->where('is_banned', true);
                }
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 20);
    }

    public function inviteAdmin(array $data, User $actor): User
    {
        $role = Role::where('nama_role', $data['role'])->firstOrFail();
        $tempPassword = Str::random(16);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($tempPassword),
            'email_verified_at' => now(),
        ]);

        $user->role_id = $role->id;
        $user->save();

        AdminProfile::create([
            'user_id' => $user->id,
            'nama_lengkap' => $data['name'],
            'divisi' => $data['divisi'] ?? 'Administration',
            'jabatan' => $data['jabatan'] ?? ($data['role'] === 'super_admin' ? 'Super Administrator' : 'Administrator'),
        ]);

        // Log aktivitas
        AdminActionLog::create([
            'actor_id' => $actor->id,
            'action' => 'invite_admin',
            'target_type' => User::class,
            'target_id' => $user->id,
            'metadata' => [
                'role' => $data['role'],
                'email' => $data['email'],
            ],
        ]);

        // TODO: Kirim email undangan dengan password sementara di Batch 6
        // Mail::to($user->email)->send(new AdminInvitationMail($user, $tempPassword));

        return $user->load('adminProfile');
    }

    public function updateAdmin(User $target, array $data, User $actor): User
    {
        $oldData = $target->only(['name', 'email', 'role_id']);

        $target->name = $data['name'] ?? $target->name;
        $target->email = $data['email'] ?? $target->email;

        if (isset($data['role'])) {
            $role = Role::where('nama_role', $data['role'])->first();
            if ($role) $target->role_id = $role->id;
        }

        $target->save();

        if ($target->adminProfile) {
            $target->adminProfile->update([
                'nama_lengkap' => $data['name'] ?? $target->adminProfile->nama_lengkap,
                'divisi' => $data['divisi'] ?? $target->adminProfile->divisi,
                'jabatan' => $data['jabatan'] ?? $target->adminProfile->jabatan,
            ]);
        }

        AdminActionLog::create([
            'actor_id' => $actor->id,
            'action' => 'update_admin',
            'target_type' => User::class,
            'target_id' => $target->id,
            'metadata' => [
                'old' => $oldData,
                'new' => $data,
            ],
        ]);

        return $target->fresh()->load('adminProfile');
    }

    public function deactivateAdmin(User $target, string $reason, User $actor): User
    {
        if ($target->id === $actor->id) {
            throw new \Exception('Anda tidak dapat menonaktifkan diri sendiri.');
        }

        $target->is_banned = true;
        $target->save();

        // Hapus semua sesi
        $target->tokens()->delete();

        AdminActionLog::create([
            'actor_id' => $actor->id,
            'action' => 'deactivate_admin',
            'target_type' => User::class,
            'target_id' => $target->id,
            'metadata' => ['reason' => $reason],
        ]);

        return $target->fresh()->load('adminProfile');
    }

    public function reactivateAdmin(User $target, User $actor): User
    {
        $target->is_banned = false;
        $target->save();

        AdminActionLog::create([
            'actor_id' => $actor->id,
            'action' => 'reactivate_admin',
            'target_type' => User::class,
            'target_id' => $target->id,
        ]);

        return $target->fresh()->load('adminProfile');
    }

    public function deleteAdmin(User $target, User $actor): void
    {
        if ($target->id === $actor->id) {
            throw new \Exception('Anda tidak dapat menghapus diri sendiri.');
        }

        AdminActionLog::create([
            'actor_id' => $actor->id,
            'action' => 'delete_admin',
            'target_type' => User::class,
            'target_id' => $target->id,
            'metadata' => [
                'name' => $target->name,
                'email' => $target->email,
            ],
        ]);

        $target->adminProfile()->delete();
        $target->delete();
    }

    public function getAuditLogs(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        return AdminActionLog::with('actor')
            ->latest()
            ->paginate($filters['per_page'] ?? 20);
    }
}