<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('search_text')->nullable();
            $table->json('filters')->nullable();
            $table->string('query_hash', 64);
            $table->unsignedInteger('result_count')->default(0);
            $table->unsignedInteger('search_count')->default(1);
            $table->timestamp('last_searched_at')->nullable()->index();
            $table->timestamps();

            $table->unique(['user_id', 'query_hash']);
            $table->index(['user_id', 'last_searched_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_histories');
    }
};