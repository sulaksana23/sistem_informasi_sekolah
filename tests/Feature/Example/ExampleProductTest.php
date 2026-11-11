<?php

namespace Tests\Feature\Example;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * Feature test for the /example/products reference module (docs/standard/BACKEND-STANDARD.md §15):
 * page render, `list` JSON shape, 422 validation, and a business rule. The example routes are
 * only behind `auth`, so there is no 403 test — a real module adds one per `can:` middleware, e.g.
 * `$this->actingAsSchoolMember(SchoolRole::TEACHER)->post(route('product.store'), [...])->assertForbidden();`.
 */
class ExampleProductTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Page tests only assert the Inertia component/props — no need for a built Vite manifest.
        $this->withoutVite();

        // Example routes are behind `auth`; log in as a school member so the
        // session and flash assertions behave like a real request.
        $this->actingAsSchoolMember();
    }

    private function validPayload(array $overrides = []): array
    {
        return [
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'category' => 'Snack',
            'price' => 12000,
            'stock' => 10,
            'status' => 'draft',
            ...$overrides,
        ];
    }

    public function test_index_renders_page(): void
    {
        $this->get(route('example.products.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('example/products/pages/ExampleProductIndex'));
    }

    public function test_list_returns_datatables_json(): void
    {
        $this->getJson(route('example.products.list', ['draw' => 3, 'start' => 0, 'length' => 5, 'status' => 'active']))
            ->assertOk()
            ->assertJsonPath('draw', 3)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure(['draw', 'recordsTotal', 'recordsFiltered', 'data' => [['id', 'sku', 'name', 'status']]])
            ->assertJsonPath('data.0.status', 'active');
    }

    public function test_statistics_returns_counts(): void
    {
        $this->getJson(route('example.products.statistics'))
            ->assertOk()
            ->assertJsonStructure(['total', 'active', 'draft', 'inactive']);
    }

    public function test_store_validates_input(): void
    {
        $this->postJson(route('example.products.store'), ['status' => 'unknown'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'sku', 'category', 'price', 'stock', 'status']);
    }

    public function test_store_redirects_with_success_flash(): void
    {
        $this->post(route('example.products.store'), $this->validPayload())
            ->assertRedirect(route('example.products.index'))
            ->assertSessionHas('success');
    }

    public function test_store_with_used_sku_redirects_back_with_error_flash(): void
    {
        $this->from(route('example.products.create'))
            ->post(route('example.products.store'), $this->validPayload(['sku' => 'SKU-1007']))
            ->assertRedirect(route('example.products.create'))
            ->assertSessionHas('error');
    }

    public function test_detail_returns_404_for_unknown_product(): void
    {
        $this->get(route('example.products.detail', 9999))->assertNotFound();
    }
}
