<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\AdminActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyService
{
    private const MAIN_IMAGE_DIR = 'main';
    private const GALLERY_IMAGE_DIR = 'gallery';
    private const VIDEO_DIR = 'videos';

    /**
     * Membuat properti baru dengan status draft.
     * Batas maksimal 3 draft per seller.
     */
    public function create(Request $request): Property
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            
            $sellerId = $request->user()->sellerProfile->id;
            
            // Cek batas 3 draft
            $draftCount = Property::where('seller_id', $sellerId)
                ->where('status', 'draft')
                ->count();
            if ($draftCount >= 3) {
                throw new \Exception('Anda sudah memiliki 3 properti draft. Selesaikan atau hapus draft yang ada sebelum membuat baru.');
            }
            
            $validated['description'] = strip_tags($validated['description']);
            $validated['seller_id'] = $sellerId;
            $validated['slug'] = $this->generateUniqueSlug($validated['title']);

            // Upload gambar utama
            if ($request->hasFile('image_main')) {
                $validated['image_main'] = $request->file('image_main')->store(self::MAIN_IMAGE_DIR, 'r2_public');
            }

            // Upload video
            // Upload video (line ~33-35)
            if ($request->video_type === 'upload' && $request->hasFile('video_file')) {
                $validated['video_path'] = $request->file('video_file')->store(self::VIDEO_DIR, 'r2_public');
            }

            // Fasilitas sebagai array
            if ($request->has('fasilitas')) {
                $validated['fasilitas'] = $request->fasilitas;
            }

            $property = Property::create($validated);

            // Simpan gambar tambahan
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'path' => $image->store(self::GALLERY_IMAGE_DIR, 'r2_public'),
                        'order' => $index + 1,
                    ]);
                }
            }

            return $property;
        });
    }

    /**
     * Update properti.
     * - Jika published & edit_count < 2: tetap published, increment edit_count
     * - Jika rejected: ubah ke draft + cek batas 3 draft + hapus alasan_tolak
     */
    public function update(Request $request, Property $property): Property
    {
        return DB::transaction(function () use ($request, $property) {
            $validated = $request->validated();
            $validated['description'] = strip_tags($validated['description']);

            // Jika judul berubah, generate slug baru
            if (isset($validated['title']) && $validated['title'] !== $property->title) {
                $validated['slug'] = $this->generateUniqueSlug($validated['title']);
            }

            // Jika properti published & masih bisa edit: increment edit_count, tetap published
            if ($property->status === 'published') {
                if ($property->edit_count >= 2) {
                    throw new \Exception('Batas edit (2x) sudah habis. Anda tidak dapat mengedit properti ini lagi.');
                }
                $property->increment('edit_count');
                // Tidak mengubah status — tetap published
            }

            // Jika dari rejected, ubah ke draft (revisi)
            if ($property->status === 'rejected') {
                $sellerId = $property->seller_id;
                $draftCount = Property::where('seller_id', $sellerId)
                    ->where('status', 'draft')
                    ->count();
                if ($draftCount >= 3) {
                    throw new \Exception('Anda sudah memiliki 3 properti draft. Tidak dapat menyimpan revisi sebagai draft.');
                }
                $validated['status'] = 'draft';
                $validated['alasan_tolak'] = null;
            }

            // Upload gambar utama baru
            if ($request->hasFile('image_main')) {
                if ($property->image_main) {
                    Storage::disk('r2_public')->delete($property->image_main);
                }
                $validated['image_main'] = $request->file('image_main')->store(self::MAIN_IMAGE_DIR, 'r2_public');
            }

            // Upload video baru
            if ($request->video_type === 'upload' && $request->hasFile('video_file')) {
                if ($property->video_path) {
                    Storage::disk('r2_public')->delete($property->video_path);
                }
                $validated['video_path'] = $request->file('video_file')->store(self::VIDEO_DIR, 'r2_public');
            }

            // Fasilitas
            if ($request->has('fasilitas')) {
                $validated['fasilitas'] = $request->fasilitas;
            } else {
                $validated['fasilitas'] = null;
            }

            $property->update($validated);

            // Log aktivitas
            AdminActionLog::create([
                'actor_id'    => auth()->id(),
                'action'      => $property->status === 'published' ? 'edit_published_property' : 'update_property',
                'target_type' => Property::class,
                'target_id'   => $property->id,
                'metadata'    => [
                    'edit_count' => $property->edit_count,
                    'changes'    => array_keys($validated),
                ],
            ]);

            return $property->fresh();
        });
    }

    /**
     * Soft delete properti beserta gambar dan video.
     */
    public function delete(Property $property): void
    {
        DB::transaction(function () use ($property) {
            if ($property->image_main) {
                Storage::disk('r2_public')->delete($property->image_main);
            }
            if ($property->video_path) {
                Storage::disk('r2_public')->delete($property->video_path);
            }
            $property->images()->each(function ($image) {
                Storage::disk('r2_public')->delete($image->path);
                $image->delete();
            });
            $property->delete();
        });
    }

    /**
     * Mengajukan properti draft ke moderasi (pending).
     * Batas maksimal 3 pending per seller.
     */
    public function submit(Property $property): void
    {
        if ($property->status !== 'draft') {
            throw new \Exception('Hanya properti draft yang bisa diajukan.');
        }
        
        $pendingCount = Property::where('seller_id', $property->seller_id)
            ->where('status', 'pending')
            ->count();
        if ($pendingCount >= 3) {
            throw new \Exception('Anda sudah memiliki 3 properti yang sedang dimoderasi. Tunggu hingga selesai sebelum mengajukan lagi.');
        }
        
        $property->update(['status' => 'pending']);
    }

    /**
     * Admin menyetujui properti pending → approved (menunggu pembayaran).
     */
    public function approve(Property $property): void
    {
        if ($property->status !== 'pending') {
            throw new \Exception('Hanya properti pending yang bisa disetujui.');
        }
        $property->update([
            'status' => 'approved',
        ]);
    }

    /**
     * Mengubah properti approved menjadi published (setelah pembayaran sukses).
     */
    public function publish(Property $property): void
    {
        if ($property->status !== 'approved') {
            throw new \Exception('Hanya properti approved yang bisa dipublikasikan.');
        }
        $property->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * Admin menolak properti pending.
     */
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

    /**
     * Generate slug unik untuk properti.
     */
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
