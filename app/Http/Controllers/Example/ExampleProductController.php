<?php

namespace App\Http\Controllers\Example;

use App\Enums\Example\ExampleProductCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Example\Product\StoreRequest;
use App\Services\ExampleProduct\ExampleProductService;
use Illuminate\Http\Request;

/**
 * Reference module for docs/standard: thin controller with the three response kinds from
 * BACKEND-STANDARD.md §5.1 — Inertia page, JSON for useQuery/useDataTable, and redirect + flash
 * after an Inertia form submit. It only calls the Service facade: no queries, no transactions and
 * no try/catch — a BusinessException thrown by the Service is rendered centrally in
 * bootstrap/app.php (§10) as redirect back + flash `error`.
 */
class ExampleProductController extends Controller
{
    public function index()
    {
        return inertia('example/products/pages/ExampleProductIndex');
    }

    public function list(Request $request)
    {
        $orderIndex = (int) $request->input('order.0.column', -1);

        return response()->json(ExampleProductService::getDatatableList([
            'draw' => (int) $request->input('draw', 0),
            'start' => (int) $request->input('start', 0),
            'length' => (int) $request->input('length', 10),
            'search' => $request->input('search.value'),
            'status' => $request->input('status'),
            'order_column' => $request->input("columns.{$orderIndex}.data"),
            'order_dir' => $request->input('order.0.dir') === 'desc' ? 'desc' : 'asc',
        ]));
    }

    public function statistics()
    {
        return response()->json(ExampleProductService::getStatistics());
    }

    public function create()
    {
        return inertia('example/products/pages/ExampleProductCreate', [
            'categories' => ExampleProductCategory::values(),
        ]);
    }

    public function store(StoreRequest $request)
    {
        $product = ExampleProductService::store($request->validated());

        return to_route('example.products.index')
            ->with('success', "Product \"{$product['name']}\" created (example only — nothing is saved).");
    }

    public function detail(int $id)
    {
        return inertia('example/products/pages/ExampleProductDetail', [
            'product' => ExampleProductService::getDetail($id),
        ]);
    }
}
