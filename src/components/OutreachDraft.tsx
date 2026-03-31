import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Executive } from '@/data/executives';
import type { HCLParameterProfile } from '@/data/hcl-parameters';
import { buildDraft } from '@/utils/buildDraft';

const SERVICE_LINES = [
  'AI & Analytics',
  'Cloud Transformation',
  'CX & Digital',
  'Managed Services',
  'Security & Compliance',
  'Infrastructure',
];

function highlightTerms(text: string, terms: string[]): string {
  let result = text;
  for (const term of terms) {
    if (!term || term.startsWith('[')) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(escaped, 'gi'),
      '<mark style="background:var(--accent-light);color:var(--accent);border-radius:0;padding:0 3px">$&</mark>'
    );
  }
  return result;
}

interface Props {
  exec: Executive;
  profile?: HCLParameterProfile;
  selectedLine: string;
  onLineChange: (line: string) => void;
}

export default function OutreachDraft({ exec, profile, selectedLine, onLineChange }: Props) {
  const [copied, setCopied] = useState(false);

  const draft = useMemo(() => buildDraft(exec, selectedLine), [exec, selectedLine]);

  const challenge =
    exec.challenges.length > 0 && !exec.challenges[0].startsWith('[')
      ? exec.challenges[0]
      : '';

  const highlightKeys = [challenge, selected].filter(Boolean);

  const handleCopy = () => {
    const plain = `Subject: ${draft.subject}\n\n${draft.body.join('\n\n')}`;
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Service line selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SERVICE_LINES.map((line) => (
          <button
            key={line}
            onClick={() => setSelected(line)}
            className={`px-4 py-1.5 rounded-full text-[13px] transition-colors duration-150 ${
              selected === line
                ? 'bg-[var(--accent)] text-[var(--accent-light)]'
                : 'border border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            {line}
          </button>
        ))}
      </div>

      {/* Memo card */}
      <div className="bg-white border border-[var(--border)] rounded-sm px-10 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] relative">
        {/* Subject */}
        <p className="font-mono text-[11px] uppercase text-[var(--neutral)] mb-1">Subject Line</p>
        <p className="text-sm font-medium mb-6">{draft.subject}</p>

        <div className="h-px bg-[var(--border)] mb-6" />

        {/* Body */}
        <div className="space-y-5">
          {draft.body.map((paragraph, i) => (
            <p
              key={`${selected}-${i}`}
              className="text-[15px] leading-[1.7]"
              dangerouslySetInnerHTML={{
                __html: highlightTerms(paragraph, highlightKeys),
              }}
            />
          ))}
        </div>

        {/* Copy button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleCopy}
            className="font-mono text-[11px] flex items-center gap-1.5 text-[var(--accent)] hover:underline"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Draft
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
