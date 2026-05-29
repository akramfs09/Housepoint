<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApprovedSeller
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !$user->sellerProfile || $user->sellerProfile->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Akun penjual Anda belum disetujui.',
            ], 403);
        }

        return $next($request);
    }
}