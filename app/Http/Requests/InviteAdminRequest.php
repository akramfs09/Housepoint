<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role?->nama_role === 'super_admin';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,super_admin',
            'divisi' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
        ];
    }
}