<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $user = $request->user();
        $customer = $user->customerProfile;
        $seller = $user->sellerProfile;

        if (!$customer) {
            return $this->error('Profil tidak ditemukan.', 404);
        }

        return $this->success([
            'name'         => $user->name,
            'email'        => $user->email,
            'nama_lengkap' => $customer->nama_lengkap,
            'no_hp'        => $customer->no_hp,
            'alamat'       => $customer->alamat,
            'foto_profil'  => $customer->foto_profil_url,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $customer = $user->customerProfile;

        if (!$customer) {
            return $this->error('Profil tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'nama_lengkap' => 'sometimes|string|max:255',
            'no_hp'        => 'sometimes|nullable|string|max:20',
            'alamat'       => 'sometimes|nullable|string|max:500',
            'foto_profil'  => 'sometimes|image|max:10240',
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        if ($request->hasFile('foto_profil')) {
            if ($customer->foto_profil) {
                Storage::disk('r2_public')->delete($customer->foto_profil);
            }
            $path = $request->file('foto_profil')->store('profile', 'r2_public');
            $validated['foto_profil'] = $path;
        }

        $customer->update($validated);

        return $this->success([
            'name'         => $user->name,
            'email'        => $user->email,
            'nama_lengkap' => $customer->nama_lengkap,
            'no_hp'        => $customer->no_hp,
            'alamat'       => $customer->alamat,
            'foto_profil'  => $customer->foto_profil_url,
        ], 'Profil berhasil diperbarui.');
    }
}