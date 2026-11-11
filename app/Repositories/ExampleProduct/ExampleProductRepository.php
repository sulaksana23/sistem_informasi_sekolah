<?php

namespace App\Repositories\ExampleProduct;

use Illuminate\Support\Collection;
use Itmm\EasyRepository\Repository;

/**
 * Repository modul acuan /example/products (docs/standard/BACKEND-STANDARD.md §8). Di-bind otomatis
 * ke ExampleProductRepositoryImplement oleh itmm/easy-repository (folder satu level di
 * app/Repositories). Interface hanya mendeklarasikan method kustom.
 */
interface ExampleProductRepository extends Repository
{
    /**
     * Modul sungguhan mengembalikan query Builder (JANGAN ->get()) supaya Yajra yang
     * paginate/sort/search di SQL. Contoh in-memory ini mengembalikan Collection.
     *
     * @param  array{search?: ?string, status?: ?string, category?: ?string}  $filters
     */
    public function getDatatableList(array $filters = []): Collection;

    public function findBySku(string $sku): ?array;

    /** @return array<string, int> jumlah product per nilai status */
    public function countByStatus(): array;
}
