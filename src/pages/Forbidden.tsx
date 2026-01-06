export default function Forbidden() {
  return (
    <div className="min-h-full bg-np-bg text-np-text grid place-items-center px-4">
      <div className="max-w-md rounded-xl border border-np-border bg-np-panel shadow-panel p-6">
        <div className="text-2xl font-extrabold text-[#FCA5A5]">Forbidden</div>
        <div className="mt-2 text-np-muted text-sm">Your role does not permit this action.</div>
      </div>
    </div>
  );
}
