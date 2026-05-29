<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\SellerProfile;
use Illuminate\Database\Seeder;

class DummySellerSeeder extends Seeder
{
    public function run(): void
    {
        // Buat user seller dummy yang sudah approved
        $sellerUser = User::firstOrCreate(
            ['email' => 'seller@properti.com'],
            [
                'name' => 'Seller Dummy',
                'password' => bcrypt('password'),
                'role_id' => 3, // customer
                'email_verified_at' => now(),
            ]
        );

        SellerProfile::firstOrCreate(
            ['user_id' => $sellerUser->id],
            [
                'ktp_path' => 'ktp/dummy.jpg',
                'selfie_path' => 'selfie/dummy.jpg',
                'status' => 'approved',
                'verified_at' => now(),
                'verified_by' => 1,
                'last_apply_at' => now(),
                'apply_count' => 1,
            ]
        );
    }
}