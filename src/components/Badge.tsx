export default function Badge({ tone, children }: { tone: "green" | "amber" | "red" | "neutral"; children: React.ReactNode }) {
  const cls =
    tone === "green"
      ? "border-np-green text-[#9AF2B5] bg-[#0B241F]"
      : tone === "amber"
      ? "border-[#8A6A19] text-[#FBD38D] bg-[#2A2108]"
      : tone === "red"
      ? "border-[#7F1D1D] text-[#FCA5A5] bg-[#3B0A0A]"
      : "border-np-border text-np-muted bg-[#0A1F1C]";
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${cls}`}>{children}</span>;
}
