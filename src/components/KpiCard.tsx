export default function KpiCard({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "amber" }) {
  const cls =
    tone === "red"
      ? "bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C] border-[#7F1D1D]"
      : tone === "amber"
      ? "bg-gradient-to-r from-[#3A2A08] to-[#2A2108] border-[#8A6A19]"
      : "bg-gradient-to-r from-[#0E3A31] to-[#0B2A24] border-np-border";

  return (
    <div className={`rounded-xl border ${cls} shadow-panel px-4 py-4`}>
      <div className="text-sm text-np-muted font-semibold">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}
