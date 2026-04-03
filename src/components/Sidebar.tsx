import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllExecutives } from "@/services/api";
import type { Executive } from "@/types/executive";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import netscribesLogo from "@/assets/netscribes-logo-white.png";

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

function SidebarContent({ onNavigate, executives }: { onNavigate: (path: string) => void; executives: Executive[] }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <img src={netscribesLogo} alt="Netscribes" className="h-5" />
      </div>
      <p className="px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-4">
        HCL Intelligence View
      </p>

      {/* Divider */}
      <div className="mx-5 border-t border-sidebar-border" />

      {/* Tracked Targets */}
      <div className="flex-1 overflow-y-auto px-3 pt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sidebar-label px-2 mb-3">
          Tracked Targets
        </p>

        <ul>
          {executives.map((exec, i) => {
            const active = isActive(`/profile/${exec.id}`);
            return (
              <li key={exec.id}>
                <button
                  onClick={() => onNavigate(`/profile/${exec.id}`)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-sm text-left transition-colors
                    ${active
                      ? "bg-sidebar-active border-l-2 border-accent"
                      : "border-l-2 border-transparent hover:bg-sidebar-active/50"
                    }`}
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground font-mono text-[11px] flex items-center justify-center">
                    {getInitials(exec.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[13px] leading-tight truncate">{exec.name}</p>
                    <p className="font-mono text-[10px] text-sidebar-muted truncate">{exec.company}</p>
                  </div>
                  <span className={`shrink-0 w-2 h-2 rounded-full ${classificationDotColor[exec.hclClassification] ?? "bg-sidebar-dot-neutral"} ${exec.hclClassification === 'Pro' ? 'animate-pulse-dot' : ''}`} />
                </button>
                {/* Centered separator between items */}
                {i < executives.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <div className="w-[60%] h-px bg-sidebar-border" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-5">
        <div className="mx-2 mb-3 border-t border-sidebar-border" />
        <button
          onClick={() => onNavigate("/")}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-sm text-left transition-colors
            ${isActive("/")
              ? "bg-sidebar-active border-l-2 border-accent"
              : "border-l-2 border-transparent hover:bg-sidebar-active/50"
            }`}
        >
          <LayoutDashboard className="w-4 h-4 text-sidebar-muted" />
          <span className="font-sans text-[13px]">Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate("/login")}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-sm text-left transition-colors border-l-2 border-transparent hover:bg-sidebar-active/50"
        >
          <LogOut className="w-4 h-4 text-sidebar-muted" />
          <span className="font-sans text-[13px]">Log Out</span>
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [executives, setExecutives] = useState<Executive[]>([]);

  useEffect(() => {
    getAllExecutives().then(setExecutives).catch(console.error);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-sidebar-bg text-sidebar-text flex items-center px-4">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <img src={netscribesLogo} alt="Netscribes" className="h-4 ml-3" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-sidebar-bg text-sidebar-text flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4">
              <X className="w-5 h-5 text-sidebar-muted" />
            </button>
            <SidebarContent onNavigate={handleNav} executives={executives} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-sidebar-bg text-sidebar-text flex-col z-50">
        <SidebarContent onNavigate={handleNav} executives={executives} />
      </aside>
    </>
  );
}
