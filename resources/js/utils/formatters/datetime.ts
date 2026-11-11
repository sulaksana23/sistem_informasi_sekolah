const formatDateLong = (d: string | null | undefined): string => {
    if (!d) return "-";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        day: "numeric", month: "long", year: "numeric",
    });
}

const formatDateTime = (d: string | null | undefined): string => {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-US", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

const calcDuration = (start: string, end: string): number | null => {
    if (!start || !end) return null;
    const diff = Math.round(
        (new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) / 86_400_000
    );
    return diff >= 0 ? diff + 1 : null;
}

export { formatDateLong, formatDateTime, calcDuration }
