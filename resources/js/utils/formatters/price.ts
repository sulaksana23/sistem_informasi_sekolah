

const formatRp = (value: number | string | null | undefined): string => {
    const num = parseFloat(String(value ?? 0));
    if (isNaN(num)) return "0";
    return Math.round(num).toLocaleString("id-ID");
}

export { formatRp }
