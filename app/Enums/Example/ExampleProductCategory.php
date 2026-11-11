<?php

namespace App\Enums\Example;

/** Kategori product modul acuan — kolom kategori tetap memakai backed enum (BACKEND-STANDARD.md §9). */
enum ExampleProductCategory: string
{
    case BEVERAGE = 'Beverage';
    case SNACK = 'Snack';
    case HOUSEHOLD = 'Household';
    case PERSONAL_CARE = 'Personal Care';
    case FROZEN = 'Frozen';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
