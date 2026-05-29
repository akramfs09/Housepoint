<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('ktp_path');
            $table->string('selfie_path');
            $table->boolean('no_hp_verified')->default(false);
            $table->string('rekening')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('alasan_tolak')->nullable();
            $table->timestamp('last_apply_at')->nullable();
            $table->integer('apply_count')->default(0);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status', 'idx_seller_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_profiles');
    }
};