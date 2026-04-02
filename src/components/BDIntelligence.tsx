import { BarChart2, ArrowRight } from 'lucide-react';
import type { Executive } from '@/types/executive';
import type { HCLParameterProfile } from '@/types/hcl-parameters';
import { HCL_COMPETITORS } from '@/utils/competitors';

interface Props {
  exec: Executive;
  profile?: HCLParameterProfile;
}

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--border)] rounded-sm p-6 bg-[var(--card-bg)]">
      <p className="text-sm font-medium mb-4">{title}</p>
      {children}
    </div>
  );
}

// ─── DECISION STYLE TAG DETECTION ───
const DECISION_TAGS: { keywords: string[]; label: string }[] = [
  { keywords: ['data', 'metrics', 'roi', 'numbers'], label: 'DATA-DRIVEN' },
  { keywords: ['values', 'culture', 'people', 'community'], label: 'VALUES-LED' },
  { keywords: ['long-term', 'strategic', 'future'], label: 'LONG-HORIZON' },
  { keywords: ['efficiency', 'cost', 'margin'], label: 'COST-CONSCIOUS' },
];

function deriveDecisionTags(insights: string[]): string[] {
  const combined = insights.join(' ').toLowerCase();
  return DECISION_TAGS
    .filter(({ keywords }) => keywords.some((k) => combined.includes(k)))
    .map(({ label }) => label);
}

// ─── CARD 1: COMPETITIVE EXPOSURE ───
function CompetitiveExposure({ exec, profile }: Props) {
  const competitorRoles = exec.careerJourney.filter((c) =>
    HCL_COMPETITORS.some((comp) => c.company.toLowerCase().includes(comp.toLowerCase()))
  );

  // Scan competitorsPartners for ecosystem mentions
  const ecosystemMentions: { competitor: string; source: string }[] = [];
  (exec.competitorsPartners ?? []).forEach((cp) => {
    const cpLower = cp.toLowerCase();
    HCL_COMPETITORS.forEach((comp) => {
      if (cpLower.includes(comp.toLowerCase()) && !ecosystemMentions.some((e) => e.competitor === comp)) {
        ecosystemMentions.push({ competitor: comp, source: cp });
      }
    });
  });

  // videoGallery is optional — check if it exists
  const videoGallery = (exec as any).videoGallery as { title?: string; source: string; date: string; tier: string }[] | undefined;
  const conferenceOverlaps = (videoGallery ?? []).filter(
    (v) => v.tier === 'conference' && HCL_COMPETITORS.some((comp) => v.source.toLowerCase().includes(comp.toLowerCase()))
  );

  const competitorSignals = (profile as any)?.competitorSignals as string[] | undefined;

  const hasData = competitorRoles.length > 0 || conferenceOverlaps.length > 0 || ecosystemMentions.length > 0 || (competitorSignals?.length ?? 0) > 0;

  return (
    <CardShell title="Competitive Exposure">
      {/* HIGH CONFIDENCE: Career history */}
      {competitorRoles.length > 0 && (
        <>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--neutral)', marginBottom: 6 }}>HIGH CONFIDENCE</p>
          {competitorRoles.map((role, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px]">{role.company}</span>
                <span className="font-mono text-[9px] bg-[#FFF3CD] text-[#856404] px-2 py-0.5 rounded-full uppercase">Former Employer</span>
              </div>
              <p className="font-mono text-[10px] text-[var(--neutral)]">{role.from} – {role.to}</p>
              <p className="text-[12px] italic text-[var(--neutral)] mt-0.5">Possible incumbent familiarity</p>
            </div>
          ))}
        </>
      )}

      {conferenceOverlaps.map((evt, i) => (
        <div key={`evt-${i}`} className="mb-3 last:mb-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px]">{evt.source}</span>
            <span className="font-mono text-[9px] bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-full uppercase">Event Co-appearance</span>
          </div>
          <p className="font-mono text-[10px] text-[var(--neutral)]">{evt.date}</p>
        </div>
      ))}

      {/* MEDIUM CONFIDENCE: Ecosystem mentions from competitorsPartners */}
      {ecosystemMentions.length > 0 && (
        <>
          {(competitorRoles.length > 0 || conferenceOverlaps.length > 0) && <div className="h-px bg-[var(--border)] my-3" />}
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--neutral)', marginBottom: 6 }}>MEDIUM CONFIDENCE</p>
          {ecosystemMentions.map((em, i) => (
            <div key={`eco-${i}`} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px]">{em.competitor}</span>
                <span className="font-mono text-[9px] bg-[#E8F0EB] text-[var(--accent)] px-2 py-0.5 rounded-full uppercase">Ecosystem Mention</span>
              </div>
              <p className="text-[12px] italic text-[var(--neutral)] mt-0.5">Referenced in executive's ecosystem/vendor context</p>
            </div>
          ))}
        </>
      )}

      {/* INFERRED: competitorSignals from HCL profile */}
      {competitorSignals && competitorSignals.length > 0 && (
        <>
          {(competitorRoles.length > 0 || conferenceOverlaps.length > 0 || ecosystemMentions.length > 0) && <div className="h-px bg-[var(--border)] my-3" />}
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--neutral)', marginBottom: 6 }}>INFERRED</p>
          {competitorSignals.map((sig, i) => (
            <div key={`sig-${i}`} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[9px] bg-[#FFF9E6] text-[#856404] px-2 py-0.5 rounded-full uppercase">Inferred Signal</span>
              </div>
              <p className="text-[12px] italic text-[var(--neutral)] mt-0.5">{sig}</p>
            </div>
          ))}
        </>
      )}

      {!hasData && (
        <p className="text-[13px] italic text-[var(--neutral)]">No competitor exposure detected in public record</p>
      )}

      <p className="font-mono text-[10px] text-[var(--neutral)] mt-4">
        Based on: career history + ecosystem partners + inferred signals
      </p>
    </CardShell>
  );
}

// ─── CARD 2: DEAL SIZE CONTEXT ───
function DealSizeContext({ exec }: { exec: Executive }) {
  const metrics = exec.kpiMetrics.filter((m) => !m.startsWith('[')).slice(0, 4);

  return (
    <CardShell title="Deal Size Context">
      {metrics.length > 0 ? (
        <div className="space-y-2 mb-4">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
              <span className="text-[13px]">{m}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] italic text-[var(--neutral)] mb-4">KPI data pending — awaiting profile enrichment</p>
      )}

      {exec.annualRevenue && (
        <p className="font-mono text-sm text-[var(--accent)]">Revenue: {exec.annualRevenue}</p>
      )}
    </CardShell>
  );
}

// ─── CARD 3: DECISION STYLE ───
function DecisionStyle({ exec }: { exec: Executive }) {
  const insights = exec.decisionInsights.filter((d) => !d.startsWith('['));
  const tags = deriveDecisionTags(insights);

  return (
    <CardShell title="Decision Style">
      {insights.length > 0 ? (
        <>
          <ol className="space-y-2 mb-4">
            {insights.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-[var(--accent)] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px]">{d}</span>
              </li>
            ))}
          </ol>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="font-mono text-[9px] uppercase border border-[var(--accent)] text-[var(--accent)] px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-[13px] italic text-[var(--neutral)]">Decision profile pending</p>
      )}
    </CardShell>
  );
}

// ─── CARD 4: GROWTH PRIORITIES ───
function GrowthPriorities({ exec, profile }: Props) {
  const opps = exec.opportunities.filter((o) => !o.startsWith('['));
  const hclOverlap = profile?.opportunityAreas.filter((o) => o.confidenceScore >= 60) ?? [];

  return (
    <CardShell title="Their Growth Priorities">
      <p className="font-mono text-[9px] text-[var(--neutral)] uppercase tracking-wide -mt-2 mb-3">
        Executive's own stated outlook
      </p>

      {opps.length > 0 ? (
        <div className="space-y-2">
          {opps.map((o, i) => (
            <div key={i} className="flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
              <span className="text-[13px]">{o}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] italic text-[var(--neutral)]">Growth priorities pending enrichment</p>
      )}

      {hclOverlap.length > 0 && (
        <>
          <div className="h-px bg-[var(--border)] my-4" />
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--neutral)] mb-2">HCL-Identified Overlap</p>
          <div className="space-y-1.5">
            {hclOverlap.map((o) => (
              <div key={o.area} className="flex items-center justify-between">
                <span className="text-[13px]">{o.area}</span>
                <span className="font-mono text-[10px] text-[var(--accent)]">{o.confidenceScore}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </CardShell>
  );
}

// ─── MAIN EXPORT ───
export default function BDIntelligence({ exec, profile }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      <CompetitiveExposure exec={exec} profile={profile} />
      <DealSizeContext exec={exec} />
      <DecisionStyle exec={exec} />
      <GrowthPriorities exec={exec} profile={profile} />
    </div>
  );
}
