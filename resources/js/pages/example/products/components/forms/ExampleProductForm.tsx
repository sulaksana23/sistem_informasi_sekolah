import type { FormEvent } from "react";
import { Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExampleProductFormData } from "@/types/example/product";
import ExampleProductFormGeneral from "./ExampleProductFormGeneral";
import ExampleProductFormPricing from "./ExampleProductFormPricing";

const EMPTY_PRODUCT: ExampleProductFormData = {
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0,
    status: "draft",
};

/** Orchestrator: owns useForm and the submit; each section only renders its fields (FRONTEND-STANDARD §12). */
export default function ExampleProductForm({ categories }: { categories: string[] }) {
    const form = useForm<ExampleProductFormData>(EMPTY_PRODUCT);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        // Redirect + flash come from the controller; 422 errors land in form.errors.
        form.post(route("example.products.store"));
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <ExampleProductFormGeneral form={form} categories={categories} />
            <ExampleProductFormPricing form={form} />

            <div className="flex justify-end gap-2">
                <Button variant="outline" render={<Link href={route("example.products.index")} />} nativeButton={false}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? <Loader2 className="animate-spin" /> : <Save />}
                    Save product
                </Button>
            </div>
        </form>
    );
}
