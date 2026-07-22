<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SellerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ktp' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'selfie' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'nama_agen' => ['nullable', 'string', 'max:255'],
            'no_hp' => ['required', 'string', 'max:20', 'regex:/^(\+62|62|0)[0-9]{8,13}$/'],
            'alamat' => ['required', 'string', 'max:500'],
            'foto_profil' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'foto_agen' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'deskripsi' => ['nullable', 'string', 'max:500'],
            'syarat_ketentuan' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'syarat_ketentuan.accepted' => 'Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.',
        ];
    }
}
