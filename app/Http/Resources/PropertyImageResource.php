<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'property_id' => $this->property_id,
            'path'        => $this->path,
            'order'       => $this->order,
            'url'         => $this->publicUrl($this->path),
        ];
    }

    private function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('r2_public')->url($path);
    }
}
