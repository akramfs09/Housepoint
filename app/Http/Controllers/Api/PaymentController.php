<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function handleNotification(Request $request, PaymentService $paymentService)
    {
        $payload = $request->all();

        // Sandbox: langsung proses
        if (!config('midtrans.is_production')) {
            $paymentService->handleNotification($payload);
            return response()->json(['status' => 'ok']);
        }

        // Production: verifikasi signature
        $serverKey = config('midtrans.server_key');
        foreach (['order_id', 'status_code', 'gross_amount', 'signature_key'] as $key) {
            if (empty($payload[$key])) {
                Log::warning('Midtrans notification payload incomplete', $payload);
                return response()->json(['status' => 'error', 'message' => 'Incomplete payload'], 400);
            }
        }

        $signature = hash('sha512', $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . $serverKey);

        if (!hash_equals($signature, $payload['signature_key'])) {
            Log::warning('Midtrans signature invalid', $payload);
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
        }

        $paymentService->handleNotification($payload);
        return response()->json(['status' => 'ok']);
    }
}
