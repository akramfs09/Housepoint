<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role'            => \App\Http\Middleware\CheckRole::class,
            'banned'          => \App\Http\Middleware\CheckBanned::class,
            'approved_seller' => \App\Http\Middleware\ApprovedSeller::class,
        ]);
    })
    ->withSchedule(function ($schedule): void {
        // Hapus OTP yang sudah expired setiap 5 menit
        $schedule->call(function () {
            \App\Models\Otp::where('expires_at', '<', now())->delete();
        })->everyFiveMinutes();

        // Hapus OTP yang sudah digunakan atau expired lebih dari 24 jam
        $schedule->call(function () {
            \App\Models\Otp::where(function ($query) {
                $query->whereNotNull('used_at')
                      ->where('used_at', '<', now()->subHours(24));
            })->orWhere('expires_at', '<', now()->subHours(24))->delete();
        })->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
