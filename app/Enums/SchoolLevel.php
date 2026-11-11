<?php

namespace App\Enums;

enum SchoolLevel: string
{
    case TK = 'tk';
    case SD = 'sd';
    case SMP = 'smp';
    case SMA = 'sma';
    case SMK = 'smk';
    case SLB = 'slb';

    public function label(): string
    {
        return match ($this) {
            self::TK => 'TK / PAUD',
            self::SD => 'SD / MI',
            self::SMP => 'SMP / MTs',
            self::SMA => 'SMA / MA',
            self::SMK => 'SMK / MAK',
            self::SLB => 'SLB',
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
