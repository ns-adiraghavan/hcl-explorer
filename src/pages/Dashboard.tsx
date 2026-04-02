import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllExecutives } from "@/services/api";
import DealGauge from "@/components/DealGauge";
import type { Executive } from "@/types/executive";
import type { HCLParameterProfile } from "@/types/hcl-parameters";

const classificationStyles: Record<string, string> = {
  Pro: "bg-[var(--accent)] text-[var(--accent-light)]",
  Neutral: "bg-[var(--neutral)] text-[var(--bg)]",
  Anti: "bg-[var(--risk)] text-[var(--bg)]",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [hclProfiles, setHclProfiles] = useState<HCLParameterProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const execs = await getAllExecutives();
        setExecutives(execs);
        // Load HCL profiles in parallel
        const { getHCLProfile } = await import("@/services/api");
        const profiles = await Promise.all(
          execs.map(e => getHCLProfile(e.id))
        );
        setHclProfiles(profiles.filter((p): p is HCLParameterProfile => p != null));
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[50vh]">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--neutral)]">Loading intelligence…</p>
      </div>
    );
  }

  const proCount = executives.filter((e) => e.hclClassification === "Pro").length;

  const allOpportunities = new Set(
    hclProfiles.flatMap((p) => p.opportunityAreas.map((o) => o.area))
  );

  const lastUpdated = executives.length > 0
    ? executives.reduce((latest, e) =>
        e.lastUpdated > latest ? e.lastUpdated : latest, executives[0].lastUpdated
      )
    : "—";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const stats = [
    { label: "Profiles Tracked", value: executives.length },
    { label: "Pro Signals", value: proCount },
    { label: "Opportunity Areas", value: allOpportunities.size },
    { label: "Last Updated", value: lastUpdated },
  ];

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-[72px] leading-[1] tracking-[-2px]">Account Intelligence</h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--neutral)] mt-2 flex items-center gap-2">
            <span className="text-[var(--accent)]">|</span>
            HCL Strategic Targets — Active Monitoring
          </p>
        </div>
        <p className="font-mono text-[11px] text-[var(--neutral)] pt-2 hidden md:block">{today}</p>
      </div>

      {/* Summary bar — asymmetric: first card 1.5x width */}
      <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 mb-10">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`border border-[var(--border)] rounded-sm px-6 py-4 ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}
          >
            <p className={`font-mono font-medium ${i === 0 ? 'text-[48px] leading-none' : 'text-2xl'}`}>{s.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--neutral)] mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Executive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {executives.map((exec) => {
          const profile = hclProfiles.find((p) => p.executiveId === exec.id);
          const topOpps = profile?.opportunityAreas.slice(0, 2) ?? [];

          return (
            <button
              key={exec.id}
              onClick={() => navigate(`/profile/${exec.id}`)}
              className="text-left border border-[var(--border)] rounded-sm p-6 bg-[var(--card-bg)] transition-all duration-200 hover:border-[var(--accent)] hover:-translate-y-0.5 group"
            >
              {/* Top row: name + badge */}
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-display text-[22px] leading-snug">{exec.name}</h2>
                <span
                  className={`shrink-0 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${classificationStyles[exec.hclClassification]}`}
                >
                  {exec.hclClassification}
                </span>
              </div>

              <p className="text-[13px] text-[var(--neutral)] mb-5">
                {exec.title} · {exec.company}
              </p>

              {/* Editorial break */}
              <div className="h-px bg-[var(--border)] mb-5" />

              {/* Deal likelihood barometer */}
              <div className="w-[60%]">
                <DealGauge likelihood={profile?.dealLikelihood ?? 'Possible'} compact />
              </div>

              {/* Opportunity tags */}
              {topOpps.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {topOpps.map((o) => (
                    <span
                      key={o.area}
                      className="font-mono text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-sm"
                    >
                      {o.area}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
