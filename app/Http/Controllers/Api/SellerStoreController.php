<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerStoreController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $seller = $request->user()->sellerProfile;

        if (!$seller) {
            return $this->error('Profil toko tidak ditemukan.', 404);
        }

        return $this->success([
            'nama_toko'  => $seller->nama_toko,
            'deskripsi'  => $seller->deskripsi,
            'foto_toko'  => $seller->foto_toko_url,
        ]);
    }

    public function update(Request $request)
    {
        $seller = $request->user()->sellerProfile;

        if (!$seller) {
            return $this->error('Profil toko tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'nama_toko'  => 'sometimes|string|max:255',
            'deskripsi'  => 'sometimes|nullable|string|max:1000',
            'foto_toko'  => 'sometimes|image|max:10240',
        ]);

        if ($request->hasFile('foto_toko')) {
            if ($seller->foto_toko) {
                Storage::disk('r2_public')->delete($seller->foto_toko);
            }
            $path = $request->file('foto_toko')->store('seller/store', 'r2_public');
            $validated['foto_toko'] = $path;
        }

        $seller->update($validated);

        return $this->success([
            'nama_toko' => $seller->nama_toko,
            'deskripsi' => $seller->deskripsi,
            'foto_toko' => $seller->foto_toko_url,
        ], 'Profil toko berhasil diperbarui.');
    }
}