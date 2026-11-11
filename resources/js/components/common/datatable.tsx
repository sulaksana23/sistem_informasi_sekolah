import React from "react";
import { useIntl } from "react-intl";
import {
    Card,
    CardHeader,
    CardFooter,
    CardAction,
    CardContent,
} from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { Search, Settings2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DataGridColumnVisibility } from "../ui/data-grid-column-visibility";
import type { Table } from "@tanstack/react-table";

type BaseProps = {
    table: Table<object>;
    totalRows: number;
    leftToolbar?: React.ReactNode;
    rightToolbar?: React.ReactNode;
    isLoading?: boolean;
    toggleColumnVisibility?: boolean;
};

type WithGlobalFilter = {
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
};

type WithoutGlobalFilter = {
    globalFilter?: undefined;
    onGlobalFilterChange?: undefined;
};

type DatatableProps = BaseProps & (WithGlobalFilter | WithoutGlobalFilter);

export const GlobalSearch = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) => {
    const intl = useIntl();

    return (
    <div className="relative" data-tour="datatable-search">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
            placeholder={intl.formatMessage({ id: "COMMON.SEARCH_HERE", defaultMessage: "Search here..." })}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-48 sm:w-64 ps-9"
        />
        {value && (
            <Button
                size="icon"
                variant="ghost"
                className="absolute right-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={() => onChange("")}
            >
                <X className="h-4 w-4" />
            </Button>
        )}
    </div>
    );
};

export const Datatable: React.FC<DatatableProps> = ({
    table,
    totalRows,
    leftToolbar,
    rightToolbar,
    isLoading = false,
    globalFilter,
    onGlobalFilterChange,
    toggleColumnVisibility = false,
}) => {
    const intl = useIntl();

    if (onGlobalFilterChange && typeof globalFilter !== "string") {
        throw new Error(
            "If 'onGlobalFilterChange' is provided, 'globalFilter' must also be provided as a string.",
        );
    }

    return (
        <DataGrid
            table={table}
            recordCount={totalRows}
            isLoading={isLoading}
            tableLayout={{
                columnsPinnable: true,
                columnsMovable: true,
                columnsVisibility: true,
                cellBorder: true,
            }}
        >
            <Card className="p-0 pb-4 gap-3">
                {(toggleColumnVisibility ||
                    onGlobalFilterChange ||
                    leftToolbar ||
                    rightToolbar) && (
                    <CardHeader className="flex flex-wrap justify-between pt-3 pb-0 px-3.5">
                        <div className="flex gap-2.5">
                            {onGlobalFilterChange &&
                                globalFilter !== undefined && (
                                    <GlobalSearch
                                        value={globalFilter}
                                        onChange={onGlobalFilterChange}
                                    />
                                )}
                            {leftToolbar && (
                                <div className="flex gap-2.5" data-tour="datatable-filters">{leftToolbar}</div>
                            )}
                        </div>
                        <CardAction className="p-0 flex gap-2">
                            {toggleColumnVisibility && (
                                <div data-tour="datatable-columns">
                                    <DataGridColumnVisibility
                                        table={table}
                                        trigger={
                                            <Button variant="outline">
                                                <Settings2 className="me-2 h-4 w-4" />
                                                {intl.formatMessage({ id: "COMMON.COLUMNS", defaultMessage: "Columns" })}
                                            </Button>
                                        }
                                    />
                                </div>
                            )}
                            {rightToolbar && (
                                <div className="flex gap-2" data-tour="datatable-actions">{rightToolbar}</div>
                            )}
                        </CardAction>
                    </CardHeader>
                )}

                <CardContent className="p-0 border-t-1 border-b-1" data-tour="datatable-table">
                    <div className="w-full overflow-x-auto">
                        <DataGridTable />
                    </div>
                </CardContent>

                <CardFooter data-tour="datatable-pagination">
                    <DataGridPagination />
                </CardFooter>
            </Card>
        </DataGrid>
    );
};
