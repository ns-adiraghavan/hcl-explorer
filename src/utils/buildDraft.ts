import type { Executive } from '@/types/executive';
import type { HCLParameterProfile } from '@/types/hcl-parameters';

export function getServiceLineScore(profile: HCLParameterProfile, serviceLine: string): number {
  const slLower = serviceLine.toLowerCase();
  const slFirst = slLower.split(' ')[0];

  for (const opp of profile.opportunityAreas) {
    const areaLower = opp.area.toLowerCase();
    // Direct match
    if (areaLower.includes(slFirst) || slLower.includes(areaLower.split(' ')[0])) {
      // Check if it's a tight match or adjacent
      const words = areaLower.split(/[\s\/&]+/).filter(Boolean);
      const slWords = slLower.split(/[\s\/&]+/).filter(Boolean);
      const directMatch = slWords.some((w) => words.includes(w)) && words.some((w) => slWords.includes(w));
      if (directMatch) return opp.confidenceScore;
      return Math.round(opp.confidenceScore * 0.85);
    }
  }

  return 50;
}

export function buildDraft(
  exec: Executive,
  serviceLine: string
): { subject: string; body: string[] } {
  const challenge =
    exec.challenges.length > 0 && !exec.challenges[0].startsWith('[')
      ? exec.challenges[0]
      : 'navigating the complexity of digital transformation';

  const subject = `${serviceLine} — A Perspective for ${exec.company}`;

  const p1 = `${exec.name}, I came across your work at ${exec.company} and was struck by the challenge of ${challenge}. It's a theme we're hearing from leaders across the industry, and one where a focused conversation can unlock real clarity.`;

  // Try to match service line to an opportunity area
  const matchedOpp = exec.areasOfFocus.find((a) =>
    serviceLine.toLowerCase().includes(a.toLowerCase()) ||
    a.toLowerCase().includes(serviceLine.split(' ')[0].toLowerCase())
  );

  const p2 = matchedOpp
    ? `Given your focus on ${matchedOpp}, our ${serviceLine} practice has been helping organizations turn that ambition into measurable outcomes — from accelerated timelines to reduced operational drag. I'd welcome the chance to share a few patterns we've seen work.`
    : `Our ${serviceLine} practice has been delivering results for organizations facing exactly this kind of inflection point. Whether it's streamlining operations or unlocking new capability, the playbook is sharper than most expect. I'd welcome the chance to share what we're seeing.`;

  const day = new Date().getDay();
  const meetingDay = day <= 3 ? 'Wednesday' : 'Tuesday';

  const p3 = `Would 20 minutes this ${meetingDay} work?`;

  return { subject, body: [p1, p2, p3] };
}
