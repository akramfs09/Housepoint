<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Rate limiter untuk register (30x per email per menit - testing)
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(30)->by($request->input('email'));
        });

        // Rate limiter untuk login (30x per email per menit - testing)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(30)->by($request->input('email'));
        });

        // Rate limiter untuk forgot password (30x per email per menit - testing)
        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perMinute(30)->by($request->input('email'));
        });

        // Rate limiter untuk resend OTP (30x per email per menit - testing)
        RateLimiter::for('resend-otp', function (Request $request) {
            return Limit::perMinute(30)->by($request->input('email'));
        });

        // Rate limiter untuk verify OTP (30x per IP per menit - testing)
        RateLimiter::for('verify-otp', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // Rate limiter untuk reset password (30x per IP per menit - testing)
        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });
    }
}