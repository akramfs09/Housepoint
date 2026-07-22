<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateWebsiteContentRequest;
use App\Http\Resources\WebsiteContentResource;
use App\Http\Traits\ApiResponse;
use App\Models\WebsiteContent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class WebsiteContentController extends Controller
{
    use ApiResponse;

    private const BRANDING_DIR = 'website/branding';
    private const HERO_IMAGE_DIR = 'website/hero';

    public function show()
    {
        return $this->success(new WebsiteContentResource($this->content()));
    }

    public function update(UpdateWebsiteContentRequest $request)
    {
        $content = $this->content();

        $branding = $content->branding ?? [];
        $branding = $this->syncLogoSlot($request, $branding, 'header_logo', 'remove_header_logo', 'header_logo_path');
        $branding = $this->syncLogoSlot($request, $branding, 'footer_logo', 'remove_footer_logo', 'footer_logo_path');
        $branding = $this->syncLogoSlot($request, $branding, 'auth_logo', 'remove_auth_logo', 'auth_logo_path');

        $about = $content->about ?? [];
        $about = $this->syncLogoSlot($request, $about, 'about_logo', 'remove_about_logo', 'about_logo_path');

        $hero = $content->hero ?? [];
        $heroImages = $this->currentHeroImages($hero);
        $removedHeroImages = $request->input('removed_hero_images', []);

        if (! empty($removedHeroImages)) {
            foreach ($removedHeroImages as $removedPath) {
                Storage::disk('r2_public')->delete($removedPath);
            }

            $heroImages = array_values(array_filter(
                $heroImages,
                fn ($image) => ! in_array($image['image_path'], $removedHeroImages, true)
            ));
        }

        foreach ($request->file('hero_images', []) as $image) {
            $heroImages[] = [
                'image_path' => $image->store(self::HERO_IMAGE_DIR, 'r2_public'),
                'alt_text' => $request->input('hero_alt_text', 'Iklan HousePoint'),
            ];
        }

        if (count($heroImages) > 10) {
            return $this->error('Maksimal 10 gambar hero yang dapat disimpan.', 422);
        }

        $hero['alt_text'] = $request->input('hero_alt_text', $hero['alt_text'] ?? 'Iklan HousePoint');
        $hero['images'] = array_map(fn ($image) => [
            'image_path' => $image['image_path'],
            'alt_text' => $hero['alt_text'],
        ], $heroImages);
        unset($hero['image_path']);

        $contactGmapsUrl = $request->input('contact_gmaps_url');
        $contactGmapsQuery = $this->googleMapsQueryFromUrl($contactGmapsUrl);

        $content->update([
            'branding' => [
                'brand_name' => $request->input('brand_name', $branding['brand_name'] ?? 'HOUSEPOINT'),
                'logo_alt_text' => $request->input('logo_alt_text', $branding['logo_alt_text'] ?? 'HousePoint'),
                'header_logo_path' => $branding['header_logo_path'] ?? null,
                'footer_logo_path' => $branding['footer_logo_path'] ?? null,
                'auth_logo_path' => $branding['auth_logo_path'] ?? null,
            ],
            'hero' => $hero,
            'footer' => [
                'description' => $request->input('footer_description'),
                'services' => array_values(array_filter($request->input('footer_services', []))),
                'address' => $request->input('footer_address'),
                'phone' => $request->input('footer_phone'),
                'email' => $request->input('footer_email'),
            ],
            'about' => [
                'description' => $request->input('about_description'),
                'vision' => $request->input('about_vision'),
                'mission' => $request->input('about_mission'),
                'about_logo_path' => $about['about_logo_path'] ?? null,
                'features_title' => $request->input('features_title'),
                'features_subtitle' => $request->input('features_subtitle'),
                'features' => $this->normalizeFeatures($request->input('features', [])),
            ],
            'contact' => [
                'address' => $request->input('contact_address'),
                'email' => $request->input('contact_email'),
                'phone' => $request->input('contact_phone'),
                'operational_hours' => $request->input('contact_operational_hours'),
                'gmaps_url' => $contactGmapsUrl,
                'gmaps_query' => $contactGmapsQuery ?: $request->input('contact_address'),
            ],
            'updated_by' => $request->user()->id,
        ]);

        return $this->success(new WebsiteContentResource($content->fresh()), 'Konten website berhasil diperbarui.');
    }

    private function content(): WebsiteContent
    {
        return WebsiteContent::query()->firstOrCreate([]);
    }

    private function currentHeroImages(array $hero): array
    {
        $images = $hero['images'] ?? [];

        if (empty($images) && ! empty($hero['image_path'])) {
            $images = [[
                'image_path' => $hero['image_path'],
                'alt_text' => $hero['alt_text'] ?? 'Iklan HousePoint',
            ]];
        }

        return array_values(array_filter(
            $images,
            fn ($image) => ! empty($image['image_path'])
        ));
    }

    private function syncLogoSlot(
        UpdateWebsiteContentRequest $request,
        array $branding,
        string $fileField,
        string $removeField,
        string $pathKey
    ): array {
        $existingPath = $branding[$pathKey] ?? null;

        if ($request->boolean($removeField) && $existingPath) {
            Storage::disk('r2_public')->delete($existingPath);
            $branding[$pathKey] = null;
        }

        if ($request->hasFile($fileField)) {
            if ($existingPath) {
                Storage::disk('r2_public')->delete($existingPath);
            }

            $branding[$pathKey] = $request->file($fileField)->store(self::BRANDING_DIR, 'r2_public');
        }

        return $branding;
    }

    private function normalizeFeatures(array $features): array
    {
        return collect($features)
            ->take(4)
            ->map(fn ($feature) => [
                'title' => $feature['title'] ?? '',
                'desc' => $feature['desc'] ?? '',
                'icon' => $feature['icon'] ?? 'search',
            ])
            ->filter(fn ($feature) => trim($feature['title']) !== '' || trim($feature['desc']) !== '')
            ->values()
            ->all();
    }

    private function googleMapsQueryFromUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $expandedUrl = $this->expandGoogleMapsUrl($url);
        $decodedUrl = urldecode($expandedUrl);

        foreach ([
            '/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/',
            '/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/',
            '/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/',
        ] as $pattern) {
            if (preg_match($pattern, $decodedUrl, $matches)) {
                return "{$matches[1]},{$matches[2]}";
            }
        }

        $parts = parse_url($decodedUrl);
        if (! empty($parts['query'])) {
            parse_str($parts['query'], $query);
            if (! empty($query['q'])) {
                return is_array($query['q']) ? null : $query['q'];
            }
            if (! empty($query['query'])) {
                return is_array($query['query']) ? null : $query['query'];
            }
        }

        if (preg_match('/\/place\/([^\/@?]+)/', $decodedUrl, $matches)) {
            return str_replace('+', ' ', $matches[1]);
        }

        return null;
    }

    private function expandGoogleMapsUrl(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (! in_array($host, ['maps.app.goo.gl', 'goo.gl'], true)) {
            return $url;
        }

        try {
            $currentUrl = $url;

            for ($i = 0; $i < 5; $i++) {
                $response = Http::withOptions(['allow_redirects' => false])
                    ->timeout(5)
                    ->get($currentUrl);

                $location = $response->header('Location');
                if (! $location) {
                    break;
                }

                if (str_starts_with($location, '/')) {
                    $scheme = parse_url($currentUrl, PHP_URL_SCHEME) ?: 'https';
                    $currentHost = parse_url($currentUrl, PHP_URL_HOST);
                    $location = "{$scheme}://{$currentHost}{$location}";
                }

                $currentUrl = $location;

                if (! in_array(parse_url($currentUrl, PHP_URL_HOST), ['maps.app.goo.gl', 'goo.gl'], true)) {
                    return $currentUrl;
                }
            }
        } catch (\Throwable) {
            return $url;
        }

        return $url;
    }
}
