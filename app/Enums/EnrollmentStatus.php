<?php

namespace App\Enums;

enum EnrollmentStatus: string
{
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case TRANSFERRED = 'transferred';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktif',
            self::COMPLETED => 'Selesai',
            self::TRANSFERRED => 'Pindah',
        };
    }
}
