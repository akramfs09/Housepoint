<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: system-ui, sans-serif; background: #f3f4f6; padding: 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: #2563eb; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏠 HousePoint</h1>
        </div>
        <div style="padding: 24px;">
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">Kode OTP Anda</h2>
            <p style="color: #4b5563; font-size: 14px;">
                Gunakan kode OTP berikut untuk verifikasi akun Anda:
            </p>
            <div style="background: #eff6ff; border: 1px dashed #93c5fd; border-radius: 8px; padding: 12px; text-align: center; margin: 16px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">{{ $otpCode }}</span>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">
                Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.
            </p>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © {{ date('Y') }} HousePoint. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>