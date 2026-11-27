<?php

namespace App\Services\Member;

use Illuminate\Support\Facades\Facade;

class MemberService extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return MemberServiceImplement::class;
    }
}
