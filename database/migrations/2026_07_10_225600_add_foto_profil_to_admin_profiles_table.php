<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_profiles', 'foto_profil')) {
                $table->string('foto_profil')->nullable()->after('no_hp');
            }
        });
    }

    public function down(): void
    {
        Schema::table('admin_profiles', function (Blueprint $table) {
            $table->dropColumn(['foto_profil']);
        });
    }
};
