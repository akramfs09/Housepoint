<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->string('path');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['property_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_images');
    }
};