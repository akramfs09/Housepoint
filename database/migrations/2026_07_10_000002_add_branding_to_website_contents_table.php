<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('website_contents', function (Blueprint $table) {
            $table->json('branding')->nullable()->after('contact');
        });
    }

    public function down(): void
    {
        Schema::table('website_contents', function (Blueprint $table) {
            $table->dropColumn('branding');
        });
    }
};
