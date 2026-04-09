import { useState, useEffect, useMemo } from "react";
import { ExternalLink, Download } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Globe, MessageCircle } from "lucide-react";

import { getExecutive, getHCLProfile } from "@/services/api";
import type { Executive } from "@/types/executive";
import type { HCLParameterProfile } from "@/types/hcl-parameters";
import DealGauge from "@/components/DealGauge";
import OutreachDraft from "@/components/OutreachDraft";
import { getServiceLineScore, getTopParameters } from "@/utils/buildDraft";
import BDIntelligence from "@/components/BDIntelligence";

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

const platformDisplayName: Record<string, string> = {
  linkedin: "professional network",
  twitter: "twitter",
  instagram: "instagram",
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

function signalGradientStyle(level: string): React.CSSProperties {
  if (level === "STRONG") return { background: 'linear-gradient(to bottom, var(--accent-light) 0px, var(--card-bg) 48px)' };
  if (level === "WEAK") return { background: 'linear-gradient(to bottom, #FDF0EE 0px, var(--card-bg) 48px)' };
  return {};
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-1.5 h-1.5 bg-[var(--accent)] shrink-0" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--neutral)] shrink-0">
        {title}
      </span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

function AboutBioBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-6">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--neutral)] mb-2">In Their Own Words</p>
      <p className={`text-[15px] leading-[1.8] ${expanded ? '' : 'line-clamp-4'}`}>{text}</p>
      {text.length > 300 && (
        <button onClick={() => setExpanded(!expanded)} className="font-mono text-[11px] text-[var(--accent)] mt-1 hover:underline">
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exec, setExec] = useState<Executive | null>(null);
  const [profile, setProfile] = useState<HCLParameterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [e, p] = await Promise.all([
          getExecutive(id ?? ""),
          getHCLProfile(id ?? ""),
        ]);
        setExec(e ?? null);
        setProfile(p ?? null);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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

  const dealLikelihood = profile?.dealLikelihood ?? 'Possible';

  if (loading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[50vh]">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--neutral)]">Loading profile…</p>
      </div>
    );
  }

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
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/")} className="font-mono text-[11px] text-[var(--accent)] flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> All Targets
        </button>
        <button
          className="font-mono text-[11px] border border-[var(--border)] rounded-sm px-3 py-1.5 flex items-center gap-1.5 hover:bg-[var(--card-bg)] transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
      </div>

      {/* ─── SECTION 1: IDENTITY HEADER ─── */}
      <div className="flex flex-col md:flex-row items-stretch gap-8 mb-8">
        <div className="flex-1 min-w-0">
          {/* Accent eyebrow line */}
          <div className="w-12 h-px bg-[var(--accent)] mb-3" />
          <h1 className="font-display text-[72px] xl:text-[80px] leading-[1] tracking-[-3px]">{exec.name}</h1>
          <p className="text-base text-[var(--neutral)] mt-2">
            {exec.title} <span className="text-[var(--accent)]">·</span> <span className="text-[var(--ink)] font-medium">{exec.company}</span> <span className="text-[var(--accent)]">·</span> {exec.location}
          </p>
          {(exec.areasOfFocus?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(exec.areasOfFocus ?? []).map((a) => (
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
                {exec.recommendations[0].text}
              </p>
              <p className="font-mono text-[10px] text-[var(--neutral)] mt-1">
                — {exec.recommendations[0].from}
              </p>
            </div>
          )}
        </div>
        {/* Gauge + service line selector */}
        <div className="shrink-0 w-[280px] flex flex-col justify-center">
          <DealGauge
            likelihood={dealLikelihood}
            serviceLine={selectedLine}
            opportunityAreas={profile?.opportunityAreas}
          />
          {/* Service line pills */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {SERVICE_LINES.map((line) => (
              <button
                key={line}
                onClick={() => setSelectedLine(line)}
                className={`font-mono text-[10px] px-3 py-1 rounded-full border transition-colors duration-150 ${
                  selectedLine === line
                    ? 'bg-[var(--accent)] text-[var(--accent-light)] border-[var(--accent)]'
                    : 'bg-[var(--card-bg)] text-[var(--neutral)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--ink)]'
                }`}
              >
                {line}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 2: HCL INTELLIGENCE SIGNALS ─── */}
      <SectionHeader title="HCL Signals" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* Classification card */}
        <div className="border border-[var(--border)] rounded-sm p-6 bg-[var(--card-bg)]">
          <p className="text-sm mb-4">Engagement Classification</p>
          <span className={`inline-block font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-full ${classificationBadge[(exec.hclClassification ?? profile?.overallClassification ?? 'Neutral')]}`}>
            {exec.hclClassification ?? profile?.overallClassification ?? 'Neutral'}
          </span>

          {/* Classification basis — parameter evidence */}
          {profile && (() => {
            const topParams = getTopParameters(profile, 3);
            return topParams.length > 0 ? (
              <div className="mt-3">
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--neutral)' }}>
                  Classification basis
                </p>
                <div className="space-y-3 mt-2">
                  {topParams.map(({ key, label, param }) => (
                    <div key={key}>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px]">{label}</span>
                        <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full ${signalBadge[param.signalLevel]}`}>
                          {param.signalLevel}
                        </span>
                      </div>
                      <p className="text-[12px] italic text-[var(--neutral)] ml-2 mt-0.5">{param.derivedSignal}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Overall assessment */}
          <div className="h-px bg-[var(--border)] my-4" />
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--neutral)', marginBottom: 8 }}>
            Overall assessment
          </p>
          <ul className="space-y-2">
            {(exec.hclClassificationReason ?? profile?.hclClassificationReason ?? []).map((r, i) => (
              <li key={i} className="text-[12px] text-[var(--neutral)] flex gap-2">
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
              {profile.opportunityAreas.map((o) => {
                const signal: "STRONG" | "MODERATE" | "WEAK" = o.confidenceScore >= 70 ? "STRONG" : o.confidenceScore >= 50 ? "MODERATE" : "WEAK";
                const area = o.area.toLowerCase();
                const justification =
                  (area.includes("managed services") || area.includes("infrastructure") || area.includes("network") || area.includes("vendor management"))
                    ? profile.painPointIndicators?.derivedSignal
                  : (area.includes("ai") || area.includes("cloud") || area.includes("analytics") || area.includes("iot") || area.includes("edge"))
                    ? profile.topicAffinity?.derivedSignal
                  : area.includes("cybersecurity")
                    ? profile.ecosystemVendorExposure?.derivedSignal
                  : (area.includes("cx") || area.includes("digital transformation"))
                    ? profile.psychographicMindset?.derivedSignal
                  : profile.publicPersona?.derivedSignal;
                return (
                  <div
                    key={o.area}
                    className={`rounded-sm border p-3 ${signalBorderClass(signal)}`}
                    style={signalGradientStyle(signal)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{o.area}</span>
                      <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full ${signalBadge[signal]}`}>{signal}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--neutral)] uppercase mt-1 inline-block">{o.type}</span>
                    {justification && (
                      <span className="font-mono text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-sm mt-2 inline-block">{justification}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm italic text-[var(--neutral)]">No opportunities identified yet.</p>
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── BD INTELLIGENCE ─── */}
      <SectionHeader title="BD Intelligence" />
      <BDIntelligence exec={exec} profile={profile} />

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 3: PARAMETER BREAKDOWN ─── */}
      <SectionHeader title="Parameter Analysis" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {parameterLabels.map(({ key, label }) => {
          const param = profile?.[key];
          if (!param) return null;
          return (
            <div
              key={key}
              className={`border border-[var(--border)] rounded-sm p-6 ${signalBorderClass(param.signalLevel)}`}
              style={signalGradientStyle(param.signalLevel)}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium">{label}</p>
                <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${signalBadge[param.signalLevel]}`}>
                  {param.signalLevel}
                </span>
              </div>
              <p className="text-[12px] text-[var(--neutral)] leading-relaxed mb-3">{param.summary}</p>
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
          {(exec.visionQuotes?.length ?? 0) > 0 ? (
            <div className="space-y-5">
              {(exec.visionQuotes ?? []).map((q, i) => (
                <blockquote key={i} className="relative pl-6 font-display italic text-base border-l-2 border-[var(--accent)]">
                  <span className="absolute top-0 left-0 font-display text-[64px] leading-none text-[var(--accent)] opacity-30 pointer-events-none select-none" style={{ fontStyle: 'normal' }}>
                    &#x201C;
                  </span>
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
          {(exec.challenges?.length ?? 0) > 0 ? (
            <ul className="space-y-2">
              {(exec.challenges ?? []).map((c, i) => (
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
      {(exec.strategies?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {(exec.strategies ?? []).map((s, i) => (
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

      {/* Skills */}
      {exec.skills && exec.skills.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--neutral)] mb-2">Known Expertise</p>
          <div className="flex flex-wrap gap-1.5">
            {exec.skills.slice(0, 8).map((s) => (
              <span key={s} className="font-mono text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Career timeline */}
      {(exec.careerJourney?.length ?? 0) > 0 ? (
        <div className="relative pl-6 mb-10">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-[var(--border)]" />
          {(exec.careerJourney ?? []).map((c, i) => (
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
      {(exec.socialPosts?.length ?? 0) > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {(exec.socialPosts ?? []).map((post, i) => {
            const Icon = platformIcon[post.platform] ?? Globe;
            return (
              <div key={i} className="border border-[var(--border)] rounded-sm p-5 bg-[var(--card-bg)]">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-[var(--neutral)]" />
                  <span className="font-mono text-[10px] uppercase text-[var(--neutral)]">{platformDisplayName[post.platform] ?? post.platform}</span>
                  <span className="font-mono text-[10px] text-[var(--neutral)] ml-auto">{post.date}</span>
                </div>
                <p className="text-[13px] leading-relaxed">
                  {post.text}
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

      {/* ─── WRITTEN INTELLIGENCE ─── */}
      {exec.articlesWritten && exec.articlesWritten.length > 0 && (
        <>
          <div className="h-px bg-[var(--border)] mb-10" />
          <SectionHeader title="Written Intelligence" />
          <div className="mb-10">
            {exec.articlesWritten.map((article, i) => (
              <div
                key={i}
                className={`py-4 ${i < exec.articlesWritten!.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {article.url ? (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[var(--accent)] flex items-center gap-1">
                        {article.title} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm">{article.title}</p>
                    )}
                    {article.excerpt && (
                      <p className="text-[13px] text-[var(--neutral)] mt-0.5">{article.excerpt}</p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[var(--neutral)] shrink-0">{article.date}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── VIDEO GALLERY ─── */}
      {exec.videoGallery && exec.videoGallery.length > 0 && (
        <>
          <div className="h-px bg-[var(--border)] mb-10" />
          <SectionHeader title="Video Gallery" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {exec.videoGallery.map((video, i) => {
              const isYouTube = video.url?.includes('youtube.com/watch?v=');
              const videoId = isYouTube ? video.url!.split('v=')[1] : null;
              const tierSignal = video.tier === 'direct' ? 'STRONG' : video.tier === 'conference' ? 'MODERATE' : 'WEAK';

              if (isYouTube && videoId) {
                return (
                  <div key={i} className="border border-[var(--border)] rounded-sm bg-[var(--card-bg)] overflow-hidden">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="absolute top-0 left-0 w-full h-full"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium">{video.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] text-[var(--neutral)]">{video.source} · {video.date}</span>
                        <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full ${signalBadge[tierSignal]}`}>{tierSignal}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="border border-[var(--border)] rounded-sm p-5 bg-[var(--card-bg)]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{video.title}</p>
                    {video.url && (
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[var(--neutral)] hover:text-[var(--accent)]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-[var(--neutral)]">{video.source} · {video.date}</span>
                    <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full ${signalBadge[tierSignal]}`}>{tierSignal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* ─── SECTION 7: OUTREACH DRAFT ─── */}
      <SectionHeader title="Outreach Draft" />
      <OutreachDraft exec={exec} profile={profile} selectedLine={selectedLine} onLineChange={setSelectedLine} />
    </div>
  );
}