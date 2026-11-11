<?php

namespace App\Services\ExampleProduct;

use App\Enums\Example\ExampleProductStatus;
use App\Exceptions\BusinessException;
use App\Repositories\ExampleProduct\ExampleProductRepository;
use Itmm\EasyRepository\Service;

/**
 * Business rules + orchestration for the /example/products reference module
 * (docs/standard/BACKEND-STANDARD.md §7). Stateless, never builds an HTTP response; rule violations
 * throw BusinessException. The repository is in-memory, so nothing is saved — a real module wraps
 * multi-step writes in DB::transaction().
 */
class ExampleProductServiceImplement extends Service
{
    private const SORTABLE = ['name', 'price', 'stock', 'updated_at'];

    public function __construct(protected ExampleProductRepository $mainRepository) {}

    /**
     * Yajra-shaped JSON for useDataTable(). A real module returns
     * `DataTables::eloquent($this->mainRepository->getDatatableList($filters))->addIndexColumn()->toJson()`.
     *
     * @param  array{draw: int, start: int, length: int, search: ?string, status: ?string, order_column: ?string, order_dir: string}  $params
     */
    public function getDatatableList(array $params): array
    {
        $filtered = $this->mainRepository->getDatatableList([
            'search' => $params['search'],
            'status' => $params['status'],
        ]);

        if (in_array($params['order_column'], self::SORTABLE, true)) {
            $filtered = $filtered->sortBy($params['order_column'], SORT_NATURAL, $params['order_dir'] === 'desc');
        }

        return [
            'draw' => $params['draw'],
            'recordsTotal' => $this->mainRepository->all()->count(),
            'recordsFiltered' => $filtered->count(),
            'data' => $filtered->slice($params['start'], max(1, min($params['length'], 100)))->values()->all(),
        ];
    }

    /** @return array{total: int, active: int, draft: int, inactive: int} — mirrored by ExampleProductStatistics */
    public function getStatistics(): array
    {
        $counts = $this->mainRepository->countByStatus();

        return [
            'total' => array_sum($counts),
            'active' => $counts[ExampleProductStatus::ACTIVE->value] ?? 0,
            'draft' => $counts[ExampleProductStatus::DRAFT->value] ?? 0,
            'inactive' => $counts[ExampleProductStatus::INACTIVE->value] ?? 0,
        ];
    }

    public function getDetail(int $id): array
    {
        return $this->mainRepository->findOrFail($id);
    }

    public function store(array $data): array
    {
        $existing = $this->mainRepository->findBySku($data['sku']);

        if ($existing) {
            throw new BusinessException("SKU {$data['sku']} is already used by \"{$existing['name']}\".");
        }

        return $this->mainRepository->create($data);
    }
}
