<?php

namespace App\Services\AuditLog;

use App\Repositories\AuditLog\AuditLogRepository;
use Itmm\EasyRepository\Service;

class AuditLogServiceImplement extends Service
{
    public const TYPES = ['grade' => 'Nilai', 'attendance' => 'Absensi'];

    public function __construct(protected AuditLogRepository $mainRepository) {}

    public function page(?string $type): array
    {
        $page = $this->mainRepository->paginate($type, 25);

        return [
            'logs' => $page->items(),
            'pagination' => [
                'current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'total' => $page->total(), 'per_page' => $page->perPage(),
            ],
            'selected_type' => $type,
            'types' => collect(self::TYPES)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values()->all(),
        ];
    }
}
