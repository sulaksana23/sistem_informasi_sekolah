import { useState } from "react";
import type { Table } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { Datatable } from "@/components/common/datatable";
import { useDataTable } from "@/hooks/use-datatables";
import type { ExampleProduct } from "@/types/example/product";
import { useExampleProductColumns } from "../../hooks/use-example-product-columns";
import ExampleProductStatusFilter, {
    EXAMPLE_PRODUCT_FILTERS_DEFAULT,
    type ExampleProductStatusFilterValue,
} from "../filters/ExampleProductStatusFilter";

/** Server-side table: pagination, sort and search run in the backend `list` endpoint (FRONTEND-STANDARD §11). */
export default function ExampleProductList() {
    const [status, setStatus] = useState<ExampleProductStatusFilterValue>(EXAMPLE_PRODUCT_FILTERS_DEFAULT.status);
    const table = useDataTable<ExampleProduct>(route("example.products.list"), useExampleProductColumns());

    const onStatusChange = (next: ExampleProductStatusFilterValue) => {
        setStatus(next);
        table.setExtraParams(next === "all" ? {} : { status: next });
        table.table.setPageIndex(0);
    };

    return (
        <Datatable
            table={table.table as Table<object>}
            totalRows={table.totalRows}
            isLoading={table.isFetching}
            globalFilter={table.globalFilter}
            onGlobalFilterChange={table.onGlobalFilterChange}
            toggleColumnVisibility
            leftToolbar={<ExampleProductStatusFilter value={status} onChange={onStatusChange} />}
        />
    );
}
