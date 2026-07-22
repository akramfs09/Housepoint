<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE seller_profiles RENAME COLUMN nama_toko TO nama_agen');
        DB::statement('ALTER TABLE seller_profiles RENAME COLUMN foto_toko TO foto_agen');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE seller_profiles RENAME COLUMN nama_agen TO nama_toko');
        DB::statement('ALTER TABLE seller_profiles RENAME COLUMN foto_agen TO foto_toko');
    }
};
