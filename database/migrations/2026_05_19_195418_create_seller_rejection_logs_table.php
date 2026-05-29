<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_rejection_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_profile_id')->constrained('seller_profiles')->onDelete('cascade');
            $table->text('alasan');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_rejection_logs');
    }
};