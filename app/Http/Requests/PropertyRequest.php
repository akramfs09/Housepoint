<?php

namespace App\Http\Requests;

use App\Models\City;
use Illuminate\Foundation\Http\FormRequest;

class PropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Informasi Dasar
            'title'          => 'required|string|max:255',
            'description'    => 'required|string|max:5000',
            'type'           => 'required|in:rumah,apartemen,ruko,tanah,gedung',
            'status_jual'    => 'required|in:dijual,terjual',
            'price'          => 'required|numeric|min:1',
            'land_area'      => 'nullable|integer|min:1',
            'building_area'  => 'nullable|integer|min:1',
            'tahun_dibangun' => 'nullable|integer|min:1900|max:' . date('Y'),

            // Lokasi
            'province'       => 'required|string|max:100',
            'city'           => 'required|string|max:100',
            'province_id'    => 'nullable|integer|exists:provinces,id',
            'city_id'        => 'nullable|integer|exists:cities,id',
            'address'        => 'required|string|max:500',
            'gmaps_url'      => 'nullable|url|max:1000',

            // Detail Bangunan
            'bedrooms'       => 'nullable|integer|min:0',
            'bathrooms'      => 'nullable|integer|min:0',
            'garasi'         => 'nullable|integer|min:0',
            'jumlah_lantai'  => 'nullable|integer|min:1',
            'sumber_air'     => 'nullable|in:pdam,sumur_bor,sumur_gali',

            // Fasilitas
            'fasilitas'      => 'nullable|array',
            'fasilitas.*'    => 'in:ac,wifi,kolam_renang,taman,cctv,security,gym,balkon,furnished,water_heater',

            // Upload Foto
            'image_main'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'images'         => 'nullable|array|max:10',
            'images.*'       => 'image|mimes:jpg,jpeg,png,webp|max:5120',

            // Video
            'video_type'     => 'nullable|in:upload,youtube',
            'video_file'     => 'nullable|required_if:video_type,upload|file|mimes:mp4|max:102400',
            'youtube_url'    => 'nullable|required_if:video_type,youtube|url|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'tahun_dibangun.max'        => 'Tahun dibangun tidak boleh melebihi tahun sekarang.',
            'video_file.required_if'    => 'File video wajib diunggah jika memilih metode upload.',
            'youtube_url.required_if'   => 'URL YouTube wajib diisi jika memilih metode link.',
            'gmaps_url.url'              => 'Link Google Maps harus berupa URL yang valid.',
            'city_id.exists'             => 'Kota yang dipilih tidak valid.',
            'province_id.exists'         => 'Provinsi yang dipilih tidak valid.',
            'city_id.same'               => 'Kota harus sesuai dengan provinsi yang dipilih.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $provinceId = $this->input('province_id');
            $cityId = $this->input('city_id');

            if (! $provinceId || ! $cityId) {
                return;
            }

            $city = City::find($cityId);
            if (! $city || (int) $city->province_id !== (int) $provinceId) {
                $validator->errors()->add('city_id', 'Kota harus sesuai dengan provinsi yang dipilih.');
            }
        });
    }
}
