<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyService
{
    public function create(Request $request): Property
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $validated['description'] = strip_tags($validated['description']);
            $validated['seller_id'] = $request->user()->sellerProfile->id;
            $validated['slug'] = $this->generateUniqueSlug($validated['title']);

            if ($request->hasFile('image_main')) {
                $validated['image_main'] = $request->file('image_main')->store('properties', 'r2_public');
            }

            $property = Property::create($validated);

            // Simpan gambar
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'path' => $image->store('properties/gallery', 'r2_public'),
                        'order' => $index + 1,
                    ]);
                }
            }

            return $property;
        });
    }

    public function update(Request $request, Property $property): Property
    {
        return DB::transaction(function () use ($request, $property) {
            $validated = $request->validated();
            $validated['description'] = strip_tags($validated['description']);

            // Jika judul berubah, generate slug baru
            if (isset($validated['title']) && $validated['title'] !== $property->title) {
                $validated['slug'] = $this->generateUniqueSlug($validated['title']);
            }

            // Jika properti published, kembalikan ke draft
            if ($property->status === 'published') {
                $validated['status'] = 'draft';
            }

            // Clear alasan_tolak jika dari rejected
            if ($property->status === 'rejected') {
                $validated['alasan_tolak'] = null;
            }

            // Upload gambar utama baru
            if ($request->hasFile('image_main')) {
                if ($property->image_main) {
                    Storage::disk('r2_public')->delete($property->image_main);
                }
                $validated['image_main'] = $request->file('image_main')->store('properties', 'r2_public');
            }

            $property->update($validated);

            return $property->fresh();
        });
    }

    public function delete(Property $property): void
    {
        DB::transaction(function () use ($property) {
            if ($property->image_main) {
                Storage::disk('r2_public')->delete($property->image_main);
            }
            $property->images()->each(function ($image) {
                Storage::disk('r2_public')->delete($image->path);
                $image->delete();
            });
            $property->delete();
        });
    }

    public function submit(Property $property): void
    {
        if ($property->status !== 'draft') {
            throw new \Exception('Hanya properti draft yang bisa diajukan.');
        }
        $property->update(['status' => 'pending']);
    }

    public function approve(Property $property): void
    {
        if ($property->status !== 'pending') {
            throw new \Exception('Hanya properti pending yang bisa disetujui.');
        }
        $property->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function reject(Property $property, string $alasan): void
    {
        if ($property->status !== 'pending') {
            throw new \Exception('Hanya properti pending yang bisa ditolak.');
        }
        $property->update([
            'status' => 'rejected',
            'alasan_tolak' => $alasan,
        ]);
    }

    private function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (Property::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}