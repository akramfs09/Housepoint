<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('payment_type', 50);
            $table->string('payment_label', 100);
            $table->string('order_id')->unique();
            $table->decimal('amount', 15, 2);
            $table->string('status')->default('pending');
            $table->string('gateway_status')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('seller_name')->nullable();
            $table->string('property_title')->nullable();
            $table->string('property_slug')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['payment_type', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['property_id', 'created_at']);
        });

        if (!Schema::hasTable('transactions') || !Schema::hasTable('featured_listings')) {
            return;
        }

        $transactions = DB::table('transactions')
            ->leftJoin('properties', 'transactions.property_id', '=', 'properties.id')
            ->leftJoin('users', 'transactions.user_id', '=', 'users.id')
            ->select([
                'transactions.id',
                'transactions.property_id',
                'transactions.user_id',
                'transactions.order_id',
                'transactions.amount',
                'transactions.status',
                'transactions.payment_method',
                'transactions.gateway_reference',
                'transactions.paid_at',
                'transactions.created_at',
                'transactions.updated_at',
                'properties.title as property_title',
                'properties.slug as property_slug',
                'users.name as customer_name',
                'users.email as customer_email',
            ])
            ->orderBy('transactions.id')
            ->get();

        foreach ($transactions as $transaction) {
            DB::table('payment_histories')->insert([
                'property_id' => $transaction->property_id,
                'user_id' => $transaction->user_id,
                'payment_type' => 'property_upload',
                'payment_label' => 'Upload Properti',
                'order_id' => $transaction->order_id,
                'amount' => $transaction->amount,
                'status' => $transaction->status ?? 'pending',
                'gateway_status' => $transaction->status ?? 'pending',
                'payment_method' => $transaction->payment_method,
                'gateway_reference' => $transaction->gateway_reference,
                'customer_name' => $transaction->customer_name,
                'customer_email' => $transaction->customer_email,
                'seller_name' => $transaction->customer_name,
                'property_title' => $transaction->property_title,
                'property_slug' => $transaction->property_slug,
                'raw_payload' => json_encode(['source' => 'transactions']),
                'paid_at' => $transaction->paid_at,
                'created_at' => $transaction->created_at,
                'updated_at' => $transaction->updated_at,
            ]);
        }

        $featuredListings = DB::table('featured_listings')
            ->leftJoin('properties', 'featured_listings.property_id', '=', 'properties.id')
            ->leftJoin('users', 'featured_listings.user_id', '=', 'users.id')
            ->select([
                'featured_listings.id',
                'featured_listings.property_id',
                'featured_listings.user_id',
                'featured_listings.order_id',
                'featured_listings.amount',
                'featured_listings.status',
                'featured_listings.queued_at',
                'featured_listings.started_at',
                'featured_listings.expires_at',
                'featured_listings.created_at',
                'featured_listings.updated_at',
                'properties.title as property_title',
                'properties.slug as property_slug',
                'users.name as customer_name',
                'users.email as customer_email',
            ])
            ->orderBy('featured_listings.id')
            ->get();

        foreach ($featuredListings as $featured) {
            DB::table('payment_histories')->insert([
                'property_id' => $featured->property_id,
                'user_id' => $featured->user_id,
                'payment_type' => 'featured_listing',
                'payment_label' => 'Unggulan',
                'order_id' => $featured->order_id,
                'amount' => $featured->amount,
                'status' => $featured->status ?? 'pending',
                'gateway_status' => $featured->status ?? 'pending',
                'payment_method' => null,
                'gateway_reference' => null,
                'customer_name' => $featured->customer_name,
                'customer_email' => $featured->customer_email,
                'seller_name' => $featured->customer_name,
                'property_title' => $featured->property_title,
                'property_slug' => $featured->property_slug,
                'raw_payload' => json_encode(['source' => 'featured_listings']),
                'paid_at' => $featured->queued_at ?? $featured->updated_at,
                'created_at' => $featured->created_at,
                'updated_at' => $featured->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_histories');
    }
};
