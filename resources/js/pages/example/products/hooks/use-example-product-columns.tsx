import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header";
import { Skeleton } from "@/components/ui/skeleton";
import { DateTimeCell, SkeletonDateTimeCell } from "@/components/cells/DateTimeCell";
import { formatRp } from "@/utils/formatters/price";
import type { ExampleProduct } from "@/types/example/product";
import { ExampleProductNameCell, SkeletonExampleProductNameCell } from "../components/cells/ExampleProductNameCell";
import { ExampleProductStatusCell, SkeletonExampleProductStatusCell } from "../components/cells/ExampleProductStatusCell";

const SkeletonNumberCell = () => <Skeleton className="ms-auto h-4 w-14" />;

/** Column ids match the backend field names — useDataTable sends them as Yajra `columns[i].data`. */
export const useExampleProductColumns = () =>
    useMemo<ColumnDef<ExampleProduct>[]>(
        () => [
            {
                id: "name",
                accessorFn: (row) => row.name,
                header: ({ column }) => <DataGridColumnHeader title="Product" column={column} />,
                cell: ({ row }) => (
                    <ExampleProductNameCell id={row.original.id} name={row.original.name} sku={row.original.sku} />
                ),
                size: 300,
                meta: { headerTitle: "Product", skeleton: <SkeletonExampleProductNameCell /> },
                enableSorting: true,
            },
            {
                id: "category",
                accessorFn: (row) => row.category,
                header: ({ column }) => <DataGridColumnHeader title="Category" column={column} />,
                cell: ({ row }) => <span className="text-sm">{row.original.category}</span>,
                size: 160,
                meta: { headerTitle: "Category", skeleton: <Skeleton className="h-4 w-24" /> },
                enableSorting: false,
            },
            {
                id: "price",
                accessorFn: (row) => row.price,
                header: ({ column }) => <DataGridColumnHeader title="Price (Rp)" column={column} />,
                cell: ({ row }) => <div className="text-end text-sm tabular-nums">{formatRp(row.original.price)}</div>,
                size: 130,
                meta: { headerTitle: "Price (Rp)", skeleton: <SkeletonNumberCell /> },
                enableSorting: true,
            },
            {
                id: "stock",
                accessorFn: (row) => row.stock,
                header: ({ column }) => <DataGridColumnHeader title="Stock" column={column} />,
                cell: ({ row }) => <div className="text-end text-sm tabular-nums">{row.original.stock.toLocaleString()}</div>,
                size: 100,
                meta: { headerTitle: "Stock", skeleton: <SkeletonNumberCell /> },
                enableSorting: true,
            },
            {
                id: "status",
                accessorFn: (row) => row.status,
                header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
                cell: ({ row }) => <ExampleProductStatusCell status={row.original.status} />,
                size: 120,
                meta: { headerTitle: "Status", skeleton: <SkeletonExampleProductStatusCell /> },
                enableSorting: false,
            },
            {
                id: "updated_at",
                accessorFn: (row) => row.updated_at,
                header: ({ column }) => <DataGridColumnHeader title="Last updated" column={column} />,
                cell: ({ row }) => <DateTimeCell date={row.original.updated_at} />,
                size: 180,
                meta: { headerTitle: "Last updated", skeleton: <SkeletonDateTimeCell /> },
                enableSorting: true,
            },
        ],
        [],
    );
