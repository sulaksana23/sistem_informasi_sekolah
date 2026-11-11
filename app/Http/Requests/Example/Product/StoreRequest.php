<?php

namespace App\Http\Requests\Example\Product;

use App\Enums\Example\ExampleProductCategory;
use App\Enums\Example\ExampleProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // a real module checks permission with `can:` middleware on the route
    }

    /** Field names = ExampleProductFormData in resources/js/types/example/product.ts. */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'sku' => ['required', 'alpha_dash', 'max:32'],
            'category' => ['required', Rule::enum(ExampleProductCategory::class)],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::enum(ExampleProductStatus::class)],
        ];
    }
}
