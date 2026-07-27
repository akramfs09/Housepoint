<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = $request->user()->notifications()->latest();

        // Filter hanya yang belum dibaca
        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        // Filter berdasarkan tipe notifikasi (mendukung array)
        if ($types = $request->get('type')) {
            if (is_array($types)) {
                $query->whereIn('data->type', $types);
            } else {
                $query->where('data->type', $types);
            }
        }

        if ($excludedTypes = $request->get('exclude_type')) {
            if (is_array($excludedTypes)) {
                $query->whereNotIn('data->type', $excludedTypes);
            } else {
                $query->where('data->type', '!=', $excludedTypes);
            }
        }

        $notifications = $query->paginate($request->per_page ?? 15);

        return $this->success($notifications);
    }

    public function markAsRead($id)
    {
        $notification = request()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $this->success(null, 'Notifikasi ditandai sudah dibaca.');
    }

    public function markAllAsRead()
    {
        request()->user()->unreadNotifications->markAsRead();

        return $this->success(null, 'Semua notifikasi ditandai sudah dibaca.');
    }

    public function unreadCount()
    {
        return response()->json([
            'success' => true,
            'count' => request()->user()->unreadNotifications()->count(),
        ]);
    }

    public function destroy($id)
    {
        $notification = request()->user()->notifications()->findOrFail($id);
        $notification->delete();

        return $this->success(null, 'Notifikasi berhasil dihapus.');
    }

    public function destroyBatch(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'string',
        ]);

        request()->user()->notifications()->whereIn('id', $request->ids)->delete();

        return $this->success(null, 'Notifikasi terpilih berhasil dihapus.');
    }

    public function destroyAll()
    {
        request()->user()->notifications()->delete();

        return $this->success(null, 'Semua notifikasi berhasil dihapus.');
    }
}
