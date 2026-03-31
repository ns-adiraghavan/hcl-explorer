import { useState, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Globe, MessageCircle } from "lucide-react";
import { getExecutiveById } from "@/data/executives";
import { getParameterProfileById, type HCLParameterProfile } from "@/data/hcl-parameters";
import DealGauge from "@/components/DealGauge";
import OutreachDraft from "@/components/OutreachDraft";
import { getServiceLineScore } from "@/utils/buildDraft";

const classificationBadge: Record<string, string> = {
  Pro: "bg-[var(--accent)] text-[var(--accent-light)]",
  Neutral: "bg-[var(--neutral)] text-[var(--bg)]",
  Anti: "bg-[var(--risk)] text-[var(--bg)]",
};

const signalBadge: Record<string, string> = {
  STRONG: "bg-[var(--accent)] text-[var(--accent-light)]",
  MODERATE: "bg-[var(--neutral)] text-[var(--bg)]",
  WEAK: "bg-[var(--risk)] text-[var(--bg)]",
};

const platformIcon: Record<string, React.ElementType> = {
  linkedin: Globe,
  twitter: MessageCircle,
  instagram: Globe,
};

const parameterLabels: { key: keyof Pick<HCLParameterProfile, "publicPersona" | "psychographicMindset" | "digitalActivity" | "topicAffinity" | "painPointIndicators" | "ecosystemVendorExposure" | "eventPresence" | "contentInteraction">; label: string }[] = [
  { key: "publicPersona", label: "Public Persona" },
  { key: "psychographicMindset", label: "Psychographic & Mindset" },
  { key: "digitalActivity", label: "Digital Activity" },
  { key: "topicAffinity", label: "Topic Affinity" },
  { key: "painPointIndicators", label: "Pain Point Indicators" },
  { key: "ecosystemVendorExposure", label: "Ecosystem & Vendor Exposure" },
  { key: "eventPresence", label: "Event & Presence" },
  { key: "contentInteraction", label: "Content Interaction" },
];

function signalBorderClass(level: string) {
  if (level === "STRONG") return "border-l-2 border-l-[var(--accent)]";
  if (level === "WEAK") return "border-l-2 border-l-[var(--risk)]";
  return "";
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--neutral)] shrink-0">
        {title}
      </span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

export default function Profile() {
  // DATA SOURCE: Currently using static mock from /data/executives.ts
  // TO CONNECT BACKEND: Replace the import with a call to the service functions in /services/api.ts
  // See /services/api.ts for the full interface contract
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exec = getExecutiveById(id ?? "");
  const profile = getParameterProfileById(id ?? "");

  // Service line state — shared between Outreach Draft and DealGauge
  const SERVICE_LINES = [
    'AI & Analytics', 'Cloud Transformation', 'CX & Digital',
    'Managed Services', 'Security & Compliance', 'Infrastructure',
  ];

  const defaultLine = useMemo(() => {
    if (!profile?.opportunityAreas.length) return SERVICE_LINES[0];
    const topArea = profile.opportunityAreas.reduce((best, o) =>
      o.confidenceScore > best.confidenceScore ? o : best
    );
    const match = SERVICE_LINES.find((sl) =>
      sl.toLowerCase().includes(topArea.area.split(' ')[0].toLowerCase()) ||
      topArea.area.toLowerCase().includes(sl.split(' ')[0].toLowerCase())
    );
    return match ?? SERVICE_LINES[0];
  }, [profile]);

  const [selectedLine, setSelectedLine] = useState(defaultLine);

  const fitScore = useMemo(() => {
    if (!profile) return exec?.hclScore ?? 0;
    return getServiceLineScore(profile, selectedLine);
  }, [profile, selectedLine, exec]);

  if (!exec) {
    return (
      <div className="p-10">
        <button onClick={() => navigate("/")} className="font-mono text-[11px] text-[var(--accent)] flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All Targets
        </button>
        <p className="font-display text-2xl">Executive not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Back nav */}
      <button onClick={() => navigate("/")} className="font-mono text-[11px] text-[var(--accent)] flex items-center gap-1 mb-8 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> All Targets
      </button>

      {/* ─── SECTION 1: IDENTITY HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
        <div className="flex-1">
          <h1 className="font-display text-[40px] md:text-[56px] leading-[1.05]">{exec.name}</h1>
          <p className="text-base text-[var(--neutral)] mt-2">
            {exec.title} · {exec.company} · {exec.location}
          </p>
          {exec.areasOfFocus.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {exec.areasOfFocus.map((a) => (
                <span key={a} className="font-mono text-[11px] border border-[var(--border)] rounded-full px-3 py-1">
                  {a}
                </span>
              ))}
            </div>
          )}
          {/* Pull-quote from recommendations */}
          {exec.recommendations && exec.recommendations.length > 0 && (
            <div className="mt-5">
              <p className="font-display italic text-[15px] text-[var(--neutral)] leading-relaxed">
                <span className="text-[var(--accent)] text-xl mr-1">&#x201C;</span>
                {exec.recommendations[0].text.length > 160
                  ? `${exec.recommendations[0].text.slice(0, 160)}…`
                  : exec.recommendations[0].text}
              </p>
              <p className="font-mono text-[10px] text-[var(--neutral)] mt-1">
                — {exec.recommendations[0].from}
              </p>
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-lg bg-[#F0EDE6] p-6 text-center">
          <DealGauge score={fitScore} classification={exec.hclClassification} label={`FIT: ${selectedLine.toUpperCase()}`} />
          <p className="font-mono text-[10px] text-[var(--neutral)] mt-2 max-w-[200px]">
            Showing fit score for {selectedLine} · Base score: {exec.hclScore}
          </p>
        </div>
      </div>

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 2: HCL INTELLIGENCE SIGNALS ─── */}
      <SectionHeader title="HCL Signals" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* Classification card */}
        <div className="border border-[var(--border)] rounded-sm p-6 bg-[var(--card-bg)]">
          <p className="text-sm mb-4">Engagement Classification</p>
          <span className={`inline-block font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${classificationBadge[exec.hclClassification]}`}>
            {exec.hclClassification}
          </span>
          <ul className="space-y-2">
            {exec.hclClassificationReason.map((r, i) => (
              <li key={i} className="text-[13px] text-[var(--neutral)] flex gap-2">
                <span className="text-[var(--accent)] mt-0.5">•</span> {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunity areas card */}
        <div className="border border-[var(--border)] rounded-sm p-6 bg-[var(--card-bg)]">
          <p className="text-sm mb-4">Identified Opportunities</p>
          {profile?.opportunityAreas.length ? (
            <div className="space-y-4">
              {profile.opportunityAreas.map((o) => (
                <div key={o.area}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{o.area}</span>
                    <span className="font-mono text-[10px] text-[var(--neutral)] uppercase">{o.type}</span>
                  </div>
                  <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${o.confidenceScore}%` }} />
                  </div>
                  <p className="font-mono text-[10px] text-[var(--neutral)] mt-0.5 text-right">{o.confidenceScore}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-[var(--neutral)]">No opportunities identified yet.</p>
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 3: PARAMETER BREAKDOWN ─── */}
      <SectionHeader title="Parameter Analysis" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {parameterLabels.map(({ key, label }) => {
          const param = profile?.[key];
          if (!param) return null;
          return (
            <div key={key} className={`border border-[var(--border)] rounded-sm p-5 bg-[var(--card-bg)] ${signalBorderClass(param.signalLevel)}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium">{label}</p>
                <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${signalBadge[param.signalLevel]}`}>
                  {param.signalLevel}
                </span>
              </div>
              <p className="text-[12px] text-[var(--neutral)] leading-relaxed mb-3 line-clamp-2">{param.summary}</p>
              <span className="font-mono text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-sm">
                {param.derivedSignal}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 4: PROFILE INSIGHTS ─── */}
      <SectionHeader title="Profile Insights" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Vision quotes */}
        <div>
          <p className="text-sm mb-3">Vision & Philosophy</p>
          {exec.visionQuotes.length > 0 ? (
            <div className="space-y-3">
              {exec.visionQuotes.map((q, i) => (
                <blockquote key={i} className="font-display italic text-base border-l-2 border-[var(--accent)] pl-4">
                  {q}
                </blockquote>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-[var(--neutral)]">No quotes captured yet.</p>
          )}
        </div>

        {/* Challenges */}
        <div>
          <p className="text-sm mb-3">Challenges</p>
          {exec.challenges.length > 0 ? (
            <ul className="space-y-2">
              {exec.challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--risk)] mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-[var(--neutral)]">No challenges documented yet.</p>
          )}
        </div>
      </div>

      {/* About Bio — In Their Own Words */}
      {exec.aboutBio && !exec.aboutBio.startsWith('[') && (
        <AboutBioBlock text={exec.aboutBio} />
      )}

      {/* Strategies */}
      {exec.strategies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {exec.strategies.map((s, i) => (
            <div key={i} className="border border-[var(--border)] rounded-sm p-4 bg-[var(--card-bg)]">
              <span className="font-mono text-[10px] text-[var(--neutral)]">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[13px] mt-1">{s}</p>
            </div>
          ))}
        </div>
      )}

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 5: COMPANY & BIOGRAPHICAL ─── */}
      <SectionHeader title="Institutional Data" />

      {/* Metrics row */}
      {(exec.annualRevenue || exec.teamSize || exec.netWorth) && (
        <div className="flex gap-10 mb-8">
          {exec.annualRevenue && (
            <div>
              <p className="font-mono text-2xl">{exec.annualRevenue}</p>
              <p className="font-mono text-[10px] uppercase text-[var(--neutral)] mt-0.5">Revenue</p>
            </div>
          )}
          {exec.teamSize && (
            <div>
              <p className="font-mono text-2xl">{exec.teamSize}</p>
              <p className="font-mono text-[10px] uppercase text-[var(--neutral)] mt-0.5">Team Size</p>
            </div>
          )}
          {exec.netWorth && (
            <div>
              <p className="font-mono text-2xl">{exec.netWorth}</p>
              <p className="font-mono text-[10px] uppercase text-[var(--neutral)] mt-0.5">Net Worth</p>
            </div>
          )}
        </div>
      )}

      {/* Career timeline */}
      {exec.careerJourney.length > 0 ? (
        <div className="relative pl-6 mb-10">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-[var(--border)]" />
          {exec.careerJourney.map((c, i) => (
            <div key={i} className="relative mb-5 last:mb-0">
              <div className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
              <p className="text-sm font-medium">{c.role}</p>
              <p className="text-[13px] text-[var(--neutral)]">{c.company} · {c.from}–{c.to}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-[var(--neutral)] mb-10">Career journey data pending.</p>
      )}

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 6: SOCIAL PULSE ─── */}
      <SectionHeader title="Social Pulse" />
      {exec.socialPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {exec.socialPosts.map((post, i) => {
            const Icon = platformIcon[post.platform] ?? Globe;
            return (
              <div key={i} className="border border-[var(--border)] rounded-sm p-5 bg-[var(--card-bg)]">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-[var(--neutral)]" />
                  <span className="font-mono text-[10px] uppercase text-[var(--neutral)]">{post.platform}</span>
                  <span className="font-mono text-[10px] text-[var(--neutral)] ml-auto">{post.date}</span>
                </div>
                <p className="text-[13px] leading-relaxed">
                  {post.text.length > 120 ? `${post.text.slice(0, 120)}…` : post.text}
                </p>
                {post.engagement && (
                  <p className="font-mono text-[10px] text-[var(--neutral)] mt-2">{post.engagement}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm italic text-[var(--neutral)] mb-10">No recent social activity tracked.</p>
      )}

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 7: OUTREACH DRAFT ─── */}
      <SectionHeader title="Outreach Draft" />
      <OutreachDraft exec={exec} profile={profile} selectedLine={selectedLine} onLineChange={setSelectedLine} />
    </div>
  );
}
