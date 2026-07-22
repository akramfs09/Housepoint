<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_report_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('message');
            $table->boolean('is_internal')->default(false);
            $table->timestamps();

            $table->index(['user_report_id', 'created_at'], 'idx_report_messages_thread');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_report_messages');
    }
};
