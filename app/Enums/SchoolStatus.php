<?php

namespace App\Enums;

enum SchoolStatus: string
{
    case NEGERI = 'negeri';
    case SWASTA = 'swasta';

    public function label(): string
    {
        return match ($this) {
            self::NEGERI => 'Negeri',
            self::SWASTA => 'Swasta',
        };
    }

    /** @return list<array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $case): array => ['value' => $case->value, 'label' => $case->label()],
            self::cases(),
        );
    }
}
