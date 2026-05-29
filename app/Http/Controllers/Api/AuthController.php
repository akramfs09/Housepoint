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
use App\Services\AuthService;
use Illuminate\Http\Request;

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
}