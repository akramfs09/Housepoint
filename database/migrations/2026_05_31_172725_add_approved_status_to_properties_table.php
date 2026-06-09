<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE properties MODIFY status ENUM('draft', 'pending', 'approved', 'published', 'rejected') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE properties MODIFY status ENUM('draft', 'pending', 'published', 'rejected') NOT NULL DEFAULT 'draft'");
    }
};