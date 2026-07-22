<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('gmaps_url', 1000)->nullable()->after('address');
            $table->string('gmaps_query', 500)->nullable()->after('gmaps_url');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['gmaps_url', 'gmaps_query']);
        });
    }
};
