import type { useForm } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXAMPLE_PRODUCT_STATUS_CONFIG, type ExampleProductFormData, type ExampleProductStatus } from "@/types/example/product";

interface ExampleProductFormPricingProps {
    form: ReturnType<typeof useForm<ExampleProductFormData>>;
}

export default function ExampleProductFormPricing({ form }: ExampleProductFormPricingProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Pricing &amp; stock</CardTitle>
                <CardDescription>Validated again on the server by Requests/Example/Product/StoreRequest.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field>
                    <FieldLabel htmlFor="product-price">
                        Price (Rp) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="product-price"
                        type="number"
                        min={0}
                        className="tabular-nums"
                        value={form.data.price}
                        onChange={(e) => form.setData("price", Number(e.target.value))}
                        aria-invalid={!!form.errors.price}
                    />
                    <FieldError>{form.errors.price}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="product-stock">
                        Stock <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="product-stock"
                        type="number"
                        min={0}
                        className="tabular-nums"
                        value={form.data.stock}
                        onChange={(e) => form.setData("stock", Number(e.target.value))}
                        aria-invalid={!!form.errors.stock}
                    />
                    <FieldError>{form.errors.stock}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="product-status">
                        Status <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                        value={form.data.status}
                        onValueChange={(value) => form.setData("status", value as ExampleProductStatus)}
                    >
                        <SelectTrigger id="product-status" aria-invalid={!!form.errors.status}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(EXAMPLE_PRODUCT_STATUS_CONFIG).map(([status, config]) => (
                                <SelectItem key={status} value={status}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError>{form.errors.status}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
}
