<?php

namespace App\Console\Commands;

use App\Models\FeaturedListing;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RotateFeaturedProperties extends Command
{
    protected $signature = 'property:rotate-featured';
    protected $description = 'Rotate featured listing slots daily';

    public function handle(): int
    {
        $rotated = DB::transaction(function () {
            FeaturedListing::where('status', 'active')
                ->where(function ($query) {
                    $query->where('expires_at', '<=', now())
                        ->orWhereDoesntHave('property', fn ($property) => $property->where('status', 'published'));
                })
                ->update(['status' => 'completed']);

            $activeCount = FeaturedListing::where('status', 'active')
                ->where('started_at', '<=', now())
                ->where('expires_at', '>', now())
                ->whereHas('property', fn ($query) => $query->where('status', 'published'))
                ->count();

            $slots = max(0, 8 - $activeCount);

            if ($slots === 0) {
                return 0;
            }

            $queued = FeaturedListing::where('status', 'paid')
                ->whereNotNull('queued_at')
                ->whereHas('property', fn ($query) => $query->where('status', 'published'))
                ->orderBy('queued_at')
                ->lockForUpdate()
                ->limit($slots)
                ->get();

            foreach ($queued as $item) {
                $item->update([
                    'status'     => 'active',
                    'started_at' => now(),
                    'expires_at' => now()->addDays(7),
                ]);
            }

            return $queued->count();
        });

        $rotated > 0
            ? $this->info("Rotated {$rotated} featured listings.")
            : $this->info('No empty slots or paid queue.');

        return self::SUCCESS;
    }
}
