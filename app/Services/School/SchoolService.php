<?php

namespace App\Services\School;

use Illuminate\Support\Facades\Facade;

class SchoolService extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SchoolServiceImplement::class;
    }
}
