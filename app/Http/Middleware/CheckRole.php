<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user || !$user->role) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak.',
            ], 403);
        }

        if (!in_array($user->role->nama_role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin.',
            ], 403);
        }

        return $next($request);
    }
}