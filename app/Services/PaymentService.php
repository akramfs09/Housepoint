<?php

namespace App\Services;

use App\Models\Property;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function createTransaction(Property $property): string
    {
        $orderId = 'PROP-' . $property->id . '-' . time();
        $amount = config('housepoint.upload_price');

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
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

        return $data['token'];
    }

    public function handleNotification(array $payload): void
    {
        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        if (!$orderId || !$transactionStatus) return;

        $transaction = Transaction::where('order_id', $orderId)->first();
        if (!$transaction) return;

        switch ($transactionStatus) {
            case 'capture':
            case 'settlement':
                $transaction->update([
                    'status' => 'paid',
                    'payment_method' => $payload['payment_type'] ?? null,
                    'gateway_reference' => $payload['transaction_id'] ?? null,
                    'paid_at' => now(),
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
}
