<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\SellerProfile;
use App\Support\PublicStorageUrl;

class StoreController extends Controller
{
    /**
     * Halaman publik toko seller.
     */
    public function show(SellerProfile $seller)
    {
        // Hanya seller yang sudah disetujui yang bisa diakses publik
        if ($seller->status !== 'approved') {
            abort(404);
        }

        $user = $seller->user;

        // Informasi profil toko (hanya data publik yang aman)
        $storeInfo = [
            'id'          => $seller->id,
            'nama_toko'   => $seller->nama_toko,
            'deskripsi'   => $seller->deskripsi,
            'foto_toko'   => PublicStorageUrl::make($seller->foto_toko, 'r2_public'),
            'nama_penjual'=> $user->name,
            'email'       => $user->email,
        ];

        // Properti published milik seller
        $properties = $seller->properties()
            ->where('status', 'published')
            ->with('images')
            ->latest('published_at')
            ->paginate(12);

        return response()->json([
            'success'    => true,
            'store'      => $storeInfo,
            'properties' => PropertyResource::collection($properties)->response()->getData(true),
        ]);
    }
}