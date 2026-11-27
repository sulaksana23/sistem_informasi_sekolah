<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    public function showForgot(): Response
    {
        return Inertia::render('auth/pages/AuthForgotPassword');
    }

    public function sendLink(ForgotPasswordRequest $request): RedirectResponse
    {
        AuthService::sendResetLink($request->validated('email'));

        return back()->with('success', 'Jika email terdaftar, tautan reset kata sandi sudah dikirim.');
    }

    public function showReset(Request $request, string $token): Response
    {
        return Inertia::render('auth/pages/AuthResetPassword', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function reset(ResetPasswordRequest $request): RedirectResponse
    {
        if (! AuthService::resetPassword($request->safe()->only(['token', 'email', 'password']))) {
            return back()->withErrors(['email' => 'Tautan reset tidak valid atau sudah kedaluwarsa.'])->onlyInput('email');
        }

        return to_route('login')->with('success', 'Kata sandi berhasil diperbarui. Silakan masuk.');
    }
}
