<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case PRESENT = 'present';
    case SICK = 'sick';
    case EXCUSED = 'excused';
    case ABSENT = 'absent';

    public function label(): string
    {
        return match ($this) {
            self::PRESENT => 'Hadir',
            self::SICK => 'Sakit',
            self::EXCUSED => 'Izin',
            self::ABSENT => 'Alpa',
        };
    }
}
