<?php

namespace App\Enums;

enum StudentStatus: string
{
    case ACTIVE = 'active';
    case GRADUATED = 'graduated';
    case TRANSFERRED = 'transferred';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktif',
            self::GRADUATED => 'Lulus',
            self::TRANSFERRED => 'Pindah',
            self::INACTIVE => 'Tidak aktif',
        };
    }
}
