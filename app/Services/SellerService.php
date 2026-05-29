<?php

namespace App\Services;

use App\Models\SellerProfile;
use App\Models\User;
use App\Models\Role;
use App\Models\SellerAppeal;
use App\Models\AdminActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SellerService
{
    public function register(Request $request): SellerProfile
    {
        $user = $request->user();

        // Cek apakah sudah punya seller profile yang aktif
        $existing = SellerProfile::where('user_id', $user->id)->first();
        if ($existing) {
            if ($existing->status === 'pending') {
                throw new \Exception('Pengajuan Anda masih dalam proses.');
            }
            if ($existing->status === 'approved') {
                throw new \Exception('Anda sudah terdaftar sebagai seller.');
            }
            if ($existing->status === 'rejected') {
                // Cek batas pengajuan
                if ($existing->apply_count >= 3) {
                    throw new \Exception('Anda sudah mencapai batas pengajuan (3 kali). Hubungi admin.');
                }

                // Cek cooldown (1 hari = 24 jam)
                if ($existing->last_apply_at) {
                    $hoursSinceRejection = abs(now()->diffInHours($existing->last_apply_at));
                    if ($hoursSinceRejection < 24) {
                        throw new \Exception("Anda bisa mengajukan ulang dalam 1 hari.");
                    }
                }
            }
        }

        // Jika ada pengajuan lama (rejected), hapus file KTP, selfie, dan foto‑foto lama
        if ($existing && $existing->status === 'rejected') {
            if ($existing->ktp_path) {
                Storage::disk('r2_private')->delete($existing->ktp_path);
            }
            if ($existing->selfie_path) {
                Storage::disk('r2_private')->delete($existing->selfie_path);
            }
            if ($existing->foto_profil) {
                Storage::disk('r2_public')->delete($existing->foto_profil);
            }
            if ($existing->foto_toko) {
                Storage::disk('r2_public')->delete($existing->foto_toko);
            }
        }

        // Upload KTP & Selfie baru ke bucket privat
        $ktpPath = $request->file('ktp')->store('ktp', 'r2_private');
        $selfiePath = $request->file('selfie')->store('selfie', 'r2_private');

        // Upload foto toko ke bucket publik (folder seller/store)
        $fotoTokoPath = null;
        if ($request->hasFile('foto_toko')) {
            $fotoTokoPath = $request->file('foto_toko')->store('seller/store', 'r2_public');
        }

        // Data yang bisa di‑fillable
        $fillableData = [
            'nama_lengkap'    => $user->name,   // otomatis dari nama user, bukan dari input
            'nama_toko'       => $request->filled('nama_toko') ? strip_tags($request->nama_toko) : null,
            'no_hp'           => strip_tags($request->no_hp),
            'alamat'          => strip_tags($request->alamat),
            'deskripsi'       => $request->filled('deskripsi') ? strip_tags($request->deskripsi) : null,
            'foto_toko'       => $fotoTokoPath,
            'syarat_ketentuan' => true,
            'ktp_path'        => $ktpPath,
            'selfie_path'     => $selfiePath,
        ];

        if ($existing && $existing->status === 'rejected') {
            // Update pengajuan lama — assignment manual untuk field non‑fillable
            $existing->fill($fillableData);
            $existing->status         = 'pending';
            $existing->last_apply_at  = now();
            $existing->apply_count    = $existing->apply_count + 1;
            $existing->alasan_tolak   = null;
            $existing->save();

            return $existing->fresh();
        }

        // Pengajuan baru
        $seller = new SellerProfile($fillableData);
        $seller->user_id       = $user->id;
        $seller->status        = 'pending';
        $seller->last_apply_at = now();
        $seller->apply_count   = 1;
        $seller->save();

        return $seller->fresh();
    }

    public function approve(SellerProfile $seller, User $admin): void
    {
        // Hapus selfie secara permanen
        if ($seller->selfie_path) {
            Storage::disk('r2_private')->delete($seller->selfie_path);
        }

        // Ubah status seller_profile
        $seller->status = 'approved';
        $seller->verified_at = now();
        $seller->verified_by = $admin->id;
        $seller->selfie_path = null;
        $seller->save();

        // Ubah peran pengguna menjadi seller
        $roleSeller = Role::where('nama_role', 'seller')->first();
        if ($roleSeller) {
            $seller->user->role_id = $roleSeller->id;
            $seller->user->save();
        }

        // 🆕 Catat log
        AdminActionLog::create([
            'actor_id'    => $admin->id,
            'action'      => 'approve_seller',
            'target_type' => SellerProfile::class,
            'target_id'   => $seller->id,
            'metadata'    => json_encode([
                'seller_id' => $seller->id,
                'user_id'   => $seller->user_id,
            ]),
        ]);
    }

    public function reject(SellerProfile $seller, User $admin, string $alasan): void
    {
        DB::transaction(function () use ($seller, $admin, $alasan) {
            $seller->status       = 'rejected';
            $seller->last_apply_at = now();
            $seller->alasan_tolak = $alasan;
            $seller->verified_by  = $admin->id;
            $seller->save();

            $seller->rejectionLogs()->create([
                'alasan'      => $alasan,
                'rejected_by' => $admin->id,
                'rejected_at' => now(),
            ]);

            $seller->properties()
                ->whereIn('status', ['published', 'pending'])
                ->update(['status' => 'draft']);

            // 🆕 Catat log
            AdminActionLog::create([
                'actor_id'    => $admin->id,
                'action'      => 'reject_seller',
                'target_type' => SellerProfile::class,
                'target_id'   => $seller->id,
                'metadata'    => json_encode([
                    'seller_id'    => $seller->id,
                    'user_id'      => $seller->user_id,
                    'seller_name'  => $seller->user->name ?? null,
                    'seller_email' => $seller->user->email ?? null,
                    'alasan'       => $alasan,
                ]),
            ]);
        });
    }

    public function addAppeal(SellerProfile $seller, string $alasan): SellerAppeal
    {
        // Cegah banding ganda
        $existing = $seller->appeals()->where('status', 'pending')->first();
        if ($existing) {
            throw new \Exception('Anda sudah memiliki banding yang sedang ditinjau.');
        }

        // Cek kuota banding (hanya 1 kali seumur hidup)
        $approvedOrRejected = $seller->appeals()->whereIn('status', ['approved', 'rejected'])->count();
        if ($approvedOrRejected >= 1) {
            throw new \Exception('Anda sudah menggunakan jatah banding Anda.');
        }

        return $seller->appeals()->create([
            'alasan' => $alasan,
            'status' => 'pending',
        ]);
    }

    public function approveAppeal(SellerAppeal $appeal, User $admin): void
    {
        $appeal->status = 'approved';
        $appeal->reviewed_by = $admin->id;
        $appeal->reviewed_at = now();
        $appeal->save();

        // Beri 1 kesempatan tambahan
        $seller = $appeal->sellerProfile;
        $seller->apply_count = 2;
        $seller->save();

        // Catat log audit
        AdminActionLog::create([
            'actor_id'    => $admin->id,
            'action'      => 'approve_appeal',
            'target_type' => SellerAppeal::class,
            'target_id'   => $appeal->id,
            'metadata'    => json_encode([
                'seller_id' => $seller->id,
                'alasan'    => $appeal->alasan,
            ]),
        ]);
    }

    public function rejectAppeal(SellerAppeal $appeal, User $admin, ?string $catatan = null): void
    {
        $appeal->status = 'rejected';
        $appeal->reviewed_by = $admin->id;
        $appeal->reviewed_at = now();
        $appeal->catatan_internal = $catatan;
        $appeal->save();

        // Catat log audit
        AdminActionLog::create([
            'actor_id'    => $admin->id,
            'action'      => 'reject_appeal',
            'target_type' => SellerAppeal::class,
            'target_id'   => $appeal->id,
            'metadata'    => json_encode([
                'seller_id'          => $appeal->sellerProfile->id,
                'alasan'             => $appeal->alasan,
                'catatan_internal'   => $catatan,
            ]),
        ]);
    }

    public function delete(SellerProfile $seller): void
    {
        DB::transaction(function () use ($seller) {
            Storage::disk('r2_private')->delete([$seller->ktp_path, $seller->selfie_path]);
            if ($seller->foto_profil) {
                Storage::disk('r2_public')->delete($seller->foto_profil);
            }
            if ($seller->foto_toko) {
                Storage::disk('r2_public')->delete($seller->foto_toko);
            }

            $seller->properties()->each(function ($property) {
                if ($property->image_main) {
                    Storage::disk('r2_public')->delete($property->image_main);
                }
                $property->images()->each(function ($image) {
                    Storage::disk('r2_public')->delete($image->path);
                    $image->delete();
                });
                $property->delete();
            });

            $seller->delete();
        });
    }
}