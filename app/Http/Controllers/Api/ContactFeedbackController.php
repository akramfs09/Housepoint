<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\UserReport;
use App\Models\UserReportMessage;
use App\Models\WebsiteReview;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactFeedbackController extends Controller
{
    use ApiResponse;

    private const REPORT_CATEGORIES = [
        'property',
        'seller',
        'chat',
        'payment',
        'bug',
        'other',
    ];

    private const REPORT_STATUSES = ['pending', 'reviewed', 'resolved', 'rejected'];
    private const REVIEW_STATUSES = ['pending', 'approved', 'hidden'];

    public function storeReport(Request $request)
    {
        $activeReport = $request->user()
            ->reports()
            ->active()
            ->latest()
            ->first();

        if ($activeReport) {
            return $this->error(
                'Laporan sebelumnya masih diproses. Anda dapat membuat laporan baru setelah laporan tersebut selesai atau ditolak.',
                409,
                ['active_report' => $this->reportPayload($activeReport->load('user'))]
            );
        }

        $validated = $request->validate([
            'category' => ['required', Rule::in(self::REPORT_CATEGORIES)],
            'subject' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:3000'],
        ]);

        $report = $request->user()->reports()->create($validated);

        return $this->success($this->reportPayload($report->load('user')), 'Laporan berhasil dikirim.', 201);
    }

    public function myReports(Request $request)
    {
        $reports = $request->user()
            ->reports()
            ->with(['messages.sender.role', 'user'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (UserReport $report) => $this->reportPayload($report, $request->user()));

        return $this->success([
            'active_report' => $reports->first(fn ($report) => in_array($report['status'], UserReport::ACTIVE_STATUSES, true)),
            'reports' => $reports->values(),
        ]);
    }

    public function myReview(Request $request)
    {
        $review = $request->user()->websiteReview()->with('user')->first();

        return $this->success($review ? $this->reviewPayload($review) : null);
    }

    public function publicReviews(Request $request)
    {
        $query = WebsiteReview::with(['user.customerProfile', 'user.sellerProfile'])
            ->where('status', 'approved');

        if ($request->filled('rating')) {
            $query->where('rating', $request->integer('rating'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to'));
        }

        $sort = $request->input('sort', 'newest');
        $sort === 'oldest' ? $query->oldest() : $query->latest();

        return $this->success(
            $query->paginate($request->integer('per_page', 9))
                ->through(fn (WebsiteReview $review) => $this->reviewPayload($review))
        );
    }

    public function featuredReviews()
    {
        $reviews = WebsiteReview::with(['user.customerProfile', 'user.sellerProfile'])
            ->where('status', 'approved')
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn (WebsiteReview $review) => $this->reviewPayload($review));

        return $this->success($reviews);
    }

    public function upsertReview(Request $request)
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['required', 'string', 'max:1500'],
            'show_name' => ['nullable', 'boolean'],
        ]);

        $review = WebsiteReview::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'rating' => $validated['rating'],
                'review' => $validated['review'],
                'show_name' => $request->boolean('show_name', true),
                'status' => 'approved',
                'admin_note' => null,
                'reviewed_by' => null,
                'reviewed_at' => now(),
            ]
        );

        return $this->success($this->reviewPayload($review->load('user')), 'Ulasan berhasil disimpan.');
    }

    public function destroyReview(Request $request)
    {
        $review = $request->user()->websiteReview()->first();

        if (!$review) {
            return $this->error('Ulasan tidak ditemukan.', 404);
        }

        $review->delete();

        return $this->success(null, 'Ulasan berhasil dihapus.');
    }

    public function adminReports(Request $request)
    {
        $query = UserReport::with(['user.customerProfile', 'user.sellerProfile', 'messages.sender.role', 'messages.sender.customerProfile', 'messages.sender.sellerProfile'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return $this->success($query->paginate($request->integer('per_page', 10)));
    }

    public function updateReport(Request $request, UserReport $report)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::REPORT_STATUSES)],
            'admin_note' => ['nullable', 'string', 'max:1500'],
        ]);

        $report->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return $this->success($this->reportPayload($report->load('user')), 'Laporan berhasil diperbarui.');
    }

    public function reportMessages(Request $request, UserReport $report)
    {
        if (!$this->canAccessReport($request->user(), $report)) {
            return $this->error('Anda tidak memiliki akses ke laporan ini.', 403);
        }

        $isAdmin = $this->isAdmin($request->user());
        $messages = $report->messages()
            ->with('sender.role')
            ->when(!$isAdmin, fn ($query) => $query->where('is_internal', false))
            ->oldest()
            ->get()
            ->map(fn (UserReportMessage $message) => $this->messagePayload($message, $request->user()));

        return $this->success($messages);
    }

    public function sendReportMessage(Request $request, UserReport $report)
    {
        if (!$this->canAccessReport($request->user(), $report)) {
            return $this->error('Anda tidak memiliki akses ke laporan ini.', 403);
        }

        if (!in_array($report->status, UserReport::ACTIVE_STATUSES, true)) {
            return $this->error('Thread laporan sudah ditutup.', 422);
        }

        $isAdmin = $this->isAdmin($request->user());
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        $message = $report->messages()->create([
            'sender_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_internal' => $isAdmin && $request->boolean('is_internal'),
        ]);

        if ($isAdmin) {
            $report->update([
                'status' => 'reviewed',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        }

        return $this->success(
            $this->messagePayload($message->load('sender.role'), $request->user()),
            'Pesan laporan berhasil dikirim.',
            201
        );
    }

    public function adminReviews(Request $request)
    {
        $query = WebsiteReview::with(['user.customerProfile', 'user.sellerProfile'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate($request->integer('per_page', 10)));
    }

    public function updateReview(Request $request, WebsiteReview $review)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::REVIEW_STATUSES)],
            'admin_note' => ['nullable', 'string', 'max:1500'],
        ]);

        $review->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return $this->success($this->reviewPayload($review->load('user')), 'Ulasan berhasil diperbarui.');
    }

    private function reportPayload(UserReport $report, ?User $viewer = null): array
    {
        $isAdmin = $viewer ? $this->isAdmin($viewer) : false;
        $messages = $report->relationLoaded('messages')
            ? $report->messages
                ->when(!$isAdmin, fn ($collection) => $collection->where('is_internal', false))
                ->sortBy('created_at')
                ->values()
                ->map(fn (UserReportMessage $message) => $this->messagePayload($message, $viewer))
            : null;

        return [
            'id' => $report->id,
            'category' => $report->category,
            'subject' => $report->subject,
            'description' => $report->description,
            'status' => $report->status,
            'admin_note' => $report->admin_note,
            'messages_count' => $messages?->count() ?? $report->messages_count ?? 0,
            'messages' => $messages,
            'created_at' => $report->created_at,
            'reviewed_at' => $report->reviewed_at,
            'user' => $report->user ? [
                'id' => $report->user->id,
                'name' => $report->user->name,
                'email' => $report->user->email,
                'avatar_url' => $report->user->avatar_url,
            ] : null,
        ];
    }

    private function messagePayload(UserReportMessage $message, ?User $viewer = null): array
    {
        $roleName = $message->sender?->role?->nama_role;

        return [
            'id' => $message->id,
            'message' => $message->message,
            'is_internal' => $message->is_internal,
            'created_at' => $message->created_at,
            'is_mine' => $viewer && $message->sender_id === $viewer->id,
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'role' => $roleName,
                'label' => in_array($roleName, ['admin', 'super_admin'], true) ? 'Admin HousePoint' : 'Pengguna',
                'avatar_url' => $message->sender->avatar_url,
            ] : null,
        ];
    }

    private function canAccessReport(User $user, UserReport $report): bool
    {
        return $report->user_id === $user->id || $this->isAdmin($user);
    }

    private function isAdmin(User $user): bool
    {
        return in_array($user->role?->nama_role, ['admin', 'super_admin'], true);
    }

    private function reviewPayload(WebsiteReview $review): array
    {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'review' => $review->review,
            'show_name' => $review->show_name,
            'status' => $review->status,
            'admin_note' => $review->admin_note,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
            'reviewed_at' => $review->reviewed_at,
            'user' => $review->user ? [
                'id' => $review->user->id,
                'name' => $review->show_name ? $review->user->name : 'Pengguna HousePoint',
                'email' => $review->user->email,
                'avatar_url' => $review->show_name ? $review->user->avatar_url : null,
            ] : null,
        ];
    }
}
