<?php

namespace App\Jobs;

use App\Mail\OtpMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOtpEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $email;
    public string $otpCode;

    public $tries = 3;

    public function __construct(string $email, string $otpCode)
    {
        $this->email = $email;
        $this->otpCode = $otpCode;
    }

    public function handle(): void
    {
        Mail::to($this->email)->send(new OtpMail($this->otpCode));
    }

    public function backoff(): array
    {
        return [10, 30, 60];
    }
}