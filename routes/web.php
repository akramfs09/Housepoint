<?php

use Illuminate\Support\Facades\Route;

// Route khusus untuk API auth redirect (fallback)
Route::get('/login', function () {
    return response()->json(['success' => false, 'message' => 'Unauthorized.'], 401);
})->name('login');

// Tangkap SEMUA URL lainnya dan kembalikan view React
Route::get('/{any?}', function () {
    return view('welcome');   // atau 'app' jika kamu pakai app.blade.php
})->where('any', '.*');