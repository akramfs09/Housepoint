<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSearchHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_text' => 'nullable|string|max:255',
            'filters' => 'nullable|array',
            'filters.search' => 'nullable|string|max:255',
            'filters.type' => 'nullable|in:rumah,apartemen,villa,tanah,ruko,gedung',
            'filters.city' => 'nullable|string|max:100',
            'filters.province' => 'nullable|string|max:100',
            'filters.city_id' => 'nullable|integer|exists:cities,id',
            'filters.province_id' => 'nullable|integer|exists:provinces,id',
            'filters.min_price' => 'nullable|numeric|min:0',
            'filters.max_price' => 'nullable|numeric|min:0',
            'filters.bedrooms' => 'nullable|integer|min:0',
            'filters.sort_by' => 'nullable|in:latest,price_asc,price_desc,popular',
            'result_count' => 'nullable|integer|min:0',
        ];
    }
}
