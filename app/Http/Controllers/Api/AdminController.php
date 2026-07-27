<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SellerResource;
use App\Http\Resources\PaymentHistoryResource;
use App\Http\Resources\PropertyResource;
use App\Http\Traits\ApiResponse;
use App\Models\Property;
use App\Models\SellerProfile;
use App\Services\PropertyService;
use App\Services\SellerService;
use Illuminate\Http\Request;
use App\Services\UserService;
use App\Http\Resources\UserResource;
use App\Models\SellerAppeal;
use App\Models\PaymentHistory;
use App\Models\User;
use App\Models\Role;
use App\Models\AdminActionLog;
use App\Notifications\SellerVerificationNotification;
use App\Notifications\PropertyModerationNotification;
use App\Notifications\AppealNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    use ApiResponse;

    private SellerService $sellerService;
    private PropertyService $propertyService;
    private UserService $userService;

    public function __construct(
        SellerService $sellerService,
        PropertyService $propertyService,
        UserService $userService
    ) {
        $this->sellerService = $sellerService;
        $this->propertyService = $propertyService;
        $this->userService = $userService;
    }

    // ============================================
    // Seller Verifications
    // ============================================
    public function sellerVerifications(Request $request)
    {
        $query = SellerProfile::with('user')->latest();

        if ($request->filled('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        $sellers = $query->paginate(min((int) $request->get('per_page', 20), 50));

        return SellerResource::collection($sellers);
    }

    public function approveSeller(SellerProfile $seller)
    {
        $this->sellerService->approve($seller, request()->user());

        // Kirim notifikasi ke seller
        $seller->user->notify(new SellerVerificationNotification('approved'));

        return $this->success(new SellerResource($seller), 'Seller berhasil disetujui.');
    }

    public function rejectSeller(Request $request, SellerProfile $seller)
    {
        $request->validate(['alasan' => 'required|string|max:500']);
        $this->sellerService->reject($seller, $request->user(), $request->alasan);

        // Kirim notifikasi ke seller
        $seller->user->notify(new SellerVerificationNotification('rejected', $request->alasan));

        return $this->success(new SellerResource($seller), 'Seller berhasil ditolak.');
    }

    public function showSeller(SellerProfile $seller)
    {
        return $this->success(new SellerResource($seller->loadMissing('user')));
    }

    public function confirmKtpAccess(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return $this->error('Password saat ini salah.', 422);
        }

        $expiresAt = now()->addMinutes(10);
        Cache::put($this->ktpAccessCacheKey($user->id), true, $expiresAt);

        AdminActionLog::create([
            'actor_id' => $user->id,
            'action' => 'verify_superadmin_ktp_access',
            'target_type' => User::class,
            'target_id' => $user->id,
            'metadata' => json_encode([
                'verified_at' => now()->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
            ]),
        ]);

        return $this->success([
            'verified_until' => $expiresAt->toDateTimeString(),
        ], 'Verifikasi berhasil.');
    }

    public function sellerKtpReviews(Request $request)
    {
        $query = SellerProfile::with('user')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($builder) use ($search) {
                $builder->where('nama_lengkap', 'like', '%' . $search . '%')
                    ->orWhere('nama_agen', 'like', '%' . $search . '%')
                    ->orWhere('no_hp', 'like', '%' . $search . '%')
                    ->orWhere('alamat', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });

                if (is_numeric($search)) {
                    $builder->orWhere('id', (int) $search);
                    $builder->orWhere('user_id', (int) $search);
                }
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) $request->get('per_page', 20), 50);

        return SellerResource::collection($query->paginate($perPage));
    }

    // ============================================
    // Property Verifications (Moderasi Properti)
    // ============================================
    public function propertyVerifications()
    {
        $properties = Property::with(['images', 'sellerProfile.user'])
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return PropertyResource::collection($properties);
    }

    public function allProperties(Request $request)
    {
        $query = Property::with(['images', 'sellerProfile.user'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('city', 'like', '%' . $search . '%')
                    ->orWhere('province', 'like', '%' . $search . '%')
                    ->orWhereHas('sellerProfile.user', function ($sellerQuery) use ($search) {
                        $sellerQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });

                if (is_numeric($search)) {
                    $q->orWhere('id', (int) $search);
                }
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) $request->get('per_page', 10), 50);

        return PropertyResource::collection($query->paginate($perPage));
    }

    public function approveProperty(Property $property)
    {
        try {
            $this->propertyService->approve($property);

            // Kirim notifikasi ke seller
            $property->sellerProfile->user->notify(
                new PropertyModerationNotification($property, 'approved')
            );

            return $this->success(null, 'Properti berhasil disetujui.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function rejectProperty(Request $request, Property $property)
    {
        $request->validate(['alasan' => 'required|string|max:500']);
        try {
            $this->propertyService->reject($property, $request->alasan);

            // Kirim notifikasi ke seller
            $property->sellerProfile->user->notify(
                new PropertyModerationNotification($property, 'rejected', $request->alasan)
            );

            return $this->success(null, 'Properti berhasil ditolak.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    // ============================================
    // Payment History
    // ============================================
    public function paymentHistories(Request $request)
    {
        $query = PaymentHistory::with(['property.images', 'user.role'])->latest();

        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', '%' . $search . '%')
                    ->orWhere('payment_label', 'like', '%' . $search . '%')
                    ->orWhere('property_title', 'like', '%' . $search . '%')
                    ->orWhere('customer_name', 'like', '%' . $search . '%')
                    ->orWhere('customer_email', 'like', '%' . $search . '%')
                    ->orWhere('seller_name', 'like', '%' . $search . '%')
                    ->orWhere('payment_method', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = min((int) $request->get('per_page', 20), 50);
        $histories = $query->paginate($perPage);

        return PaymentHistoryResource::collection($histories);
    }

    public function showPaymentHistory(PaymentHistory $paymentHistory)
    {
        $paymentHistory->load(['property.images', 'user.role']);

        return $this->success(new PaymentHistoryResource($paymentHistory));
    }

    // ============================================
    // User Statistics
    // ============================================
    public function userStats()
    {
        $customerRole = Role::where('nama_role', 'customer')->value('id');
        $sellerRole = Role::where('nama_role', 'seller')->value('id');

        $totalUsers = User::whereHas('role', fn($q) => $q->whereIn('nama_role', ['customer', 'seller']))
            ->count();

        $totalBuyers = User::where('role_id', $customerRole)->count();
        $totalSellers = User::where('role_id', $sellerRole)->count();
        $totalSuspended = User::whereHas('role', fn($q) => $q->whereIn('nama_role', ['customer', 'seller']))
            ->where('is_banned', true)
            ->count();

        return $this->success([
            'total_users' => $totalUsers,
            'total_buyers' => $totalBuyers,
            'total_sellers' => $totalSellers,
            'total_suspended' => $totalSuspended,
        ]);
    }

    // ============================================
    // User Management
    // ============================================
    public function listUsers(Request $request)
    {
        $users = $this->userService->listUsers($request->only([
            'role', 'search', 'status', 'per_page', 'has_pending_appeal',
        ]));
        return UserResource::collection($users);
    }

    public function banUser(Request $request, User $user)
    {
        $request->validate(['alasan' => 'required|string|max:500']);

        if ($user->id === $request->user()->id) {
            return $this->error('Anda tidak dapat menonaktifkan diri sendiri.', 403);
        }

        $this->userService->banUser($user, $request->user(), $request->alasan);
        return $this->success(null, 'Pengguna berhasil dinonaktifkan.');
    }

    public function unbanUser(Request $request, User $user)
    {
        $this->userService->unbanUser($user, $request->user());
        return $this->success(null, 'Pengguna berhasil diaktifkan kembali.');
    }

    // ============================================
    // Seller Appeals
    // ============================================
    public function listAppeals(Request $request)
    {
        $query = SellerAppeal::with('sellerProfile.user');

        if ($request->filled('user_id')) {
            $query->whereHas('sellerProfile', fn($q) => $q->where('user_id', $request->user_id));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appeals = $query->latest()->paginate($request->per_page ?? 20);
        return $this->success($appeals->items());
    }

    public function approveAppeal(SellerAppeal $appeal)
    {
        $this->sellerService->approveAppeal($appeal, request()->user());

        // Notifikasi ke seller
        $appeal->sellerProfile->user->notify(new AppealNotification('approved'));

        return $this->success(null, 'Banding disetujui. Seller mendapat 1 kesempatan tambahan.');
    }

    public function rejectAppeal(Request $request, SellerAppeal $appeal)
    {
        $this->sellerService->rejectAppeal($appeal, request()->user(), $request->catatan_internal);

        // Notifikasi ke seller
        $appeal->sellerProfile->user->notify(
            new AppealNotification('rejected', $request->catatan_internal)
        );

        return $this->success(null, 'Banding ditolak.');
    }



    // ============================================
    // Activity Logs
    // ============================================
    public function activityLogs(Request $request)
    {
        $user = $request->user();
        $query = AdminActionLog::with(['actor', 'target'])->latest();

        // Jika bukan Super Admin, hanya tampilkan log miliknya sendiri
        if (!in_array($user->role?->nama_role, ['super_admin'])) {
            $query->where('actor_id', $user->id);
        } elseif ($request->filled('actor_id')) {
            $actorInput = trim($request->actor_id);
            if (is_numeric($actorInput)) {
                $query->where('actor_id', $actorInput);
            } else {
                $query->whereHas('actor', function ($q) use ($actorInput) {
                    $q->where(DB::raw('LOWER(name)'), 'like', '%' . strtolower($actorInput) . '%')
                      ->orWhere(DB::raw('LOWER(email)'), 'like', '%' . strtolower($actorInput) . '%');
                });
            }
        }

        // Filter tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter multi-aksi
        if ($request->filled('action')) {
            $actions = $request->input('action');
            if (is_string($actions)) {
                $actions = explode(',', $actions);
            }
            $query->whereIn('action', $actions);
        }

        // Pencarian case-insensitive (bebas kapital/kecil) pada aksi, metadata, maupun akun admin (actor)
        if ($request->filled('search')) {
            $search = strtolower(trim($request->search));
            $query->where(function ($q) use ($search) {
                $q->where(DB::raw('LOWER(action)'), 'like', '%' . $search . '%')
                  ->orWhere(DB::raw('LOWER(metadata)'), 'like', '%' . $search . '%')
                  ->orWhereHas('actor', function ($aq) use ($search) {
                      $aq->where(DB::raw('LOWER(name)'), 'like', '%' . $search . '%')
                         ->orWhere(DB::raw('LOWER(email)'), 'like', '%' . $search . '%');
                  });
            });
        }

        $logs = $query->paginate($request->per_page ?? 10);

        // Set name & email pada target agar frontend bisa langsung baca log.target.name
        $logs->getCollection()->transform(function ($log) {
            $target = $log->target;

            if ($target instanceof \App\Models\SellerProfile) {
                if (!$target->relationLoaded('user')) {
                    $target->load('user');
                }
                $u = $target->user;
                if ($u) {
                    $target->setAttribute('name', $u->name);
                    $target->setAttribute('email', $u->email);
                }
            } elseif ($target instanceof \App\Models\SellerAppeal) {
                if (!$target->relationLoaded('sellerProfile')) {
                    $target->load('sellerProfile.user');
                }
                $u = $target->sellerProfile->user ?? null;
                if ($u) {
                    $target->setAttribute('name', $u->name);
                    $target->setAttribute('email', $u->email);
                }
            } elseif ($target instanceof \App\Models\Property) {
                // Tampilkan judul properti agar frontend bisa baca log.target.name
                $target->setAttribute('name', $target->judul ?? $target->title ?? "Properti #{$target->id}");
            }
            // Untuk tipe User, name & email sudah tersedia langsung dari model

            return $log;
        });

        return response()->json($logs);
    }

    private function ktpAccessCacheKey(int $userId): string
    {
        return "super_admin_ktp_access:{$userId}";
    }
}
