type Likelihood = 'Unlikely' | 'Low' | 'Possible' | 'Likely' | 'Strong';

interface DealGaugeProps {
  likelihood: Likelihood;
  serviceLine?: string;
  opportunityAreas?: { area: string; confidenceScore: number }[];
  compact?: boolean;
}

const ZONES: { label: Likelihood; color: string }[] = [
  { label: 'Unlikely', color: '#C0392B' },
  { label: 'Low', color: '#E67E22' },
  { label: 'Possible', color: '#B8860B' },
  { label: 'Likely', color: '#7FB069' },
  { label: 'Strong', color: '#1A4D3A' },
];

function getServiceLineLikelihood(
  serviceLine: string,
  opportunityAreas: { area: string; confidenceScore: number }[]
): Likelihood {
  const match = opportunityAreas.find((o) =>
    o.area.toLowerCase().includes(serviceLine.split(' ')[0].toLowerCase()) ||
    serviceLine.toLowerCase().includes(o.area.split(' ')[0].toLowerCase())
  );
  if (!match || match.confidenceScore < 50) return 'Low';
  if (match.confidenceScore >= 75) return 'Likely';
  return 'Possible';
}

export default function DealGauge({ likelihood, serviceLine, opportunityAreas, compact }: DealGaugeProps) {
  const activeIndex = ZONES.findIndex((z) => z.label === likelihood);

  const fitLikelihood =
    serviceLine && opportunityAreas
      ? getServiceLineLikelihood(serviceLine, opportunityAreas)
      : null;
  const fitIndex = fitLikelihood ? ZONES.findIndex((z) => z.label === fitLikelihood) : -1;

  // When a service line is selected, the bar highlights the fit zone instead
  const displayIndex = fitIndex >= 0 ? fitIndex : activeIndex;

  return (
    <div className="flex flex-col items-center">
      {/* Title — hidden in compact mode */}
      {!compact && (
        <p
          className="mb-2"
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 8,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--neutral)',
          }}
        >
          HCL Deal Likelihood
        </p>
      )}

      {/* Fit indicator row (▲) */}
      {fitLikelihood && !compact && (
        <div className="flex w-full" style={{ gap: 2 }}>
          {ZONES.map((z, i) => (
            <div key={z.label} className="flex-1 flex justify-center" style={{ height: 14 }}>
              {i === fitIndex && (
                <span
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: 10,
                    color: 'var(--accent)',
                    lineHeight: 1,
                  }}
                >
                  ▲
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bar segments */}
      <div className="flex w-full" style={{ gap: 2 }}>
        {ZONES.map((z, i) => (
          <div key={z.label} className="flex-1 flex flex-col items-center">
            {/* Active border indicator */}
            <div
              style={{
                height: 2,
                width: '100%',
                backgroundColor: i === displayIndex ? z.color : 'transparent',
                borderRadius: 1,
                marginBottom: 2,
              }}
            />
            {/* Segment */}
            <div
              style={{
                height: 12,
                width: '100%',
                backgroundColor: z.color,
                opacity: i === displayIndex ? 1 : 0.18,
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>

      {/* Active zone label */}
      {!compact && (
        <div className="flex w-full" style={{ gap: 2 }}>
          {ZONES.map((z, i) => (
            <div key={z.label} className="flex-1 flex justify-center">
              {i === displayIndex && (
                <span
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    color: z.color,
                    marginTop: 4,
                  }}
                >
                  {z.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Compact: label below bar */}
      {compact && (
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 11,
            color: ZONES[displayIndex]?.color,
            marginTop: 4,
          }}
        >
          {ZONES[displayIndex]?.label ?? likelihood}
        </span>
      )}

      {/* Service line fit label */}
      {serviceLine && !compact && (
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 9,
            color: 'var(--neutral)',
            marginTop: 4,
          }}
        >
          Fit: {serviceLine}
        </p>
      )}
    </div>
  );
}
