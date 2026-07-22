<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Endpoint publik, tidak perlu autentikasi
    }

    public function rules(): array
    {
        return [
            'search'        => 'nullable|string|max:255',
            'type'          => 'nullable|in:rumah,apartemen,villa,ruko,tanah,gedung',
            'city'          => 'nullable|string|max:100',
            'province'      => 'nullable|string|max:100',
            'city_id'       => 'nullable|integer|exists:cities,id',
            'province_id'   => 'nullable|integer|exists:provinces,id',
            'min_price'     => 'nullable|numeric|min:0',
            'max_price'     => 'nullable|numeric|min:0',
            'bedrooms'      => 'nullable|integer|min:0',
            'sort_by'       => 'nullable|in:latest,price_asc,price_desc,popular',
            'per_page'      => 'nullable|integer|min:1|max:50',
            'sections_only' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'sort_by.in' => 'Sorting harus salah satu dari: latest, price_asc, price_desc, popular',
            'per_page.max' => 'Maksimal 50 properti per halaman',
        ];
    }
}
