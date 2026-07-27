<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Conversation;
use App\Policies\ConversationPolicy;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Rate limiter untuk register (3x per IP per 15 menit)
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinutes(15, 3)->by($request->ip());
        });

        // Rate limiter untuk login (5x per email per menit - Proteksi Brute Force)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->input('email'));
        });

        // Rate limiter untuk forgot password (3x per email per 15 menit)
        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perMinutes(15, 3)->by($request->input('email'));
        });

        // Rate limiter untuk resend OTP (3x per email per 10 menit)
        RateLimiter::for('resend-otp', function (Request $request) {
            return Limit::perMinutes(10, 3)->by($request->input('email'));
        });

        // Rate limiter untuk verify OTP (5x per IP per 10 menit)
        RateLimiter::for('verify-otp', function (Request $request) {
            return Limit::perMinutes(10, 5)->by($request->ip());
        });

        // Rate limiter untuk reset password (5x per IP per 15 menit)
        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinutes(15, 5)->by($request->ip());
        });

        // 🔐 Registrasi Policy untuk Chat
        Gate::policy(Conversation::class, ConversationPolicy::class);
    }
}