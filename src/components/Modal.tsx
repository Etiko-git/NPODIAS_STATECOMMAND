import React from "react";

export default function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-np-border bg-np-panel shadow-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-np-border bg-gradient-to-r from-[#0A3A32] to-[#0B2F2A]">
            <div className="text-lg font-extrabold">{title}</div>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
