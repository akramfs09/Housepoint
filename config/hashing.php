<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Hash Driver
    |--------------------------------------------------------------------------
    |
    | Driver hashing yang digunakan untuk password user.
    | HousePoint menggunakan Argon2id untuk keamanan maksimal.
    |
    */

    'driver' => env('HASH_DRIVER', 'argon2id'),

    /*
    |--------------------------------------------------------------------------
    | Argon2id Options
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk algoritma Argon2id.
    | Parameter ini sudah diatur sesuai standar keamanan tinggi:
    |   - memory: 65536 KiB (64 MB)
    |   - threads: 1
    |   - time: 4 (iterasi)
    |
    */

    'argon2id' => [
        'memory' => env('ARGON_MEMORY', 65536),
        'threads' => env('ARGON_THREADS', 1),
        'time' => env('ARGON_TIME', 4),
        'verify' => env('HASH_VERIFY', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rehash On Login
    |--------------------------------------------------------------------------
    |
    | Jika diaktifkan, Laravel akan otomatis me-rehash password user
    | saat login jika parameter hashing sudah berubah.
    |
    */

    'rehash_on_login' => true,

];