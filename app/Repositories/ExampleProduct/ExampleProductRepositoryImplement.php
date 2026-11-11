<?php

namespace App\Repositories\ExampleProduct;

use App\Enums\Example\ExampleProductCategory;
use App\Enums\Example\ExampleProductStatus;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

/**
 * Implementasi IN-MEMORY supaya contoh jalan tanpa tabel database: data tetap, mutasi tidak
 * disimpan. Modul sungguhan:
 *
 *     class ProductRepositoryImplement extends Eloquent implements ProductRepository
 *     {
 *         public function __construct(protected Product $model) {}
 *
 *         public function getDatatableList(array $filters = []): Builder
 *         {
 *             return $this->model->query()
 *                 ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v));
 *         }
 *     }
 *
 * — find/create/update/delete/all/destroy didapat dari Itmm\EasyRepository\Implementations\Eloquent.
 * Repository = query saja: tanpa aturan bisnis, tanpa transaksi, tidak membaca request().
 */
class ExampleProductRepositoryImplement implements ExampleProductRepository
{
    public function getDatatableList(array $filters = []): Collection
    {
        $search = filled($filters['search'] ?? null) ? mb_strtolower($filters['search']) : null;

        return $this->rows()
            ->when($filters['status'] ?? null, fn ($rows, $status) => $rows->where('status', $status))
            ->when($filters['category'] ?? null, fn ($rows, $category) => $rows->where('category', $category))
            ->when($search, fn ($rows) => $rows->filter(
                fn ($row) => str_contains(mb_strtolower($row['name'].' '.$row['sku']), $search)
            ))
            ->values();
    }

    public function findBySku(string $sku): ?array
    {
        return $this->rows()->first(fn ($row) => strcasecmp($row['sku'], $sku) === 0);
    }

    public function countByStatus(): array
    {
        return $this->rows()->countBy('status')->all();
    }

    // ---- Method dasar Itmm\EasyRepository\Repository -------------------------------------

    public function find($id)
    {
        return $this->rows()->firstWhere('id', (int) $id);
    }

    public function findOrFail($id)
    {
        return $this->find($id) ?? throw (new ModelNotFoundException)->setModel('ExampleProduct', [$id]);
    }

    public function all()
    {
        return $this->rows();
    }

    public function create($data)
    {
        return ['id' => $this->rows()->max('id') + 1, ...$data, 'updated_at' => now()->toIso8601String()];
    }

    public function update($id, array $data)
    {
        return [...$this->findOrFail($id), ...$data, 'updated_at' => now()->toIso8601String()];
    }

    public function delete($id)
    {
        $this->findOrFail($id);
    }

    public function destroy(array $id)
    {
        //
    }

    /** @return Collection<int, array{id: int, sku: string, name: string, category: string, price: int, stock: int, status: string, updated_at: string}> */
    private function rows(): Collection
    {
        $names = [
            'Mineral Water 600ml', 'Green Tea 350ml', 'Instant Coffee Sachet', 'Potato Chips Original',
            'Chocolate Wafer', 'Peanut Crackers', 'Laundry Detergent 1kg', 'Dish Soap 800ml',
            'Floor Cleaner Lemon', 'Toothpaste Fresh Mint', 'Shampoo Anti Dandruff', 'Body Lotion Aloe',
            'Frozen Nuggets 500g', 'Ice Cream Vanilla Cup', 'Frozen Dumplings 12pcs', 'Orange Juice 1L',
            'Rice Crackers Seaweed', 'Tissue Facial 250s', 'Hand Soap Refill', 'Frozen French Fries 1kg',
            'Sparkling Water Lime', 'Cereal Bar Oat', 'Glass Cleaner Spray', 'Sunscreen SPF 50',
        ];

        $categories = ExampleProductCategory::cases();

        return collect($names)->map(function (string $name, int $i) use ($categories) {
            $id = $i + 1;
            $status = $id % 5 === 0 ? ExampleProductStatus::DRAFT : ($id % 4 === 0 ? ExampleProductStatus::INACTIVE : ExampleProductStatus::ACTIVE);

            return [
                'id' => $id,
                'sku' => sprintf('SKU-%04d', 1000 + $id * 7),
                'name' => $name,
                'category' => $categories[$i % count($categories)]->value,
                'price' => 5000 + ($id * 3700) % 95000,
                'stock' => ($id * 37) % 240,
                'status' => $status->value,
                'updated_at' => now()->subDays($id)->startOfHour()->toIso8601String(),
            ];
        });
    }
}
