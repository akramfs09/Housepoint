<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckBanned
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user() && $request->user()->is_banned) {
            auth()->guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah diblokir.',
            ], 403);
        }

        return $next($request);
    }
}