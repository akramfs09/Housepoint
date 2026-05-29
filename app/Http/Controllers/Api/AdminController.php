<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SellerResource;
use App\Http\Traits\ApiResponse;
use App\Models\Property;
use App\Models\SellerProfile;
use App\Services\PropertyService;
use App\Services\SellerService;
use Illuminate\Http\Request;
use App\Services\UserService;
use App\Http\Resources\UserResource;
use App\Models\SellerAppeal;
use App\Models\User;
use App\Models\AdminActionLog;

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

    public function sellerVerifications()
    {
        $sellers = SellerProfile::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return SellerResource::collection($sellers);
    }

    public function approveSeller(SellerProfile $seller)
    {
        $this->sellerService->approve($seller, request()->user());
        return $this->success(new SellerResource($seller), 'Seller berhasil disetujui.');
    }

    public function rejectSeller(Request $request, SellerProfile $seller)
    {
        $request->validate(['alasan' => 'required|string|max:500']);
        $this->sellerService->reject($seller, $request->user(), $request->alasan);
        return $this->success(new SellerResource($seller), 'Seller berhasil ditolak.');
    }

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

    public function approveAppeal(SellerAppeal $appeal)
    {
        $this->sellerService->approveAppeal($appeal, request()->user());
        return $this->success(null, 'Banding disetujui. Seller mendapat 1 kesempatan tambahan.');
    }

    public function rejectAppeal(Request $request, SellerAppeal $appeal)
    {
        $this->sellerService->rejectAppeal($appeal, request()->user(), $request->catatan_internal);
        return $this->success(null, 'Banding ditolak.');
    }

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

    public function approveProperty(Property $property)
    {
        try {
            $this->propertyService->approve($property);
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
            return $this->success(null, 'Properti berhasil ditolak.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function showSeller(SellerProfile $seller)
    {
        return $this->success(new SellerResource($seller));
    }

    public function activityLogs(Request $request)
    {
        $user = $request->user();
        $query = AdminActionLog::with(['actor', 'target'])->latest();

        // Jika bukan Super Admin, hanya tampilkan log miliknya sendiri
        if (!in_array($user->role?->nama_role, ['super_admin'])) {
            $query->where('actor_id', $user->id);
        } elseif ($request->filled('actor_id')) {
            $query->where('actor_id', $request->actor_id);
        }

        // Filter tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // 🆕 Filter multi‑aksi (menerima array atau string koma)
        if ($request->filled('action')) {
            $actions = $request->input('action');
            if (is_string($actions)) {
                $actions = explode(',', $actions);
            }
            $query->whereIn('action', $actions);
        }

        // Pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', '%' . $search . '%')
                ->orWhere('metadata', 'like', '%' . $search . '%');
            });
        }

        $logs = $query->paginate($request->per_page ?? 20);
        return response()->json($logs);
    }
}