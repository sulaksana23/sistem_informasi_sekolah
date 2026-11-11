import type { useForm } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExampleProductFormData } from "@/types/example/product";

interface ExampleProductFormGeneralProps {
    form: ReturnType<typeof useForm<ExampleProductFormData>>;
    categories: string[];
}

export default function ExampleProductFormGeneral({ form, categories }: ExampleProductFormGeneralProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">General</CardTitle>
                <CardDescription>How the product is identified in the catalog.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field className="md:col-span-2">
                    <FieldLabel htmlFor="product-name">
                        Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="product-name"
                        value={form.data.name}
                        onChange={(e) => form.setData("name", e.target.value)}
                        aria-invalid={!!form.errors.name}
                        placeholder="e.g. Mineral Water 600ml"
                    />
                    <FieldError>{form.errors.name}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="product-sku">
                        SKU <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="product-sku"
                        value={form.data.sku}
                        onChange={(e) => form.setData("sku", e.target.value)}
                        aria-invalid={!!form.errors.sku}
                        placeholder="e.g. SKU-1234"
                    />
                    <FieldError>{form.errors.sku}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="product-category">
                        Category <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={form.data.category} onValueChange={(value) => form.setData("category", value)}>
                        <SelectTrigger id="product-category" aria-invalid={!!form.errors.category}>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError>{form.errors.category}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
}
