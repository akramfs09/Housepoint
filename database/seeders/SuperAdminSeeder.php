<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\AdminProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('SUPER_ADMIN_PASSWORD', null);

        if (empty($password)) {
            $this->command->error('SUPER_ADMIN_PASSWORD tidak diisi di .env. Seeder dibatalkan.');
            return;
        }

        $roleSuperAdmin = Role::where('nama_role', 'super_admin')->first();

        if (!$roleSuperAdmin) {
            $this->command->error('Role super_admin tidak ditemukan. Jalankan RoleSeeder terlebih dahulu.');
            return;
        }

        $user = User::firstOrCreate(
            ['email' => 'superadmin@properti.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($password),
                'role_id' => $roleSuperAdmin->id,
                'email_verified_at' => now(),
            ]
        );

        AdminProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'nama_lengkap' => 'Super Admin',
                'divisi' => 'Management',
                'jabatan' => 'Super Administrator',
            ]
        );

        $this->command->info('Super Admin berhasil dibuat.');
    }
}