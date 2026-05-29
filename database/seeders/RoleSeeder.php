<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['nama_role' => 'super_admin']);
        Role::firstOrCreate(['nama_role' => 'admin']);
        Role::firstOrCreate(['nama_role' => 'customer']); // customer lebih dulu
        Role::firstOrCreate(['nama_role' => 'seller']);   // seller setelahnya
    }
}