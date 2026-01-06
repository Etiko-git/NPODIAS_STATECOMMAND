export default function UnitStatus({ units }: { units: { ON_DUTY: number; DISPATCHED: number; AVAILABLE: number; UNAVAILABLE: number } }) {
  return (
    <div>
      <div className="px-4 py-3 border-b border-np-border font-bold">Unit Status</div>
      <div className="p-4 space-y-3 text-sm">
        {[
          ["On Duty", units.ON_DUTY],
          ["Dispatched", units.DISPATCHED],
          ["Available", units.AVAILABLE],
          ["Unavailable", units.UNAVAILABLE]
        ].map(([k, v]) => (
          <div key={String(k)} className="flex items-center justify-between rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2">
            <div className="text-np-muted font-semibold">{k}</div>
            <div className="text-2xl font-extrabold">{v as any}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
