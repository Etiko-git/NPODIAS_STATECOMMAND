import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/home", label: "Dashboard" },
  { to: "/officers", label: "Officers" },
  { to: "/incidents", label: "Incidents" },
  { to: "/operations", label: "Operations" },
  { to: "/reports", label: "Reports" }
];

export default function NavBar() {
  return (
    <div className="bg-[#0B1F1D] border-b border-np-border px-4">
      <div className="flex gap-2 overflow-x-auto py-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              [
                "px-4 py-2 rounded-lg text-sm font-semibold border whitespace-nowrap",
                isActive
                  ? "bg-[#0E2A26] border-[#1E4C44] text-np-text"
                  : "bg-transparent border-transparent text-np-muted hover:text-np-text hover:border-np-border"
              ].join(" ")
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
