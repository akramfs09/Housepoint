<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('seller_profiles')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 15, 2);
            $table->enum('type', ['rumah', 'apartemen', 'ruko', 'tanah', 'gedung']);
            $table->text('address');
            $table->string('city', 100);
            $table->string('province', 100);
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->integer('land_area')->nullable();
            $table->integer('building_area')->nullable();
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            $table->text('alasan_tolak')->nullable();
            $table->string('image_main')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('lock_version')->default(1);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'city', 'type', 'price', 'published_at'], 'idx_catalog');
            $table->index(['price', 'status'], 'idx_price_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};