<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->enum('status_jual', ['dijual', 'terjual'])->default('dijual')->after('status');
            $table->smallInteger('tahun_dibangun')->nullable()->after('building_area');
            $table->tinyInteger('garasi')->nullable()->after('bathrooms');
            $table->tinyInteger('jumlah_lantai')->nullable()->after('garasi');
            $table->enum('sumber_air', ['pdam', 'sumur_bor', 'sumur_gali'])->nullable()->after('jumlah_lantai');
            $table->json('fasilitas')->nullable()->after('sumber_air');
            $table->string('video_path', 255)->nullable()->after('fasilitas');
            $table->enum('video_type', ['upload', 'youtube'])->nullable()->after('video_path');
            $table->string('youtube_url', 255)->nullable()->after('video_type');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'status_jual',
                'tahun_dibangun',
                'garasi',
                'jumlah_lantai',
                'sumber_air',
                'fasilitas',
                'video_path',
                'video_type',
                'youtube_url',
            ]);
        });
    }
};