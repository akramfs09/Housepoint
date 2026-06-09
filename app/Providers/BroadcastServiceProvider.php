<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Mengaktifkan route broadcasting dengan middleware Sanctum
        Broadcast::routes(['middleware' => ['auth:sanctum']]);

        // Memuat definisi channel dari routes/channels.php
        require base_path('routes/channels.php');
    }
}