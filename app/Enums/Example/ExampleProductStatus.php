<?php

namespace App\Enums\Example;

/**
 * Status product modul acuan /example/products. Nilainya dicerminkan sebagai union string
 * `ExampleProductStatus` di resources/js/types/example/product.ts (BACKEND-STANDARD.md §9).
 */
enum ExampleProductStatus: string
{
    case DRAFT = 'draft';
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
        };
    }
}
