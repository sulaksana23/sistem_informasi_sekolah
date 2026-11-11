const toTitleCase = (value: string | null | undefined): string | null => {
    if (!value) return null;

    return value.replace(
        /\w\S*/g,
        (w) => w[0].toUpperCase() + w.slice(1).toLowerCase(),
    );
}

const decodeHtml = (text: string | null): string => {
    if (!text) return "-";

    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;

    return textarea.value ?? '-';
}

const formatTitle = (str: string) => {
  return str
    .split("_")
    .join(" ");
};

const labelize = (text: string) => {
  return text
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export { toTitleCase, decodeHtml, formatTitle, labelize };
