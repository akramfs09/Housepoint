<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerAgenController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $seller = $request->user()->sellerProfile;

        if (! $seller) {
            return $this->error('Profil agen tidak ditemukan.', 404);
        }

        return $this->success([
            'nama_agen' => $seller->nama_agen,
            'deskripsi' => $seller->deskripsi,
            'foto_agen' => $seller->foto_agen_url,
        ]);
    }

    public function update(Request $request)
    {
        $seller = $request->user()->sellerProfile;

        if (! $seller) {
            return $this->error('Profil agen tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'nama_agen' => 'sometimes|string|max:255',
            'deskripsi' => 'sometimes|nullable|string|max:1000',
            'foto_agen' => 'sometimes|image|max:10240',
        ]);

        if ($request->hasFile('foto_agen')) {
            if ($seller->foto_agen) {
                Storage::disk('r2_public')->delete($seller->foto_agen);
            }
            $path = $request->file('foto_agen')->store('seller/agen', 'r2_public');
            $validated['foto_agen'] = $path;
        }

        $seller->update($validated);

        return $this->success([
            'nama_agen' => $seller->nama_agen,
            'deskripsi' => $seller->deskripsi,
            'foto_agen' => $seller->foto_agen_url,
        ], 'Profil agen berhasil diperbarui.');
    }
}
