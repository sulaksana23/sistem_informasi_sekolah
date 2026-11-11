<?php

namespace App\Enums;

enum SchoolRole: string
{
    case ADMIN = 'admin';
    case STAFF = 'staff';
    case TEACHER = 'teacher';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrator',
            self::STAFF => 'Tata Usaha',
            self::TEACHER => 'Guru',
        };
    }
}
