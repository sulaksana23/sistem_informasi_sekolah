<?php

namespace App\Repositories\AuditLog;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Itmm\EasyRepository\Repository;

interface AuditLogRepository extends Repository
{
    public function paginate(?string $type, int $perPage): LengthAwarePaginator;
}
