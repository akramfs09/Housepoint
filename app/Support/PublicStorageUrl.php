<?php

namespace App\Support;

use Illuminate\Support\Str;

class PublicStorageUrl
{
    public static function make(?string $path, string $disk = 'r2_public'): ?string
    {
        if (! $path) {
            return null;
        }

        // Jika sudah berupa URL lengkap, langsung kembalikan
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        // Gunakan route proxy Laravel agar file dapat diakses tanpa tergantung konfigurasi publik R2
        return url('/storage/public/' . ltrim($path, '/'));
    }
}