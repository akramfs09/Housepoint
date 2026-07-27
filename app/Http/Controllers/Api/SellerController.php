<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyRequest;
use App\Http\Requests\SellerRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\SellerResource;
use App\Http\Traits\ApiResponse;
use App\Models\FeaturedListing;
use App\Models\Property;
use App\Services\PropertyService;
use App\Services\SellerService;
use App\Models\PropertyView;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Models\SellerProfile;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\FeaturedListingService;
use App\Services\PaymentService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Notifications\NewSellerApplication;
use App\Notifications\NewPropertySubmission;
use App\Notifications\NewAppealNotification;
use App\Notifications\PaymentSuccessNotification;

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

            // Kirim notifikasi ke semua admin
            $admins = User::whereHas('role', fn($q) => $q->whereIn('nama_role', ['admin', 'super_admin']))->get();
            foreach ($admins as $admin) {
                $admin->notify(new NewSellerApplication($seller));
            }

            return $this->success(new SellerResource($seller), 'Pengajuan seller berhasil dikirim.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function myProperties(Request $request)
    {
        $seller = $request->user()->sellerProfile;
        $query = Property::where('seller_id', $seller->id)
            ->with(['images', 'sellerProfile.user', 'currentFeaturedListing']);

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

    public function show(Property $property)
    {
        $this->authorize('update', $property);

        return $this->success(new PropertyResource($property->load(['images', 'sellerProfile.user', 'currentFeaturedListing'])));
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
            $appeal = $this->sellerService->addAppeal($seller, $request->alasan);

            // Kirim notifikasi ke semua admin
            $admins = User::whereHas('role', fn($q) => $q->whereIn('nama_role', ['admin', 'super_admin']))->get();
            foreach ($admins as $admin) {
                $admin->notify(new NewAppealNotification($appeal));
            }

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

    public function toggleStatusJual(Request $request, Property $property)
    {
        $seller = $request->user()->sellerProfile;
        if (!$seller || $property->seller_id !== $seller->id) {
            return $this->error('Anda tidak memiliki akses ke properti ini.', 403);
        }

        if ($property->status !== 'published') {
            return $this->error('Hanya properti yang dipublikasikan yang dapat diubah status jualnya.', 400);
        }

        $newStatusJual = $property->status_jual === 'terjual' ? 'dijual' : 'terjual';
        $property->update(['status_jual' => $newStatusJual]);

        $statusText = $newStatusJual === 'terjual' ? 'TERJUAL' : 'DIJUAL';
        return $this->success(new PropertyResource($property), "Status properti berhasil diubah menjadi {$statusText}.");
    }

    public function submit(Property $property)
    {
        $this->authorize('submit', $property);

        try {
            $this->propertyService->submit($property);

            // Kirim notifikasi ke semua admin
            $admins = User::whereHas('role', fn($q) => $q->whereIn('nama_role', ['admin', 'super_admin']))->get();
            foreach ($admins as $admin) {
                $admin->notify(new NewPropertySubmission($property));
            }

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

        // Kirim notifikasi ke seller
        $this->notifyPaymentSuccess($seller, $property, 'property_upload');

        return $this->success(null, 'Properti berhasil dipublikasikan.');
    }

    /**
     * Estimasi waktu tunggu antrian unggulan.
     */
    public function featuredQueueEta()
    {
        $seller = request()->user()->sellerProfile;
        if (!$seller) return $this->error('Profil seller tidak ditemukan.', 404);

        $activeCount = FeaturedListing::where('status', 'active')
            ->where('started_at', '<=', now())
            ->where('expires_at', '>', now())
            ->count();

        $slotsAvailable = max(0, 8 - $activeCount);
        $queuePosition = FeaturedListing::where('status', 'paid')
            ->where('queued_at', '<=', now())
            ->count() + 1; // posisi jika mendaftar sekarang

        // Estimasi: rata-rata 1 slot kosong per hari (bisa disesuaikan)
        $avgSlotsPerDay = $slotsAvailable > 0 ? $slotsAvailable : 1;
        $etaDays = (int) ceil($queuePosition / $avgSlotsPerDay);
        $estimatedDate = now()->addDays($etaDays)->format('Y-m-d');

        return $this->success([
            'position'      => $queuePosition,
            'eta_days'      => $etaDays,
            'estimated_date'=> $estimatedDate,
            'duration_days'  => 7,
            'price'          => (int) config('housepoint.featured_price', 50000),
            'slots'          => 8,
        ]);
    }

    /**
     * Inisiasi pembayaran untuk upgrade ke Unggulan.
     */
    public function initiateFeaturedPayment(Property $property, PaymentService $paymentService)
    {
        $user = request()->user();
        if ($property->seller_id !== $user->sellerProfile?->id) {
            return $this->error('Properti tidak ditemukan.', 404);
        }

        if ($property->status !== 'published') {
            return $this->error('Hanya properti aktif yang bisa diupgrade.', 400);
        }

        FeaturedListing::where('property_id', $property->id)
            ->where('status', 'active')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'completed']);

        FeaturedListing::where('property_id', $property->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(15))
            ->update(['status' => 'cancelled']);

        $pendingFeatured = FeaturedListing::where('property_id', $property->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($pendingFeatured) {
            $pendingFeatured = $paymentService->syncFeaturedListingStatus($pendingFeatured);

            if ($pendingFeatured->status === 'pending') {
                $pendingFeatured->update(['status' => 'cancelled']);
            }
        }

        // Cek apakah sudah ada antrian aktif atau pending
        $existing = FeaturedListing::where('property_id', $property->id)
            ->whereIn('status', ['pending', 'paid', 'active'])
            ->first();

        if ($existing?->status === 'pending') {
            $existing = $paymentService->syncFeaturedListingStatus($existing);
        }

        if ($existing && in_array($existing->status, ['pending', 'paid', 'active'], true)) {
            return $this->error('Properti sudah terdaftar atau sedang dalam antrian unggulan.', 400);
        }

        try {
            $snapToken = $paymentService->createFeaturedTransaction($property);
            return $this->success([
                'snap_token' => $snapToken,
                'price' => (int) config('housepoint.featured_price', 50000),
            ], 'Transaksi berhasil dibuat.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /**
     * Verifikasi pembayaran dan masukkan ke antrian unggulan.
     */
    public function publishFeatured(Property $property, PaymentService $paymentService)
    {
        $user = request()->user();
        $seller = $user->sellerProfile;

        if ($property->seller_id !== $seller?->id) {
            return $this->error('Properti tidak ditemukan.', 404);
        }

        $featured = FeaturedListing::where('property_id', $property->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$featured) {
            // Coba sinkronisasi status dari Midtrans
            $latest = FeaturedListing::where('property_id', $property->id)
                ->where('user_id', $user->id)
                ->latest()
                ->first();
            if ($latest && $latest->status === 'pending') {
                $latest = $paymentService->syncFeaturedListingStatus($latest);
                if ($latest && $latest->status === 'paid') {
                    $this->notifyPaymentSuccess($seller, $property, 'featured_listing');
                    app(FeaturedListingService::class)->syncSlots();

                    return $this->success(null, 'Pembayaran terverifikasi, properti masuk antrian.');
                }
            }

            if ($latest && $latest->status === 'paid') {
                $this->notifyPaymentSuccess($seller, $property, 'featured_listing');
                app(FeaturedListingService::class)->syncSlots();

                return $this->success(null, 'Pembayaran berhasil, properti masuk antrian unggulan.');
            }

            return $this->error('Transaksi tidak ditemukan atau sudah diproses.', 404);
        }

        $featured = $paymentService->syncFeaturedListingStatus($featured);
        if ($featured->status === 'paid') {
            $this->notifyPaymentSuccess($seller, $property, 'featured_listing');
            app(FeaturedListingService::class)->syncSlots();

            return $this->success(null, 'Pembayaran berhasil, properti masuk antrian unggulan.');
        }

        return $this->success(null, 'Pembayaran sedang diverifikasi. Properti akan masuk antrian setelah konfirmasi.', 202);
    }

    public function cancelFeaturedPayment(Property $property, PaymentService $paymentService)
    {
        $user = request()->user();
        $seller = $user->sellerProfile;

        if ($property->seller_id !== $seller?->id) {
            return $this->error('Properti tidak ditemukan.', 404);
        }

        $featured = FeaturedListing::where('property_id', $property->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($featured) {
            $paymentService->cancelFeaturedListing($featured);
        }

        return $this->success(null, 'Pembayaran unggulan dibatalkan.');
    }

    public function dashboard(Request $request)
    {
        $seller = $request->user()->sellerProfile;
        if (!$seller) {
            return $this->error('Seller profile tidak ditemukan.', 404);
        }

        $propertyIds = $seller->properties()->pluck('id');

        // Baca parameter start_month dan end_month (format: YYYY-MM)
        $startMonth = $request->get('start_month');
        $endMonth   = $request->get('end_month', $startMonth);

        if (!$startMonth) {
            // Default: bulan ini
            $startDate = now()->startOfMonth();
            $endDate   = now()->endOfMonth();
        } else {
            $startDate = Carbon::createFromFormat('Y-m-d', $startMonth . '-01')->startOfMonth();
            $endDate   = Carbon::createFromFormat('Y-m-d', ($endMonth ?? $startMonth) . '-01')->endOfMonth();

            // Jaga agar start selalu sebelum end
            if ($startDate->gt($endDate)) {
                [$startDate, $endDate] = [$endDate, $startDate];
            }
        }

        // 1. KPI
        $activeProperties = $seller->properties()->where('status', 'published')->count();

        $totalViews = PropertyView::whereIn('property_id', $propertyIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $totalFavorites = DB::table('favorites')
            ->whereIn('property_id', $propertyIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $totalContacts = Conversation::whereIn('property_id', $propertyIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $kpi = [
            'active_properties' => $activeProperties,
            'total_views'       => $totalViews,
            'total_favorites'   => $totalFavorites,
            'total_contacts'    => $totalContacts,
        ];

        // 2. Grafik views harian
        $viewsChart = PropertyView::whereIn('property_id', $propertyIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => ['date' => $item->date, 'count' => (int) $item->count]);

        // 3. Favorit per minggu dalam rentang
        $favoritesWeekly = DB::table('favorites')
            ->whereIn('property_id', $propertyIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('YEAR(created_at) as year, WEEK(created_at) as week, MIN(DATE(created_at)) as week_start, count(*) as count')
            ->groupBy('year', 'week')
            ->orderBy('year')
            ->orderBy('week')
            ->get()
            ->map(function ($item) {
                $weekStart = Carbon::parse($item->week_start)->startOfWeek();
                $weekEnd = (clone $weekStart)->endOfWeek();
                return [
                    'week'  => $weekStart->format('d M') . ' - ' . $weekEnd->format('d M'),
                    'count' => (int) $item->count,
                ];
            });

        // 4. Performa listing (tetap kumulatif, tidak terpengaruh periode)
        $properties = $seller->properties()
            ->withCount(['favoritedByUsers', 'conversations'])
            ->orderByDesc('views_count')
            ->get()
            ->map(fn($p) => [
                'id'                   => $p->id,
                'title'                => $p->title,
                'city'                 => $p->city,
                'views_count'          => (int) $p->views_count,
                'favorites_count'      => $p->favorited_by_users_count,
                'contacts_count'       => $p->conversations_count,
                'status'               => $p->status,
                'status_jual'          => $p->status_jual,
            ]);

        return $this->success([
            'kpi'            => $kpi,
            'views_chart'    => $viewsChart,
            'favorites_chart'=> $favoritesWeekly,
            'properties'     => $properties,
        ]);
    }

    private function notifyPaymentSuccess(SellerProfile $seller, Property $property, string $paymentType): void
    {
        $alreadyNotified = $seller->user->notifications()
            ->where('type', PaymentSuccessNotification::class)
            ->where('data->type', 'payment_success')
            ->where('data->payment_type', $paymentType)
            ->where('data->property_id', $property->id)
            ->exists();

        if (!$alreadyNotified) {
            $seller->user->notify(new PaymentSuccessNotification($property, $paymentType));
        }
    }
}
