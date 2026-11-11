<?php

namespace App\Services\ExampleProduct;

use Illuminate\Support\Facades\Facade;

/**
 * Facade Service modul acuan — Controller/Job/Command memanggil `ExampleProductService::method()`,
 * tidak pernah `new ExampleProductServiceImplement` (docs/standard/BACKEND-STANDARD.md §7).
 *
 * @see ExampleProductServiceImplement
 */
class ExampleProductService extends Facade
{
    protected static function getFacadeAccessor()
    {
        return ExampleProductServiceImplement::class;
    }
}
