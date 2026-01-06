import React, { useMemo, useState } from "react";

type Col<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export default function DataTable<T>({
  rows,
  columns,
  pageSize = 8,
  searchPlaceholder = "Search…",
  actionsRight
}: {
  rows: T[];
  columns: Col<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  actionsRight?: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  return (
    <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 border-b border-np-border">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="w-full md:w-[360px] rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2">{actionsRight}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0A1F1C]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`text-left px-4 py-3 font-bold ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr key={idx} className="border-t border-np-border hover:bg-[#0B241F]">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-np-muted" colSpan={columns.length}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-np-border">
        <div className="text-xs text-np-muted">
          Page {safePage} of {totalPages} · {filtered.length} records
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-md border border-np-border bg-[#0A1F1C] hover:bg-[#0B241F]">
            Prev
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-md border border-np-border bg-[#0A1F1C] hover:bg-[#0B241F]">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
