import { useNavigate } from "react-router-dom";
import { executives } from "@/data/executives";
import { hclParameterProfiles } from "@/data/hcl-parameters";

const classificationStyles: Record<string, string> = {
  Pro: "bg-[var(--accent)] text-[var(--accent-light)]",
  Neutral: "bg-[var(--neutral)] text-[var(--bg)]",
  Anti: "bg-[var(--risk)] text-[var(--bg)]",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const proCount = executives.filter((e) => e.hclClassification === "Pro").length;

  const allOpportunities = new Set(
    hclParameterProfiles.flatMap((p) => p.opportunityAreas.map((o) => o.area))
  );

  const lastUpdated = executives.reduce((latest, e) =>
    e.lastUpdated > latest ? e.lastUpdated : latest, executives[0].lastUpdated
  );

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
    <div className="p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-5xl leading-tight">Account Intelligence</h1>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--neutral)] mt-2">
            HCL Strategic Targets — Active Monitoring
          </p>
        </div>
        <p className="font-mono text-[11px] text-[var(--neutral)] pt-2">{today}</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-[var(--border)] rounded-sm px-6 py-4"
          >
            <p className="font-mono text-2xl font-medium">{s.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--neutral)] mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Executive grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {executives.map((exec) => {
          const profile = hclParameterProfiles.find((p) => p.executiveId === exec.id);
          const topOpps = profile?.opportunityAreas.slice(0, 2) ?? [];

          return (
            <button
              key={exec.id}
              onClick={() => navigate(`/profile/${exec.id}`)}
              className="text-left border border-[var(--border)] rounded-sm p-6 bg-[var(--card-bg)] transition-colors duration-200 hover:border-[var(--accent)] group"
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

              {/* Deal interest score */}
              <p className="font-mono text-4xl text-[var(--accent)] leading-none">
                {profile?.dealInterestScore ?? exec.hclScore}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--neutral)] mt-1 mb-4">
                Deal Interest
              </p>

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
