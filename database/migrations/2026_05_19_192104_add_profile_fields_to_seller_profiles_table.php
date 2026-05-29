<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->string('nama_lengkap')->after('user_id')->nullable();
            $table->string('no_hp')->after('nama_lengkap')->nullable();
            $table->text('alamat')->after('no_hp')->nullable();
            $table->string('foto_profil')->after('selfie_path')->nullable();
            $table->text('deskripsi')->after('foto_profil')->nullable();
            $table->boolean('syarat_ketentuan')->default(false)->after('deskripsi');
        });
    }

    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'nama_lengkap',
                'no_hp',
                'alamat',
                'foto_profil',
                'deskripsi',
                'syarat_ketentuan',
            ]);
        });
    }
};