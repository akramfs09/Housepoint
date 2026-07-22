<?php

namespace App\Services;

use App\Models\FeaturedListing;
use App\Models\PaymentHistory;
use App\Models\Property;
use App\Models\Transaction;
use App\Notifications\PaymentSuccessNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    // -----------------------------------------------------------------
    //  Upload Properti (existing)
    // -----------------------------------------------------------------
    public function createTransaction(Property $property): string
    {
        $orderId = 'PROP-' . $property->id . '-' . time();
        $amount  = config('housepoint.upload_price');

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $amount,
            ],
            'item_details' => [
                [
                    'id'       => $property->id,
                    'price'    => (int) $amount,
                    'quantity' => 1,
                    'name'     => 'Biaya Upload Properti: ' . $property->title,
                ],
            ],
            'customer_details' => [
                'first_name' => $property->sellerProfile->nama_lengkap ?? 'Seller',
                'email'      => $property->sellerProfile->user->email ?? '',
                'phone'      => $property->sellerProfile->no_hp ?? '',
            ],
            'callbacks' => [
                'finish' => config('app.url') . '/seller/properties',
            ],
        ];

        $response = Http::withBasicAuth(config('midtrans.server_key'), '')
            ->post($this->snapEndpoint(), $params);

        if ($response->failed()) {
            Log::error('Midtrans Snap Error', $response->json());
            throw new \Exception('Gagal membuat transaksi pembayaran.');
        }

        $data = $response->json();

        Transaction::create([
            'property_id' => $property->id,
            'user_id'     => auth()->id(),
            'order_id'    => $orderId,
            'amount'      => $amount,
            'status'      => 'pending',
        ]);

        $this->recordPaymentHistory(
            $property,
            $orderId,
            'property_upload',
            'Upload Properti',
            $amount,
            'pending',
            [
                'customer_name' => $property->sellerProfile->nama_lengkap ?? auth()->user()?->name,
                'customer_email' => $property->sellerProfile->user->email ?? auth()->user()?->email,
            ]
        );

        return $data['token'];
    }

    public function handleNotification(array $payload): void
    {
        $orderId           = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        if (!$orderId || !$transactionStatus) {
            return;
        }

        $transaction = Transaction::where('order_id', $orderId)->first();
        if ($transaction) {
            $this->syncTransactionHistory($transaction, $payload);

            switch ($transactionStatus) {
                case 'capture':
                case 'settlement':
                    $transaction->update([
                        'status'            => 'paid',
                        'payment_method'    => $payload['payment_type'] ?? null,
                        'gateway_reference' => $payload['transaction_id'] ?? null,
                        'paid_at'           => now(),
                    ]);

                    $property = Property::find($transaction->property_id);
                    if ($property && $property->status === 'approved') {
                        app(PropertyService::class)->publish($property);
                    }
                    break;

                case 'pending':
                    $transaction->update(['status' => 'pending']);
                    break;

                case 'deny':
                case 'expire':
                case 'cancel':
                    $transaction->update(['status' => $transactionStatus]);
                    break;
            }
            return;
        }

        if (!$orderId || !$transactionStatus) {
            return;
        }

        $featured = FeaturedListing::where('order_id', $orderId)->first();
        if (!$featured) {
            $this->updatePaymentHistoryFromPayload($payload);
            return;
        }

        $this->handleFeaturedNotification($payload, $featured);
    }

    public function syncTransactionStatus(Transaction $transaction): Transaction
    {
        $response = Http::withBasicAuth(config('midtrans.server_key'), '')
            ->get($this->statusEndpoint($transaction->order_id));

        if ($response->failed()) {
            Log::warning('Midtrans Status Error', [
                'order_id' => $transaction->order_id,
                'response' => $response->json(),
            ]);

            return $transaction->fresh();
        }

        $this->handleNotification($response->json());

        return $transaction->fresh();
    }

    // -----------------------------------------------------------------
    //  Unggulan / Featured Listing (baru)
    // -----------------------------------------------------------------
    public function createFeaturedTransaction(Property $property): string
    {
        $user    = request()->user();
        $orderId = 'FEAT-' . $property->id . '-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);
        $amount  = (int) config('housepoint.featured_price', 50000);

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $amount,
            ],
            'item_details' => [
                [
                    'id'       => 'FEAT-' . $property->id,
                    'price'    => $amount,
                    'quantity' => 1,
                    'name'     => 'Upgrade Properti Unggulan',
                ],
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
            ],
        ];

        $response = Http::withBasicAuth(config('midtrans.server_key'), '')
            ->post($this->snapEndpoint(), $params);

        if ($response->failed()) {
            Log::error('Midtrans Snap Featured Error', $response->json());
            throw new \Exception('Gagal membuat transaksi pembayaran unggulan.');
        }

        $data = $response->json();

        FeaturedListing::create([
            'property_id' => $property->id,
            'user_id'     => $user->id,
            'order_id'    => $orderId,
            'amount'      => $amount,
            'status'      => 'pending',
        ]);

        $this->recordPaymentHistory(
            $property,
            $orderId,
            'featured_listing',
            'Unggulan',
            $amount,
            'pending',
            [
                'customer_name' => $user->name,
                'customer_email' => $user->email,
            ]
        );

        return $data['token'];
    }

    /**
     * Cek status transaksi Midtrans berdasarkan order_id.
     * Mengembalikan string status (settlement, capture, pending, dll) atau null jika gagal.
     */
    public function checkTransactionStatus(string $orderId): ?string
    {
        $response = Http::withBasicAuth(config('midtrans.server_key'), '')
            ->get($this->statusEndpoint($orderId));

        if ($response->failed()) {
            Log::warning('Midtrans checkTransactionStatus failed', [
                'order_id' => $orderId,
                'response' => $response->json(),
            ]);
            return null;
        }

        return $response->json('transaction_status');
    }

    public function syncFeaturedListingStatus(FeaturedListing $featured): FeaturedListing
    {
        if ($featured->status !== 'pending') {
            return $featured->fresh();
        }

        $status = $this->checkTransactionStatus($featured->order_id);

        if ($status) {
            $this->handleFeaturedNotification([
                'order_id' => $featured->order_id,
                'transaction_status' => $status,
            ]);
        }

        return $featured->fresh();
    }

    public function cancelFeaturedListing(FeaturedListing $featured): FeaturedListing
    {
        if ($featured->status !== 'pending') {
            return $featured->fresh();
        }

        $featured->update(['status' => 'cancelled']);

        PaymentHistory::updateOrCreate(
            ['order_id' => $featured->order_id],
            [
                'property_id' => $featured->property_id,
                'user_id' => $featured->user_id,
                'payment_type' => 'featured_listing',
                'payment_label' => 'Unggulan',
                'amount' => $featured->amount,
                'status' => 'cancelled',
                'gateway_status' => 'cancel',
                'payment_method' => null,
                'gateway_reference' => null,
                'customer_name' => $featured->user?->name,
                'customer_email' => $featured->user?->email,
                'seller_name' => $featured->user?->name,
                'property_title' => $featured->property?->title,
                'property_slug' => $featured->property?->slug,
                'raw_payload' => array_merge($this->paymentHistoryRawPayload($featured), [
                    'source' => 'cancel_featured_payment',
                    'cancelled_at' => now()->toISOString(),
                ]),
                'paid_at' => null,
            ]
        );

        return $featured->fresh();
    }

    // -----------------------------------------------------------------
    //  Helpers
    // -----------------------------------------------------------------
    private function snapEndpoint(): string
    {
        return config('midtrans.is_production')
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    private function statusEndpoint(string $orderId): string
    {
        $baseUrl = config('midtrans.is_production')
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';

        return $baseUrl . '/' . rawurlencode($orderId) . '/status';
    }

    private function notifyPaymentSuccess(FeaturedListing $featured): void
    {
        $property = $featured->property;
        $user = $featured->user;

        if (!$property || !$user) {
            return;
        }

        $alreadyNotified = $user->notifications()
            ->where('type', PaymentSuccessNotification::class)
            ->where('data->type', 'payment_success')
            ->where('data->payment_type', 'featured_listing')
            ->where('data->property_id', $property->id)
            ->exists();

        if (!$alreadyNotified) {
            $user->notify(new PaymentSuccessNotification($property, 'featured_listing'));
        }
    }

    private function recordPaymentHistory(
        Property $property,
        string $orderId,
        string $paymentType,
        string $paymentLabel,
        int|float $amount,
        string $status,
        array $extra = []
    ): void {
        PaymentHistory::updateOrCreate(
            ['order_id' => $orderId],
            array_merge([
                'property_id' => $property->id,
                'user_id' => request()->user()?->id,
                'payment_type' => $paymentType,
                'payment_label' => $paymentLabel,
                'amount' => $amount,
                'status' => $status,
                'gateway_status' => $status,
                'payment_method' => null,
                'gateway_reference' => null,
                'customer_name' => $property->sellerProfile->nama_lengkap ?? request()->user()?->name,
                'customer_email' => $property->sellerProfile->user->email ?? request()->user()?->email,
                'seller_name' => $property->sellerProfile->nama_lengkap ?? request()->user()?->name,
                'property_title' => $property->title,
                'property_slug' => $property->slug,
                'raw_payload' => null,
                'paid_at' => null,
            ], $extra)
        );
    }

    private function syncTransactionHistory(Transaction $transaction, array $payload): void
    {
        $property = $transaction->property;
        $user = $transaction->user;

        if (!$property || !$user) {
            return;
        }

        $status = $this->normalizePaymentStatus($payload['transaction_status'] ?? $transaction->status);

        PaymentHistory::updateOrCreate(
            ['order_id' => $transaction->order_id],
            [
                'property_id' => $transaction->property_id,
                'user_id' => $transaction->user_id,
                'payment_type' => 'property_upload',
                'payment_label' => 'Upload Properti',
                'amount' => $transaction->amount,
                'status' => $status,
                'gateway_status' => $payload['transaction_status'] ?? $transaction->status,
                'payment_method' => $payload['payment_type'] ?? $transaction->payment_method,
                'gateway_reference' => $payload['transaction_id'] ?? $transaction->gateway_reference,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'seller_name' => $user->name,
                'property_title' => $property->title,
                'property_slug' => $property->slug,
                'raw_payload' => $payload,
                'paid_at' => in_array($status, ['paid'], true) ? now() : $transaction->paid_at,
            ]
        );
    }

    private function syncFeaturedHistory(FeaturedListing $featured, array $payload): void
    {
        $property = $featured->property;
        $user = $featured->user;

        if (!$property || !$user) {
            return;
        }

        $status = $this->normalizePaymentStatus($payload['transaction_status'] ?? $featured->status);

        PaymentHistory::updateOrCreate(
            ['order_id' => $featured->order_id],
            [
                'property_id' => $featured->property_id,
                'user_id' => $featured->user_id,
                'payment_type' => 'featured_listing',
                'payment_label' => 'Unggulan',
                'amount' => $featured->amount,
                'status' => $status,
                'gateway_status' => $payload['transaction_status'] ?? $featured->status,
                'payment_method' => $payload['payment_type'] ?? null,
                'gateway_reference' => $payload['transaction_id'] ?? null,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'seller_name' => $user->name,
                'property_title' => $property->title,
                'property_slug' => $property->slug,
                'raw_payload' => $payload,
                'paid_at' => in_array($status, ['paid'], true) ? now() : $featured->queued_at,
            ]
        );
    }

    private function handleFeaturedNotification(array $payload, ?FeaturedListing $featured = null): void
    {
        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        if ((!$orderId || !$transactionStatus) && !$featured) {
            return;
        }

        $featured = $featured ?: FeaturedListing::where('order_id', $orderId)->first();
        if (!$featured) {
            $this->updatePaymentHistoryFromPayload($payload);
            return;
        }

        $this->syncFeaturedHistory($featured, $payload);

        switch ($transactionStatus) {
            case 'capture':
            case 'settlement':
                if ($featured->status === 'pending') {
                    $featured->update([
                        'status' => 'paid',
                        'queued_at' => $featured->queued_at ?: now(),
                    ]);

                    $this->notifyPaymentSuccess($featured);
                    app(FeaturedListingService::class)->syncSlots();
                }
                break;

            case 'pending':
                if ($featured->status === 'pending') {
                    $featured->update(['status' => 'pending']);
                }
                break;

            case 'deny':
            case 'expire':
            case 'cancel':
                if ($featured->status === 'pending') {
                    $featured->update(['status' => 'cancelled']);
                }
                break;
        }
    }

    private function updatePaymentHistoryFromPayload(array $payload): void
    {
        $orderId = $payload['order_id'] ?? null;
        if (!$orderId) {
            return;
        }

        $history = PaymentHistory::where('order_id', $orderId)->first();
        if (!$history) {
            return;
        }

        $status = $this->normalizePaymentStatus($payload['transaction_status'] ?? $history->status);

        $history->update([
            'status' => $status,
            'gateway_status' => $payload['transaction_status'] ?? $history->gateway_status,
            'payment_method' => $payload['payment_type'] ?? $history->payment_method,
            'gateway_reference' => $payload['transaction_id'] ?? $history->gateway_reference,
            'raw_payload' => $payload,
            'paid_at' => in_array($status, ['paid'], true) ? ($history->paid_at ?: now()) : $history->paid_at,
        ]);
    }

    private function paymentHistoryRawPayload(FeaturedListing $featured): array
    {
        $history = PaymentHistory::where('order_id', $featured->order_id)->first();

        if (!$history || !is_array($history->raw_payload)) {
            return ['source' => 'featured_listings'];
        }

        return $history->raw_payload;
    }

    private function normalizePaymentStatus(string $status): string
    {
        return match ($status) {
            'capture', 'settlement' => 'paid',
            'pending' => 'pending',
            'deny' => 'denied',
            'expire' => 'expired',
            'cancel' => 'cancelled',
            default => $status,
        };
    }
}
