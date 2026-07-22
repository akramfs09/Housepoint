<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserBanLog;
use App\Models\AdminActionLog;

class UserService
{
    public function listUsers(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $role = $filters['role'] ?? null;
        // Konversi has_pending_appeal ke boolean (terima string "true"/"false" atau boolean)
        $hasPendingAppeal = filter_var($filters['has_pending_appeal'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = User::with(['role', 'sellerProfile.appeals' => fn($q) => $q->where('status', 'pending')->latest()]);

        if ($hasPendingAppeal) {
            // Hanya user yang punya banding pending
            $query->whereHas('sellerProfile.appeals', fn($q) => $q->where('status', 'pending'));
        } else {
            // Default: hanya Customer & Seller (tanpa Admin/Super Admin)
            $query->whereHas('role', fn($r) => $r->whereIn('nama_role', ['customer', 'seller']));

            // Filter spesifik berdasarkan role jika diberikan
            if ($role) {
                $query->whereHas('role', fn($r) => $r->where('nama_role', $role));
            }
        }

        // Pencarian
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Filter status banned
        if (isset($filters['status'])) {
            $query->where('is_banned', $filters['status'] === 'banned');
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function banUser(User $user, User $admin, ?string $alasan = null): void
    {
        $user->is_banned = true;
        $user->save();
        $user->tokens()->delete();

        UserBanLog::create([
            'user_id' => $user->id,
            'alasan' => $alasan,
            'banned_by' => $admin->id,
            'banned_at' => now(),
        ]);

        AdminActionLog::create([
            'actor_id'    => $admin->id,
            'action'      => 'ban_user',
            'target_type' => User::class,
            'target_id'   => $user->id,
            'metadata'    => json_encode([
                'user_id' => $user->id,
                'alasan'  => $alasan,
            ]),
        ]);
    }

    public function unbanUser(User $user, User $admin): void
    {
        $user->is_banned = false;
        $user->save();

        $lastBan = UserBanLog::where('user_id', $user->id)
            ->latest('banned_at')
            ->first();

        if ($lastBan && !$lastBan->unbanned_at) {
            $lastBan->unbanned_by = $admin->id;
            $lastBan->unbanned_at = now();
            $lastBan->save();
        }

        AdminActionLog::create([
            'actor_id'    => $admin->id,
            'action'      => 'unban_user',
            'target_type' => User::class,
            'target_id'   => $user->id,
            'metadata'    => json_encode([
                'user_id' => $user->id,
            ]),
        ]);
    }
}
