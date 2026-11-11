import axios from "axios";
import { route } from "ziggy-js";
import type { ExampleProductStatistics } from "@/types/example/product";

// The only place the example module talks HTTP (docs/standard/FRONTEND-STANDARD.md §6).
// The datatable list is fetched by useDataTable(route("example.products.list")), and
// create/store goes through the Inertia form, so only statistics needs a function here.

export const getExampleProductStatistics = async (): Promise<ExampleProductStatistics> => {
    const res = await axios.get(route("example.products.statistics"));
    return res.data;
};

/** Query keys are the route URL — the same value useDataTable keys on (FRONTEND-STANDARD §7). */
export const exampleProductKeys = {
    list: () => [route("example.products.list")] as const,
    statistics: () => [route("example.products.statistics")] as const,
};
