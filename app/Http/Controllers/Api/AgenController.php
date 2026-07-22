<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\SellerProfile;
use App\Support\PublicStorageUrl;

class AgenController extends Controller
{
    /**
     * Halaman publik agen seller.
     */
    public function show(SellerProfile $seller)
    {
        if ($seller->status !== 'approved') {
            abort(404);
        }

        $user = $seller->user;

        $agenInfo = [
            'id'           => $seller->id,
            'nama_agen'    => $seller->nama_agen,
            'deskripsi'    => $seller->deskripsi,
            'foto_agen'    => PublicStorageUrl::make($seller->foto_agen, 'r2_public'),
            'nama_penjual' => $user->name,
            'email'        => $user->email,
        ];

        $properties = $seller->properties()
            ->where('status', 'published')
            ->with('images')
            ->latest('published_at')
            ->paginate(12);

        return response()->json([
            'success'    => true,
            'agen'       => $agenInfo,
            'properties' => PropertyResource::collection($properties)->response()->getData(true),
        ]);
    }
}
