<?php

use App\Models\City;
use App\Models\Province;
use App\Models\Property;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->foreignId('province_id')
                ->nullable()
                ->after('address')
                ->constrained('provinces')
                ->nullOnDelete();

            $table->foreignId('city_id')
                ->nullable()
                ->after('province_id')
                ->constrained('cities')
                ->nullOnDelete();

            $table->index(['status', 'province_id', 'city_id', 'type', 'price', 'published_at'], 'idx_catalog_location');
        });

        $provinces = Province::with('cities')->get();
        $provinceMap = $provinces->mapWithKeys(function (Province $province) {
            return [mb_strtolower(trim($province->nama)) => $province];
        });

        $cityMap = City::with('province')->get()->mapWithKeys(function (City $city) {
            return [
                mb_strtolower(trim($city->nama)) . '|' . $city->province_id => $city,
            ];
        });

        Property::query()
            ->select(['id', 'province', 'city', 'province_id', 'city_id'])
            ->orderBy('id')
            ->chunkById(200, function ($properties) use ($provinceMap, $cityMap) {
                foreach ($properties as $property) {
                    $province = null;
                    $city = null;

                    if ($property->province_id) {
                        $province = Province::find($property->province_id);
                    }

                    if (! $province && $property->province) {
                        $province = $provinceMap[mb_strtolower(trim($property->province))] ?? null;
                    }

                    if ($property->city_id) {
                        $city = City::find($property->city_id);
                    }

                    if (! $city && $property->city) {
                        if ($province) {
                            $city = $cityMap[mb_strtolower(trim($property->city)) . '|' . $province->id] ?? null;
                        }

                        if (! $city) {
                            $city = City::whereRaw('LOWER(nama) = ?', [mb_strtolower(trim($property->city))])->first();
                        }
                    }

                    if (! $province && $city) {
                        $province = $city->province;
                    }

                    if (! $province && ! $city) {
                        continue;
                    }

                    $property->forceFill([
                        'province_id' => $province?->id,
                        'city_id' => $city?->id,
                        'province' => $province?->nama ?? $property->province,
                        'city' => $city?->nama ?? $property->city,
                    ])->saveQuietly();
                }
            });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex('idx_catalog_location');
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('province_id');
        });
    }
};
