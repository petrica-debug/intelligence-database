export function formatDate(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.substring(0, len) + "..." : str;
}
