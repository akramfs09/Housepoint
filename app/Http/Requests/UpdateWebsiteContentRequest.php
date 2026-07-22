<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_name' => 'nullable|string|max:120',
            'logo_alt_text' => 'nullable|string|max:255',

            'header_logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'footer_logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'auth_logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'remove_header_logo' => 'nullable|boolean',
            'remove_footer_logo' => 'nullable|boolean',
            'remove_auth_logo' => 'nullable|boolean',

            'hero_images' => 'nullable|array|max:10',
            'hero_images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'removed_hero_images' => 'nullable|array',
            'removed_hero_images.*' => 'nullable|string|max:500',
            'hero_alt_text' => 'nullable|string|max:255',

            'footer_description' => 'nullable|string|max:2000',
            'footer_services' => 'nullable|array',
            'footer_services.*' => 'nullable|string|max:120',
            'footer_address' => 'nullable|string|max:1000',
            'footer_phone' => 'nullable|string|max:50',
            'footer_email' => 'nullable|email|max:255',

            'about_description' => 'nullable|string|max:5000',
            'about_vision' => 'nullable|string|max:3000',
            'about_mission' => 'nullable|string|max:3000',
            'about_logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'remove_about_logo' => 'nullable|boolean',
            'features_title' => 'nullable|string|max:255',
            'features_subtitle' => 'nullable|string|max:500',
            'features' => 'nullable|array|max:4',
            'features.*.title' => 'nullable|string|max:120',
            'features.*.desc' => 'nullable|string|max:300',
            'features.*.icon' => 'nullable|in:search,home,zap,shield',

            'contact_address' => 'nullable|string|max:1000',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_operational_hours' => 'nullable|string|max:255',
            'contact_gmaps_url' => 'nullable|url|max:1000',
        ];
    }
}
