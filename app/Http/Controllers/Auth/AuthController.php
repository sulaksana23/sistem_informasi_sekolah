<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('auth/pages/AuthLogin');
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->safe()->only(['email', 'password']);
        $remember = (bool) ($request->validated()['remember'] ?? false);

        if (! AuthService::attempt($credentials, $remember)) {
            return back()
                ->withErrors(['email' => 'Email atau kata sandi tidak cocok.'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'))
            ->with('success', 'Berhasil masuk. Selamat datang kembali.');
    }

    public function showRegistration(): Response
    {
        return Inertia::render('auth/pages/AuthRegister');
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = AuthService::register($request->safe()->only(['name', 'email', 'password']));

        auth()->login($user);
        $request->session()->regenerate();

        return to_route('dashboard')->with('success', 'Akun berhasil dibuat.');
    }

    public function logout(Request $request): RedirectResponse
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login')->with('success', 'Anda sudah keluar.');
    }
}
