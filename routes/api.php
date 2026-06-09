<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\AdminManagementController;
use App\Http\Controllers\Api\PublicPropertyController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

// ================================================
//  Lokasi (publik, untuk autocomplete)
// ================================================
Route::get('/locations/provinces', [LocationController::class, 'provinces']);
Route::get('/locations/cities', [LocationController::class, 'cities']);

// ================================================
//  Katalog Publik (tanpa autentikasi)
// ================================================
Route::get('/properties', [PublicPropertyController::class, 'index']);
Route::get('/properties/{slug}', [PublicPropertyController::class, 'show']);

// ================================================
//  Webhook Midtrans (tanpa autentikasi)
// ================================================
Route::post('/payment/notify', [PaymentController::class, 'handleNotification']);

// ================================================
//  Autentikasi
// ================================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'registerStep1'])
        ->middleware('throttle:register');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])
        ->middleware('throttle:verify-otp');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login');
    Route::post('/logout', [AuthController::class, 'logout'])
        ->middleware(['auth:sanctum', 'banned']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:reset-password');
    Route::post('/resend-otp', [AuthController::class, 'resendOtp'])
        ->middleware('throttle:resend-otp');
    Route::patch('/password', [AuthController::class, 'changePassword'])
        ->middleware(['auth:sanctum', 'banned']);
});

Route::get('/user', [AuthController::class, 'me'])
    ->middleware(['auth:sanctum', 'banned']);

// ================================================
//  Chat (Customer & Seller)
Route::middleware(['auth:sanctum', 'banned', 'role:customer,seller'])->prefix('chat')->group(function () {
    Route::post('/start', [ChatController::class, 'start']);
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::get('/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ChatController::class, 'send']);
    Route::patch('/conversations/{conversation}/read', [ChatController::class, 'markRead']);
    Route::patch('/conversations/{conversation}/archive', [ChatController::class, 'archive']);
    Route::patch('/conversations/{conversation}/unarchive', [ChatController::class, 'unarchive']);
});

// ================================================
//  Seller
// ================================================
Route::middleware(['auth:sanctum', 'banned'])->group(function () {
    Route::post('/seller/register', [SellerController::class, 'register'])
        ->middleware('role:customer');
    Route::get('/seller/status', [SellerController::class, 'status'])
        ->middleware(['role:customer,seller']);

    // Seller appeals
    Route::post('/seller/appeal', [SellerController::class, 'appeal'])
        ->middleware(['role:customer,seller']);
    Route::get('/seller/appeal-status', [SellerController::class, 'appealStatus'])
        ->middleware(['role:customer,seller']);

    Route::middleware(['role:seller', 'approved_seller'])->group(function () {
        Route::post('/seller/properties', [SellerController::class, 'store']);
        Route::put('/seller/properties/{property}', [SellerController::class, 'update']);
        Route::delete('/seller/properties/{property}', [SellerController::class, 'destroy']);
        Route::get('/seller/properties', [SellerController::class, 'myProperties']);
        Route::patch('/properties/{property}/submit', [SellerController::class, 'submit']);
        
        // Pembayaran
        Route::post('/seller/properties/{property}/pay', [SellerController::class, 'initiatePayment']);
        
        // Publish properti setelah bayar
        Route::patch('/seller/properties/{property}/publish', [SellerController::class, 'publishProperty']);
    });
});

// ================================================
//  Admin
// ================================================
Route::middleware(['auth:sanctum', 'banned', 'role:admin,super_admin'])->group(function () {
    Route::get('/admin/seller-verifications', [AdminController::class, 'sellerVerifications']);
    Route::get('/admin/seller-verifications/{seller}', [AdminController::class, 'showSeller']);
    Route::patch('/admin/seller-verifications/{seller}/approve', [AdminController::class, 'approveSeller']);
    Route::patch('/admin/seller-verifications/{seller}/reject', [AdminController::class, 'rejectSeller']);

    // Moderasi Properti
    Route::get('/admin/properties/pending', [AdminController::class, 'propertyVerifications']);
    Route::patch('/properties/{property}/approve', [AdminController::class, 'approveProperty']);
    Route::patch('/properties/{property}/reject', [AdminController::class, 'rejectProperty']);

    // User Management
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [AdminController::class, 'listUsers']);
        Route::patch('/{user}/ban', [AdminController::class, 'banUser']);
        Route::patch('/{user}/unban', [AdminController::class, 'unbanUser']);
    });

    // Seller Appeals (Admin)
    Route::prefix('admin/seller/appeals')->group(function () {
        Route::get('/', [AdminController::class, 'listAppeals']);
        Route::patch('/{appeal}/approve', [AdminController::class, 'approveAppeal']);
        Route::patch('/{appeal}/reject', [AdminController::class, 'rejectAppeal']);
    });
    Route::get('/admin/activity-logs', [AdminController::class, 'activityLogs']);
});

// ================================================
//  Admin Management (Super Admin only)
// ================================================
Route::middleware(['auth:sanctum', 'banned', 'role:super_admin'])->prefix('admin/admins')->group(function () {
    Route::get('/', [AdminManagementController::class, 'index']);
    Route::get('/audit-logs', [AdminManagementController::class, 'auditLogs']);
    Route::get('/{admin}', [AdminManagementController::class, 'show']);
    Route::post('/', [AdminManagementController::class, 'store']);
    Route::put('/{admin}', [AdminManagementController::class, 'update']);
    Route::patch('/{admin}/deactivate', [AdminManagementController::class, 'deactivate']);
    Route::patch('/{admin}/reactivate', [AdminManagementController::class, 'reactivate']);
    Route::delete('/{admin}', [AdminManagementController::class, 'destroy']);
});