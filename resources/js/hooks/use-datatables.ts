import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    useReactTable,
    ColumnDef,
    PaginationState,
    SortingState,
    getCoreRowModel,
} from "@tanstack/react-table";
import axios from "axios";
import { debounce } from "lodash";

const SEARCH_DEBOUNCE_MS = 400;

export interface DataTableResult<T> {
    table: ReturnType<typeof useReactTable<T>>;
    totalRows: number;
    isFetching: boolean;
    refetch: () => void;
    extraParams: Record<string, any>;
    setExtraParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    columnFilters: Record<string, string>;
    onColumnFilterChange: (columnId: string, value: string) => void;
}

export function useDataTable<T>(
    endpoint: string,
    columns: ColumnDef<T>[],
    initialParams: Record<string, any> = {},
    initialPageSize = 10,
    debounceMs = SEARCH_DEBOUNCE_MS
): DataTableResult<T> {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPageSize,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [extraParams, setExtraParams] = useState<Record<string, any>>(initialParams);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const debouncedSetSearch = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedSearch(value.trim());
                // A new keyword shrinks the result set — stay on page 1 or the current offset may land past the end
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }, debounceMs),
        [debounceMs]
    );

    const onGlobalFilterChange = useCallback(
        (value: string) => {
            setGlobalFilter(value);           // directly for UI
            debouncedSetSearch(value);        // debounce update query
        },
        [debouncedSetSearch]
    );

    const onColumnFilterChange = useCallback((columnId: string, value: string) => {
        setColumnFilters((prev) => ({
            ...prev,
            [columnId]: value,
        }));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, []);

    const queryParams = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;

        const params: Record<string, any> = {
            draw: Date.now(),
            start,
            length: pagination.pageSize,
            ...extraParams,
        };

        // Column definitions
        params.columns = columns.map((col, index) => ({
            data: col.id ?? `column_${index}`,
            name: (col.meta as any)?.dbName ?? col.id ?? "",
            searchable: col.enableColumnFilter !== false,
            orderable: col.enableSorting !== false,
            search: {
                value: columnFilters[col.id as string] ?? "",
                regex: false,
            },
        }));

        // Global search
        if (debouncedSearch) {
            params.search = { value: debouncedSearch, regex: false };
        }

        // Sorting
        if (sorting.length > 0) {
            params.order = sorting.map((sort) => {
                const colIndex = columns.findIndex((c) => c.id === sort.id);
                return {
                    column: colIndex >= 0 ? colIndex : 0,
                    dir: sort.desc ? "desc" : "asc",
                };
            });
        }

        return params;
    }, [pagination, sorting, extraParams, debouncedSearch, columnFilters, columns]);

    const { data, isFetching, refetch } = useQuery({
        queryKey: [endpoint, queryParams],
        queryFn: async () => {
            const response = await axios.get(endpoint, { params: queryParams });

            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const table = useReactTable({
        data: data?.data ?? [],
        columns,
        state: {
            pagination,
            sorting,
            columnFilters: [],
            globalFilter,
            columnPinning: {
                right: ["actions"],
            }
        },
        pageCount: data
            ? Math.ceil((data?.recordsFiltered ?? 0) / pagination.pageSize)
            : -1,
        manualPagination: true,
        manualSorting: true,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
    });

    return {
        table,
        totalRows: data?.recordsFiltered ?? 0,
        // extra,
        isFetching,
        refetch,
        extraParams,
        setExtraParams,
        globalFilter,
        onGlobalFilterChange,
        columnFilters,
        onColumnFilterChange,
    };
}
