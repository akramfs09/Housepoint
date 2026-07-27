<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Route proxy untuk gambar publik (R2 atau disk lainnya)
Route::get('/storage/public/{path}', function ($path) {
    $disk = Storage::disk('r2_public');

    if (!$disk->exists($path)) {
        abort(404);
    }

    return response()->stream(function () use ($disk, $path) {
        $stream = $disk->readStream($path);
        fpassthru($stream);
        if (is_resource($stream)) {
            fclose($stream);
        }
    }, 200, [
        'Content-Type' => $disk->mimeType($path),
        'Content-Length' => $disk->size($path),
        'Cache-Control' => 'public, max-age=86400',
    ]);
})->where('path', '.*');

// Route khusus untuk API auth redirect (fallback)
Route::get('/login', function () {
    return view('welcome');
})->name('login');

// Tangkap SEMUA URL lainnya dan kembalikan view React
Route::get('/{any?}', function () {
    return view('welcome');   // atau 'app' jika kamu pakai app.blade.php
})->where('any', '.*');