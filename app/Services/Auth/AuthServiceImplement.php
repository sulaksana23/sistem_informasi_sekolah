<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\User\UserRepository;
use Illuminate\Support\Facades\Auth;
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
}
