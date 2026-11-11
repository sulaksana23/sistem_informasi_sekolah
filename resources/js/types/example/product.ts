// Mirrors App\Enums\Example\ExampleProductStatus and Requests/Example/Product/StoreRequest on the backend
// (docs/standard/FRONTEND-STANDARD.md §13): field names stay snake_case exactly as the JSON.

export type ExampleProductStatus = "draft" | "active" | "inactive";

export interface ExampleProduct {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: ExampleProductStatus;
    updated_at: string;
}

export interface ExampleProductStatistics {
    total: number;
    active: number;
    draft: number;
    inactive: number;
}

export interface ExampleProductFormData {
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    status: ExampleProductStatus;
}

type StatusBadgeVariant = "outline" | "success-outline" | "warning-outline" | "destructive-outline" | "info-outline";

/** One place that maps each status to its label and badge (DESIGN-STANDARD §8.5) — never per page. */
export const EXAMPLE_PRODUCT_STATUS_CONFIG: Record<ExampleProductStatus, { label: string; badgeVariant: StatusBadgeVariant }> = {
    draft: { label: "Draft", badgeVariant: "outline" },
    active: { label: "Active", badgeVariant: "success-outline" },
    inactive: { label: "Inactive", badgeVariant: "destructive-outline" },
};
