<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role?->nama_role === 'super_admin';
    }

    public function rules(): array
    {
        $adminId = $this->route('admin')->id;

        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $adminId,
            'role' => 'sometimes|in:admin,super_admin',
            'divisi' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
        ];
    }
}