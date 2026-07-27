<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\VerifyOtpRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\ResendOtpRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponse;
use App\Models\CustomerProfile;
use App\Models\Role;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    use ApiResponse;

    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function registerStep1(RegisterRequest $request)
    {
        $this->authService->registerStep1($request->validated());
        return $this->success(null, 'Kode OTP telah dikirim ke email Anda.');
    }

    public function verifyOtp(VerifyOtpRequest $request)
    {
        try {
            $user = $this->authService->verifyOtp($request, $request->validated());
            $token = $user->currentAccessToken; // token disimpan di property sementara
            return $this->success([
                'user' => new UserResource($user),
                'token' => $token,
            ], 'Registrasi berhasil.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function checkOtp(VerifyOtpRequest $request)
    {
        try {
            $this->authService->checkOtp($request->validated());
            return $this->success(null, 'Kode OTP valid.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $user = $this->authService->login($request, $request->validated());
            $token = $user->currentAccessToken;
            return $this->success([
                'user' => new UserResource($user),
                'token' => $token,
            ], 'Login berhasil.');
        } catch (\Exception $e) {
            $code = $e->getMessage() === 'Akun Anda telah diblokir.' ? 403 : 401;
            return $this->error($e->getMessage(), $code);
        }
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request);
        return $this->success(null, 'Logout berhasil.');
    }

    public function me(Request $request)
    {
        return $this->success(new UserResource($request->user()));
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $this->authService->forgotPassword($request->validated());
        return $this->success(null, 'Kode OTP reset password telah dikirim ke email Anda.');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        try {
            $this->authService->resetPassword($request->validated());
            return $this->success(null, 'Password berhasil diubah.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function resendOtp(ResendOtpRequest $request)
    {
        try {
            $this->authService->resendOtp($request->validated());
            return $this->success(null, 'Kode OTP baru telah dikirim.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 429);
        }
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        try {
            $this->authService->changePassword($request, $request->validated());
            return $this->success(null, 'Password berhasil diubah. Perangkat lain akan logout.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($request->password, $request->user()->password)) {
            return $this->error('Kata sandi saat ini salah.', 422);
        }

        return $this->success(null, 'Kata sandi saat ini benar.');
    }

    /**
     * Redirect pengguna ke halaman login Google.
     */
    public function googleRedirect()
    {
        if (!config('services.google.client_id')) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=google_not_configured');
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle callback dari Google setelah user mengizinkan akses.
     * - Jika email sudah ada → link google_id ke akun yang ada
     * - Jika email baru → buat akun customer baru
     */
    public function googleCallback()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect($frontendUrl . '/login?error=google_failed');
        }

        // Cari user berdasarkan google_id atau email
        $user = User::where('google_id', $googleUser->id)
            ->orWhere('email', $googleUser->email)
            ->first();

        if ($user) {
            // Akun sudah ada → pastikan google_id tersimpan (linking)
            if (!$user->google_id) {
                $user->google_id = $googleUser->id;
                $user->save();
            }

            if ($user->is_banned) {
                return redirect($frontendUrl . '/login?error=banned');
            }
        } else {
            // Akun belum ada → buat customer baru
            $roleCustomer = Role::where('nama_role', 'customer')->first();

            $user = new User([
                'name'             => $googleUser->name,
                'email'            => $googleUser->email,
                'google_id'        => $googleUser->id,
                'email_verified_at' => now(),
            ]);
            $user->role_id = $roleCustomer->id;
            $user->save();

            // Buat customer profile
            $profile = new CustomerProfile([
                'nama_lengkap' => $googleUser->name,
            ]);
            $profile->user_id = $user->id;
            $profile->save();
        }

        // Issue Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect ke frontend dengan token
        return redirect($frontendUrl . '/auth/google/callback?token=' . $token);
    }
}