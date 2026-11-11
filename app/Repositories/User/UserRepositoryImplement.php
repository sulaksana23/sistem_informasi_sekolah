<?php

namespace App\Repositories\User;

use App\Models\User;
use Itmm\EasyRepository\Implementations\Eloquent;

class UserRepositoryImplement extends Eloquent implements UserRepository
{
    public function __construct(protected User $model) {}

    public function createAccount(array $data): User
    {
        return $this->model->newQuery()->create($data);
    }
}
