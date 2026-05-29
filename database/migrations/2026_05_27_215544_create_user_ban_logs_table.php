<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_ban_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('alasan')->nullable();
            $table->foreignId('banned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('banned_at')->useCurrent();
            $table->foreignId('unbanned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('unbanned_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_ban_logs');
    }
};