<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Http\Resources\AdminResource;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Services\AdminManagementService;
use Illuminate\Http\Request;

class AdminManagementController extends Controller
{
    use ApiResponse;

    private AdminManagementService $service;

    public function __construct(AdminManagementService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $admins = $this->service->listAdmins($request->only(['search', 'role', 'status', 'per_page']));
        return AdminResource::collection($admins);
    }

    public function show(User $admin)
    {
        return $this->success(new AdminResource($admin->load('adminProfile')));
    }

    public function store(InviteAdminRequest $request)
    {
        try {
            $admin = $this->service->inviteAdmin($request->validated(), $request->user());
            return $this->success(new AdminResource($admin), 'Admin berhasil diundang.', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function update(UpdateAdminRequest $request, User $admin)
    {
        try {
            $updated = $this->service->updateAdmin($admin, $request->validated(), $request->user());
            return $this->success(new AdminResource($updated), 'Admin berhasil diperbarui.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function deactivate(Request $request, User $admin)
    {
        $request->validate(['alasan' => 'required|string|max:500']);

        try {
            $deactivated = $this->service->deactivateAdmin($admin, $request->alasan, $request->user());
            return $this->success(new AdminResource($deactivated), 'Admin berhasil dinonaktifkan.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    public function reactivate(Request $request, User $admin)
    {
        try {
            $reactivated = $this->service->reactivateAdmin($admin, $request->user());
            return $this->success(new AdminResource($reactivated), 'Admin berhasil diaktifkan kembali.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function destroy(Request $request, User $admin)
    {
        try {
            $this->service->deleteAdmin($admin, $request->user());
            return $this->success(null, 'Admin berhasil dihapus.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    public function auditLogs(Request $request)
    {
        $logs = $this->service->getAuditLogs($request->only(['per_page']));
        return $this->success($logs);
    }
}