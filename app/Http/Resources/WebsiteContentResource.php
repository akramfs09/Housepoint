<?php

namespace App\Http\Resources;

use App\Support\PublicStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebsiteContentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $content = $this->resource ?: null;
        $hero = $content?->hero ?? [];
        $branding = $content?->branding ?? [];
        $footer = $content?->footer ?? [];
        $about = $content?->about ?? [];
        $contact = $content?->contact ?? [];
        $heroImages = $this->heroImages($hero);

        return [
            'branding' => [
                'brand_name' => $branding['brand_name'] ?? 'HOUSEPOINT',
                'logo_alt_text' => $branding['logo_alt_text'] ?? 'HousePoint',
                'header_logo_path' => $branding['header_logo_path'] ?? null,
                'header_logo_url' => ! empty($branding['header_logo_path'])
                    ? PublicStorageUrl::make($branding['header_logo_path'])
                    : null,
                'footer_logo_path' => $branding['footer_logo_path'] ?? null,
                'footer_logo_url' => ! empty($branding['footer_logo_path'])
                    ? PublicStorageUrl::make($branding['footer_logo_path'])
                    : null,
                'auth_logo_path' => $branding['auth_logo_path'] ?? null,
                'auth_logo_url' => ! empty($branding['auth_logo_path'])
                    ? PublicStorageUrl::make($branding['auth_logo_path'])
                    : null,
            ],
            'hero' => [
                'images' => $heroImages,
                'image_path' => $heroImages[0]['image_path'] ?? null,
                'image_url' => $heroImages[0]['image_url'] ?? null,
                'alt_text' => $hero['alt_text'] ?? 'Iklan HousePoint',
            ],
            'footer' => [
                'description' => $footer['description'] ?? 'HousePoint adalah platform katalog properti terpercaya yang membantu Anda menemukan hunian dan aset properti terbaik dengan mudah dan aman.',
                'services' => $footer['services'] ?? ['Beli Properti', 'Jual Properti', 'Sewa Villa', 'Management Asset'],
                'address' => $footer['address'] ?? 'Jl. Magelang Km 16, Surognatan, Mororejo Kidul, Tempel, Sleman',
                'phone' => $footer['phone'] ?? '+62 8185 1234',
                'email' => $footer['email'] ?? 'housepoint.id@gmail.com',
            ],
            'about' => [
                'description' => $about['description'] ?? 'HousePoint adalah platform properti yang membantu pembeli, penyewa, dan agen menemukan peluang properti secara lebih mudah, aman, dan transparan.',
                'vision' => $about['vision'] ?? 'Menjadi platform properti terpercaya yang menghubungkan masyarakat dengan hunian dan aset terbaik di Indonesia.',
                'mission' => $about['mission'] ?? 'Menyediakan informasi properti yang jelas, mempertemukan pengguna dengan agen terpercaya, dan mendukung proses pencarian properti yang nyaman.',
                'about_logo_path' => $about['about_logo_path'] ?? null,
                'about_logo_url' => ! empty($about['about_logo_path'])
                    ? PublicStorageUrl::make($about['about_logo_path'])
                    : null,
                'features_title' => $about['features_title'] ?? 'Mengapa Memilih Kami?',
                'features_subtitle' => $about['features_subtitle'] ?? 'HousePoint menghadirkan pengalaman pencarian properti yang modern, nyaman, dan terpercaya.',
                'features' => $about['features'] ?? [
                    ['title' => '1000+', 'desc' => 'PROPERTI', 'icon' => 'home'],
                    ['title' => '500+', 'desc' => 'PENGGUNA', 'icon' => 'search'],
                    ['title' => '100+', 'desc' => 'AGEN PROPERTI', 'icon' => 'zap'],
                    ['title' => '24/7', 'desc' => 'AKSES PLATFORM', 'icon' => 'shield'],
                ],
            ],
            'contact' => [
                'address' => $contact['address'] ?? 'Jl. Magelang Km 16, Surognatan, Mororejo Kidul, Tempel, Sleman',
                'email' => $contact['email'] ?? 'housepoint.id@gmail.com',
                'phone' => $contact['phone'] ?? '+62 8185 1234',
                'operational_hours' => $contact['operational_hours'] ?? 'Senin - Jumat, 09.00 - 17.00 WIB',
                'gmaps_url' => $contact['gmaps_url'] ?? 'https://maps.google.com/maps?q=Jl.%20Magelang%20Km%2016%2C%20Sleman',
                'gmaps_query' => $contact['gmaps_query'] ?? ($contact['address'] ?? 'Jl. Magelang Km 16, Sleman'),
            ],
            'updated_at' => $content?->updated_at,
        ];
    }

    private function heroImages(array $hero): array
    {
        $images = $hero['images'] ?? [];

        if (empty($images) && ! empty($hero['image_path'])) {
            $images = [[
                'image_path' => $hero['image_path'],
                'alt_text' => $hero['alt_text'] ?? 'Iklan HousePoint',
            ]];
        }

        return collect($images)
            ->filter(fn ($image) => ! empty($image['image_path']))
            ->take(10)
            ->map(fn ($image) => [
                'image_path' => $image['image_path'],
                'image_url' => PublicStorageUrl::make($image['image_path']),
                'alt_text' => $image['alt_text'] ?? ($hero['alt_text'] ?? 'Iklan HousePoint'),
            ])
            ->values()
            ->all();
    }
}
