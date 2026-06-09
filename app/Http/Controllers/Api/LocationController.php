<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use App\Models\City;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function provinces(Request $request)
    {
        $search = $request->get('search', '');
        $limit = $request->get('limit', 1000); // 🆕 default ambil semua
        $provinces = Province::where('nama', 'like', "%{$search}%")
            ->orderBy('nama')
            ->limit($limit)
            ->get(['id', 'nama']);

        return response()->json($provinces);
    }

    public function cities(Request $request)
    {
        $search = $request->get('search', '');
        $provinceId = $request->get('province_id');
        $limit = $request->get('limit', 1000); // 🆕

        $query = City::orderBy('nama');
        if ($search) {
            $query->where('nama', 'like', "%{$search}%");
        }
        if ($provinceId) {
            $query->where('province_id', $provinceId);
        }

        return response()->json($query->limit($limit)->get(['id', 'province_id', 'nama']));
    }
}