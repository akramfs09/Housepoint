<?php

namespace App\Services;

use App\Jobs\SendOtpEmail;
use App\Models\Otp;
use App\Models\Role;
use App\Models\User;
use App\Models\CustomerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function registerStep1(array $data): void
    {
        $data['nama_lengkap'] = strip_tags($data['nama_lengkap']);
        $data['no_hp'] = isset($data['no_hp']) ? strip_tags($data['no_hp']) : null;

        $otpCode = random_int(100000, 999999);

        Otp::where('email', $data['email'])->where('purpose', 'register')->delete();

        Otp::create([
            'email' => $data['email'],
            'token' => Hash::make($otpCode),
            'purpose' => 'register',
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'register_data' => [
                'nama_lengkap' => $data['nama_lengkap'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'no_hp' => $data['no_hp'] ?? null,
            ],
            'created_at' => now(),
        ]);

        SendOtpEmail::dispatch($data['email'], $otpCode);
    }

    public function verifyOtp(Request $request, array $data): User
    {
        $otpRecord = Otp::where('email', $data['email'])
            ->where('purpose', 'register')
            ->lockForUpdate()
            ->first();

        if (!$otpRecord || now()->greaterThan($otpRecord->expires_at)) {
            throw new \Exception('OTP tidak ditemukan atau kadaluarsa.');
        }

        if ($otpRecord->attempts >= 5) {
            $otpRecord->delete();
            throw new \Exception('Terlalu banyak percobaan.');
        }

        if (!Hash::check($data['otp'], $otpRecord->token)) {
            $otpRecord->increment('attempts');
            throw new \Exception('Kode OTP salah.');
        }

        $registerData = $otpRecord->register_data;
        if (!$registerData) {
            throw new \Exception('Data registrasi tidak ditemukan.');
        }

        $user = null;

        DB::transaction(function () use ($registerData, $otpRecord, &$user) {
            $roleCustomer = Role::where('nama_role', 'customer')->first();

            // 🔧 Buat user tanpa role_id di fillable, lalu set manual
            $user = new User([
                'name' => $registerData['nama_lengkap'] ?? explode('@', $registerData['email'])[0],
                'email' => $registerData['email'],
                'password' => $registerData['password'],
                'email_verified_at' => now(),
            ]);
            $user->role_id = $roleCustomer->id;
            $user->save();

            // Buat customer profile — user_id tidak di‑fillable, jadi set manual
            $profile = new CustomerProfile([
                'nama_lengkap' => $registerData['nama_lengkap'] ?? '',
                'no_hp'        => $registerData['no_hp'] ?? null,
            ]);
            $profile->user_id = $user->id;
            $profile->save();

            $otpRecord->used_at = now();
            $otpRecord->save();
        });

        // Buat token Sanctum baru
        $token = $user->createToken('auth_token')->plainTextToken;

        // Simpan token di user untuk nanti dikembalikan melalui controller
        $user->currentAccessToken = $token;

        return $user;
    }

    public function login(Request $request, array $data): User
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            usleep(random_int(100000, 300000));
            throw new \Exception('Email atau Password salah.');
        }

        if ($user->is_banned) {
            throw new \Exception('Akun Anda telah diblokir.');
        }

        // Buat token Sanctum baru
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->currentAccessToken = $token;

        return $user;
    }

    public function logout(Request $request): void
    {
        $user = $request->user();
        if ($user) {
            $user->tokens()->delete();
        }
    }

    public function forgotPassword(array $data): void
    {
        usleep(random_int(100000, 300000));

        $otpCode = random_int(100000, 999999);

        Otp::where('email', $data['email'])->where('purpose', 'reset_password')->delete();

        Otp::create([
            'email' => $data['email'],
            'token' => Hash::make($otpCode),
            'purpose' => 'reset_password',
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'created_at' => now(),
        ]);

        SendOtpEmail::dispatch($data['email'], $otpCode);
    }

    public function resetPassword(array $data): void
    {
        $otpRecord = Otp::where('email', $data['email'])
            ->where('purpose', 'reset_password')
            ->first();

        if (!$otpRecord || now()->greaterThan($otpRecord->expires_at)) {
            throw new \Exception('OTP tidak ditemukan atau kadaluarsa.');
        }

        if (!Hash::check($data['otp'], $otpRecord->token)) {
            throw new \Exception('Kode OTP salah.');
        }

        User::where('email', $data['email'])->update([
            'password' => Hash::make($data['password']),
        ]);

        $otpRecord->used_at = now();
        $otpRecord->save();
    }

    public function resendOtp(array $data): void
    {
        $purpose = $data['purpose'] ?? 'register';
        $existing = Otp::where('email', $data['email'])
            ->where('purpose', $purpose)
            ->first();

        if ($existing && $existing->created_at && now()->diffInSeconds($existing->created_at) < 60) {
            throw new \Exception('Tunggu 60 detik sebelum mengirim ulang.');
        }

        $otpCode = random_int(100000, 999999);
        $registerData = $existing?->register_data;

        if ($purpose === 'register' && !$registerData) {
            throw new \Exception('Sesi registrasi tidak ditemukan. Silakan daftar ulang.');
        }

        Otp::where('email', $data['email'])->where('purpose', $purpose)->delete();

        Otp::create([
            'email' => $data['email'],
            'token' => Hash::make($otpCode),
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'register_data' => $purpose === 'register' ? $registerData : null,
            'created_at' => now(),
        ]);

        SendOtpEmail::dispatch($data['email'], $otpCode);
    }

    public function changePassword(Request $request, array $data): void
    {
        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            throw new \Exception('Password saat ini salah.');
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();

        // Hapus semua token lain, kecuali token yang sedang dipakai
        $currentToken = $request->user()->currentAccessToken();
        $user->tokens()->where('id', '!=', $currentToken->id)->delete();
    }
}
