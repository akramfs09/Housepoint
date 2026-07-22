<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->customerProfile;

        if (!$profile) {
            return $this->error('Profil customer tidak ditemukan.', 404);
        }

        // Ambil data favorit riil
        $favs = \DB::table('favorites')
            ->where('user_id', $user->id)
            ->join('properties', 'favorites.property_id', '=', 'properties.id')
            ->select('properties.title', 'properties.city', 'properties.province', 'favorites.created_at')
            ->latest('favorites.created_at')
            ->take(5)
            ->get()
            ->map(function($item) {
                return [
                    'id' => 'fav-' . $item->created_at,
                    'type' => 'favorite',
                    'title' => 'Menyimpan Favorit: ' . $item->title,
                    'time' => \Carbon\Carbon::parse($item->created_at)->diffForHumans(),
                    'location' => implode(', ', array_filter([$item->city, $item->province])),
                    'timestamp' => $item->created_at,
                ];
            })
            ->toArray();

        // Ambil data view riil
        $views = \App\Models\PropertyView::where('user_id', $user->id)
            ->with('property')
            ->latest('id')
            ->take(5)
            ->get()
            ->filter(fn($v) => !is_null($v->property))
            ->map(function($v) {
                return [
                    'id' => 'view-' . $v->id,
                    'type' => 'view',
                    'title' => 'Melihat ' . $v->property->title,
                    'time' => \Carbon\Carbon::parse($v->created_at)->diffForHumans(),
                    'location' => implode(', ', array_filter([$v->property->city, $v->property->province])),
                    'timestamp' => $v->created_at,
                ];
            })
            ->toArray();

        // Gabungkan dan urutkan berdasarkan timestamp terbaru
        $activitiesList = array_merge($favs, $views);
        usort($activitiesList, fn($a, $b) => strcmp($b['timestamp'], $a['timestamp']));
        $activitiesList = array_slice($activitiesList, 0, 5);

        return $this->success([
            'name'          => $user->name,
            'email'         => $user->email,
            'nama_lengkap'  => $profile->nama_lengkap,
            'no_hp'         => $profile->no_hp,
            'alamat'        => $profile->alamat,
            'tanggal_lahir' => $profile->tanggal_lahir?->format('Y-m-d'),
            'jenis_kelamin' => $profile->jenis_kelamin,
            'pekerjaan'     => $profile->pekerjaan,
            'foto_profil'   => $profile->foto_profil_url,
            'activities'    => $activitiesList,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $profile = $user->customerProfile;

        if (!$profile) {
            return $this->error('Profil customer tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'nama_lengkap'  => 'sometimes|string|max:255',
            'no_hp'         => 'sometimes|nullable|string|max:20',
            'alamat'        => 'sometimes|nullable|string|max:500',
            'tanggal_lahir' => 'sometimes|nullable|date',
            'jenis_kelamin' => 'sometimes|nullable|in:L,P',
            'pekerjaan'     => 'sometimes|nullable|string|max:255',
            'foto_profil'   => 'sometimes|image|max:10240',
        ]);

        // Update nama di tabel users
        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        // Upload foto profil jika ada
        if ($request->hasFile('foto_profil')) {
            if ($profile->foto_profil) {
                Storage::disk('r2_public')->delete($profile->foto_profil);
            }
            $path = $request->file('foto_profil')->store('profile', 'r2_public');
            $validated['foto_profil'] = $path;
        }

        $profile->update($validated);

        return $this->success([
            'name'          => $user->name,
            'email'         => $user->email,
            'nama_lengkap'  => $profile->nama_lengkap,
            'no_hp'         => $profile->no_hp,
            'alamat'        => $profile->alamat,
            'tanggal_lahir' => $profile->tanggal_lahir?->format('Y-m-d'),
            'jenis_kelamin' => $profile->jenis_kelamin,
            'pekerjaan'     => $profile->pekerjaan,
            'foto_profil'   => $profile->foto_profil_url,
        ], 'Profil berhasil diperbarui.');
    }
}