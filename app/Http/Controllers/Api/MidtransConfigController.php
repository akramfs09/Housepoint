<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class MidtransConfigController extends Controller
{
    public function show()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'client_key' => config('midtrans.client_key'),
                'upload_price' => (int) config('housepoint.upload_price', 50000),
                'featured_price' => (int) config('housepoint.featured_price', 50000),
                'snap_url' => config('midtrans.is_production')
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js',
            ],
        ]);
    }
}
