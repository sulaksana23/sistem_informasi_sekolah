<?php

namespace App\Services\AuditLog;

use Illuminate\Support\Facades\Facade;

class AuditLogService extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return AuditLogServiceImplement::class;
    }
}
