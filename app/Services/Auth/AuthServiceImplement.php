<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\User\UserRepository;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Itmm\EasyRepository\Service;

class AuthServiceImplement extends Service
{
    public function __construct(protected UserRepository $mainRepository) {}

    public function attempt(array $credentials, bool $remember = false): bool
    {
        return Auth::attempt($credentials, $remember);
    }

    public function register(array $data): User
    {
        return $this->mainRepository->createAccount($data);
    }

    /**
     * Kirim tautan reset. Status selalu dianggap terkirim ke pemanggil
     * supaya keberadaan email tidak bisa ditebak (anti user enumeration).
     */
    public function sendResetLink(string $email): void
    {
        Password::sendResetLink(['email' => $email]);
    }

    /** @return bool true bila token valid dan kata sandi diperbarui. */
    public function resetPassword(array $data): bool
    {
        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();
            event(new PasswordReset($user));
        });

        return $status === Password::PASSWORD_RESET;
    }
}
