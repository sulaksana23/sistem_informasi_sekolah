import { DateSelectorValue } from "@/components/ui/date-selector";
import { format } from "date-fns";

export { default as FilterDrawer } from "./FilterDrawer";
export { default as FilterSection } from "./FilterSection";
export { default as DatePickerButton } from "./DatePickerButton";
export { default as StatusToggle } from "./StatusToggle";
export { type StatusOption } from "./StatusToggle";
export { default as BooleanToggle } from "./BooleanToggle";

/* ─── Utility: convert DateSelectorValue → { from, to } params ───────── */
export function dateSelectorToRange(value: DateSelectorValue | undefined): { from?: string; to?: string } {
    if (!value) return {};
    const fmt = (d: Date) => format(d, "yyyy-MM-dd");
    const { operator, startDate, endDate } = value;
    if (!startDate) return {};
    if (operator === "is") return { from: fmt(startDate), to: fmt(startDate) };
    if (operator === "before") return { to: fmt(startDate) };
    if (operator === "after") return { from: fmt(startDate) };
    if (operator === "between") return { from: fmt(startDate), to: endDate ? fmt(endDate) : undefined };
    return {};
}

/* ─── Utility: count non-default filter values ────────────────────────── */
export function countActiveFilters(
    filters: Record<string, any>,
    defaults: Record<string, any>,
): number {
    let n = 0;
    for (const key of Object.keys(defaults)) {
        const val = filters[key];
        const def = defaults[key];
        if (Array.isArray(def)) {
            if (Array.isArray(val) && val.length > 0) n++;
        } else if (def === undefined) {
            if (val !== undefined) n++;
        } else if (def === "") {
            if (val !== "" && val !== undefined) n++;
        } else {
            if (val !== def) n++;
        }
    }
    return n;
}
