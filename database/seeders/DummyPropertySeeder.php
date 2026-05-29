<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\SellerProfile;
use Illuminate\Database\Seeder;

class DummyPropertySeeder extends Seeder
{
    public function run(): void
    {
        $seller = SellerProfile::where('status', 'approved')->first();
        if (!$seller) return;

        $properties = [
            [
                'seller_id' => $seller->id,
                'title' => 'Rumah Minimalis Modern',
                'slug' => 'rumah-minimalis-modern-1',
                'description' => 'Rumah minimalis dengan desain modern di pusat kota.',
                'price' => 750000000,
                'type' => 'rumah',
                'address' => 'Jl. Merdeka No. 123',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'land_area' => 120,
                'building_area' => 100,
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'seller_id' => $seller->id,
                'title' => 'Apartemen Strategis',
                'slug' => 'apartemen-strategis-1',
                'description' => 'Apartemen nyaman dekat dengan fasilitas umum.',
                'price' => 450000000,
                'type' => 'apartemen',
                'address' => 'Jl. Sudirman No. 45',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'bedrooms' => 2,
                'bathrooms' => 1,
                'land_area' => 60,
                'building_area' => 55,
                'status' => 'published',
                'published_at' => now(),
            ],
        ];

        foreach ($properties as $prop) {
            Property::firstOrCreate(['slug' => $prop['slug']], $prop);
        }
    }
}