import { useNavigate, useLocation } from "react-router-dom";
import { executives } from "@/data/executives";
import { LayoutDashboard } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const classificationDotColor: Record<string, string> = {
  Pro: "bg-sidebar-dot-pro",
  Neutral: "bg-sidebar-dot-neutral",
  Anti: "bg-sidebar-dot-anti",
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar-bg text-sidebar-text flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display text-xl leading-tight">CXOWorld</h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mt-1">
          HCL Intelligence View
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-sidebar-border" />

      {/* Tracked Targets */}
      <div className="flex-1 overflow-y-auto px-3 pt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sidebar-label px-2 mb-3">
          Tracked Targets
        </p>

        <ul className="space-y-0.5">
          {executives.map((exec) => {
            const active = isActive(`/profile/${exec.id}`);
            return (
              <li key={exec.id}>
                <button
                  onClick={() => navigate(`/profile/${exec.id}`)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-sm text-left transition-colors
                    ${active
                      ? "bg-sidebar-active border-l-2 border-accent"
                      : "border-l-2 border-transparent hover:bg-sidebar-active/50"
                    }`}
                >
                  {/* Initials avatar */}
                  <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground font-mono text-[11px] flex items-center justify-center">
                    {getInitials(exec.name)}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[13px] leading-tight truncate">
                      {exec.name}
                    </p>
                    <p className="font-mono text-[10px] text-sidebar-muted truncate">
                      {exec.company}
                    </p>
                  </div>

                  {/* Classification dot */}
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${classificationDotColor[exec.hclClassification] ?? "bg-sidebar-dot-neutral"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-5">
        <div className="mx-2 mb-3 border-t border-sidebar-border" />
        <button
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-sm text-left transition-colors
            ${isActive("/")
              ? "bg-sidebar-active border-l-2 border-accent"
              : "border-l-2 border-transparent hover:bg-sidebar-active/50"
            }`}
        >
          <LayoutDashboard className="w-4 h-4 text-sidebar-muted" />
          <span className="font-sans text-[13px]">Dashboard</span>
        </button>
      </div>
    </aside>
  );
}
