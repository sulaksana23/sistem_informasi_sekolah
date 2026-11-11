<?php

namespace App\Services\Tenancy;

use Illuminate\Support\Facades\Facade;

class TenantService extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return TenantServiceImplement::class;
    }
}
