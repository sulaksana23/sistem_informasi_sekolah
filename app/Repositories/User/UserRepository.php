<?php

namespace App\Repositories\User;

use App\Models\User;
use Itmm\EasyRepository\Repository;

interface UserRepository extends Repository
{
    public function createAccount(array $data): User;
}
