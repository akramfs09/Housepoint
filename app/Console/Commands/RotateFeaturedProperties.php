<?php

namespace App\Console\Commands;

use App\Services\FeaturedListingService;
use Illuminate\Console\Command;

class RotateFeaturedProperties extends Command
{
    protected $signature = 'property:rotate-featured';
    protected $description = 'Rotate featured listing slots daily';

    public function handle(FeaturedListingService $featuredListingService): int
    {
        $rotated = $featuredListingService->syncSlots();

        $rotated > 0
            ? $this->info("Rotated {$rotated} featured listings.")
            : $this->info('No empty slots or paid queue.');

        return self::SUCCESS;
    }
}
