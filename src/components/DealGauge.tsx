import { useState, useEffect } from 'react';

interface DealGaugeProps {
  score: number;
  classification: "Pro" | "Neutral" | "Anti";
  label?: string;
}

const classificationColor: Record<string, string> = {
  Pro: "#1A4D3A",
  Neutral: "#B8860B",
  Anti: "#C0392B",
};

export default function DealGauge({ score, classification, label }: DealGaugeProps) {
  const cx = 100;
  const cy = 100;
  const r = 70;
  const stroke = 14;
  const color = classificationColor[classification];

  const halfCircumference = Math.PI * r;
  const filled = (score / 100) * halfCircumference;

  const needleAngle = Math.PI - (score / 100) * Math.PI;
  const nx = cx + r * Math.cos(needleAngle);
  const ny = cy - r * Math.sin(needleAngle);

  // Fade on score change
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [score]);

  const displayLabel = label ?? 'HCL DEAL INTEREST';

  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[200px]">
      {/* Background arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#E5E2DB"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${halfCircumference}`}
      />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill={color} />

      {/* Score with fade */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        className="fill-[var(--ink)]"
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 32,
          fontWeight: 700,
          opacity: visible ? 1 : 0,
          transition: 'opacity 150ms ease',
        }}
      >
        {score}
      </text>

      {/* Label */}
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fill="#8A8A7A"
        style={{ fontFamily: '"DM Mono", monospace', fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase" }}
      >
        {displayLabel}
      </text>

      {/* Min/Max */}
      <text x={cx - r - 2} y={cy + 14} textAnchor="middle" fill="#8A8A7A" style={{ fontFamily: '"DM Mono", monospace', fontSize: 9 }}>0</text>
      <text x={cx + r + 2} y={cy + 14} textAnchor="middle" fill="#8A8A7A" style={{ fontFamily: '"DM Mono", monospace', fontSize: 9 }}>100</text>
    </svg>
  );
}
