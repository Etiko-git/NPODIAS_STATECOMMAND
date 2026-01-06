import React from "react";
import TopBar from "./TopBar";
import NavBar from "./NavBar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-np-bg text-np-text">
      <div className="mx-auto max-w-6xl px-3 py-4 md:px-6">
        <div className="rounded-xl border border-np-border bg-np-panel shadow-panel overflow-hidden">
          <TopBar />
          <NavBar />
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
