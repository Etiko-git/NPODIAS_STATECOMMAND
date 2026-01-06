export type Role = "COMMISSIONER" | "DUTY_OFFICER" | "AUDITOR";

export const RoleLabel: Record<Role, string> = {
  COMMISSIONER: "Commissioner",
  DUTY_OFFICER: "Duty Officer",
  AUDITOR: "Auditor (Read-only)"
};

export function canWrite(role: Role) {
  return role === "COMMISSIONER" || role === "DUTY_OFFICER";
}
