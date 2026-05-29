<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otps', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('token', 255);
            $table->enum('purpose', ['register', 'reset_password']);
            $table->timestamp('expires_at');
            $table->tinyInteger('attempts')->default(0);
            $table->text('register_data')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['email', 'purpose'], 'idx_email_purpose');
            $table->index(['purpose', 'expires_at'], 'idx_purpose_expires');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otps');
    }
};