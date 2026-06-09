<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyRequest;
use App\Http\Requests\SellerRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\SellerResource;
use App\Http\Traits\ApiResponse;
use App\Models\Property;
use App\Services\PropertyService;
use App\Services\SellerService;
use Illuminate\Http\Request;
use App\Models\SellerProfile;
use App\Models\Transaction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\PaymentService;

class SellerController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    private SellerService $sellerService;
    private PropertyService $propertyService;

    public function __construct(SellerService $sellerService, PropertyService $propertyService)
    {
        $this->sellerService = $sellerService;
        $this->propertyService = $propertyService;
    }

    public function register(SellerRequest $request)
    {
        try {
            $seller = $this->sellerService->register($request);
            return $this->success(new SellerResource($seller), 'Pengajuan seller berhasil dikirim.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function myProperties(Request $request)
    {
        $seller = $request->user()->sellerProfile;
        $query = Property::where('seller_id', $seller->id)
            ->with(['images', 'sellerProfile.user']);

        // Filter berdasarkan status jika dikirim dari frontend
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $properties = $query->latest()->paginate(12);

        return PropertyResource::collection($properties);
    }

    public function store(PropertyRequest $request)
    {
        $this->authorize('create', Property::class);

        $property = $this->propertyService->create($request);
        return $this->success(new PropertyResource($property->load('images')), 'Properti berhasil dibuat.', 201);
    }

    public function update(PropertyRequest $request, Property $property)
    {
        $this->authorize('update', $property);

        $property = $this->propertyService->update($request, $property);
        return $this->success(new PropertyResource($property->load('images')), 'Properti berhasil diperbarui.');
    }

    public function status(Request $request)
    {
        $user = $request->user();
        $seller = SellerProfile::where('user_id', $user->id)
            ->with('rejectionLogs.rejectedBy')
            ->first();

        if (!$seller) {
            return $this->success([
                'has_applied' => false,
                'status' => null,
                'alasan_tolak' => null,
                'last_apply_at' => null,
                'apply_count' => 0,
                'cooldown_days_left' => 0,
                'rejection_history' => [],
            ]);
        }

        // Perhitungan cooldown: 1 hari (24 jam)
        $cooldownDaysLeft = 0;
        if ($seller->status === 'rejected' && $seller->last_apply_at) {
            $hoursSinceRejection = abs(now()->diffInHours($seller->last_apply_at));
            // Jika selisih jam kurang dari 24, maka masih dalam masa cooldown
            $cooldownDaysLeft = $hoursSinceRejection < 24 ? 1 : 0;
        }

        return $this->success([
            'has_applied' => true,
            'status' => $seller->status,
            'alasan_tolak' => $seller->alasan_tolak,
            'last_apply_at' => $seller->last_apply_at,
            'apply_count' => $seller->apply_count,
            'max_applies' => 3,
            'cooldown_days_left' => $cooldownDaysLeft,
            'rejection_history' => $seller->rejectionLogs->map(fn($log) => [
                'alasan' => $log->alasan,
                'rejected_by' => $log->rejectedBy?->name,
                'rejected_at' => $log->rejected_at?->toISOString(),
            ])->values()->toArray(),
        ]);
    }

    public function appeal(Request $request)
    {
        $request->validate(['alasan' => 'required|string|max:1000']);

        $user = $request->user();
        $seller = SellerProfile::where('user_id', $user->id)->first();

        if (!$seller || $seller->apply_count < 3) {
            return $this->error('Anda belum mencapai batas pengajuan.', 400);
        }

        try {
            $this->sellerService->addAppeal($seller, $request->alasan);
            return $this->success(null, 'Banding Anda telah dikirim. Admin akan meninjaunya.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function appealStatus(Request $request)
    {
        $user = $request->user();
        $seller = SellerProfile::where('user_id', $user->id)->first();

        if (!$seller) {
            return $this->success(null);
        }

        $latestAppeal = $seller->appeals()->latest()->first();

        if (!$latestAppeal) {
            return $this->success(null);
        }

        return $this->success([
            'id' => $latestAppeal->id,
            'status' => $latestAppeal->status,
            'alasan' => $latestAppeal->alasan,
            'created_at' => $latestAppeal->created_at,
        ]);
    }

    public function destroy(Property $property)
    {
        $this->authorize('delete', $property);

        $this->propertyService->delete($property);
        return $this->success(null, 'Properti berhasil dihapus.');
    }

    public function submit(Property $property)
    {
        $this->authorize('submit', $property);

        try {
            $this->propertyService->submit($property);
            return $this->success(null, 'Properti berhasil diajukan untuk moderasi.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function initiatePayment(Property $property, PaymentService $paymentService)
    {
        $seller = request()->user()->sellerProfile;
        if ($property->seller_id !== $seller->id) {
            return $this->error('Properti tidak ditemukan.', 404);
        }

        if ($property->status !== 'approved') {
            return $this->error('Hanya properti yang sudah disetujui yang bisa dibayar.', 400);
        }

        try {
            $snapToken = $paymentService->createTransaction($property);
            return $this->success([
                'snap_token' => $snapToken,
            ], 'Transaksi berhasil dibuat.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /**
     * Publish properti setelah pembayaran sukses (dipanggil dari frontend).
     */
    public function publishProperty(Property $property, PaymentService $paymentService)
    {
        $seller = request()->user()->sellerProfile;

        // 1. Pastikan properti milik seller yang sedang login
        if ($property->seller_id !== $seller->id) {
            return $this->error('Properti tidak ditemukan.', 404);
        }

        // 2. Jika webhook sudah mem-publish properti lebih dulu, endpoint ini tetap sukses.
        if ($property->status === 'published') {
            return $this->success(null, 'Properti sudah aktif.');
        }

        // 3. Pastikan properti dalam status approved
        if ($property->status !== 'approved') {
            return $this->error('Properti belum siap dipublikasikan.', 400);
        }

        // 4. Pastikan ada transaksi pembayaran yang SUKSES untuk properti ini.
        $transaction = Transaction::where('property_id', $property->id)
            ->where('user_id', request()->user()->id)
            ->where('status', 'paid')
            ->first();

        if (!$transaction) {
            $latestTransaction = Transaction::where('property_id', $property->id)
                ->where('user_id', request()->user()->id)
                ->latest()
                ->first();

            if ($latestTransaction) {
                $latestTransaction = $paymentService->syncTransactionStatus($latestTransaction);
            }

            if (!$latestTransaction || $latestTransaction->status !== 'paid') {
                return $this->success(null, 'Pembayaran sedang diverifikasi. Properti akan aktif otomatis setelah notifikasi pembayaran diterima.', 202);
            }
        }

        // 5. Publikasikan properti
        $this->propertyService->publish($property);

        return $this->success(null, 'Properti berhasil dipublikasikan.');
    }
}
