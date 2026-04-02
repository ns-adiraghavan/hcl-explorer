import jsPDF from "jspdf";
import type { Executive } from "@/types/executive";
import type { HCLParameterProfile } from "@/types/hcl-parameters";
import { getTopParameters } from "@/utils/buildDraft";
import { HCL_COMPETITORS } from "@/utils/competitors";

const COLORS = {
  ink: [13, 13, 11] as [number, number, number],
  accent: [26, 77, 58] as [number, number, number],
  neutral: [138, 138, 122] as [number, number, number],
  risk: [192, 57, 43] as [number, number, number],
  border: [216, 212, 204] as [number, number, number],
  bg: [245, 243, 238] as [number, number, number],
  cardBg: [250, 250, 247] as [number, number, number],
  accentLight: [232, 240, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  amber: [230, 126, 34] as [number, number, number],
  darkYellow: [184, 134, 11] as [number, number, number],
  midGreen: [127, 176, 105] as [number, number, number],
};

const LIKELIHOOD_COLORS: Record<string, [number, number, number]> = {
  Unlikely: [192, 57, 43],
  Low: [230, 126, 34],
  Possible: [184, 134, 11],
  Likely: [127, 176, 105],
  Strong: [26, 77, 58],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

function checkPage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function sectionHeader(doc: jsPDF, y: number, title: string): number {
  y = checkPage(doc, y, 16);
  doc.setFillColor(...COLORS.accent);
  doc.circle(MARGIN + 1.5, y + 1.5, 0.8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.neutral);
  doc.text(title.toUpperCase(), MARGIN + 5, y + 2.5);
  const textW = doc.getTextWidth(title.toUpperCase());
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 5 + textW + 3, y + 2, MARGIN + CONTENT_W, y + 2);
  return y + 8;
}

function bulletList(doc: jsPDF, y: number, items: string[], bulletColor = COLORS.accent): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.ink);
  for (const item of items) {
    y = checkPage(doc, y, 8);
    doc.setFillColor(...bulletColor);
    doc.circle(MARGIN + 1.5, y + 1.2, 0.5, "F");
    const lines = doc.splitTextToSize(item, CONTENT_W - 6);
    doc.text(lines, MARGIN + 5, y + 2);
    y += lines.length * 3.8 + 1.5;
  }
  return y;
}


function drawLikelihoodBar(doc: jsPDF, y: number, likelihood: string): number {
  const zones = ['Unlikely', 'Low', 'Possible', 'Likely', 'Strong'];
  const activeIdx = zones.indexOf(likelihood);
  const segW = (CONTENT_W - 4 * 1) / 5; // 5 segments with 1mm gaps
  const segH = 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.neutral);
  doc.text("DEAL LIKELIHOOD", MARGIN, y + 2);
  y += 5;

  for (let i = 0; i < 5; i++) {
    const x = MARGIN + i * (segW + 1);
    const color = LIKELIHOOD_COLORS[zones[i]];
    if (i === activeIdx) {
      doc.setFillColor(...color);
      doc.rect(x, y, segW, segH, "F");
    } else {
      // Blend color toward white for inactive appearance
      const faded: [number, number, number] = [
        Math.round(color[0] + (255 - color[0]) * 0.82),
        Math.round(color[1] + (255 - color[1]) * 0.82),
        Math.round(color[2] + (255 - color[2]) * 0.82),
      ];
      doc.setFillColor(...faded);
      doc.rect(x, y, segW, segH, "F");
    }
  }

  // Label below active segment
  if (activeIdx >= 0) {
    const labelX = MARGIN + activeIdx * (segW + 1) + segW / 2;
    doc.setFontSize(6.5);
    doc.setTextColor(...LIKELIHOOD_COLORS[likelihood]);
    doc.setFont("helvetica", "bold");
    doc.text(likelihood, labelX, y + segH + 3.5, { align: 'center' });
    doc.setFont("helvetica", "normal");
  }

  return y + segH + 7;
}

export function generateProfilePdf(exec: Executive, profile: HCLParameterProfile | null) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = MARGIN;

  // ─── SECTION 1: IDENTITY HEADER ───
  doc.setFillColor(...COLORS.accent);
  doc.rect(MARGIN, y, 14, 0.5, "F");
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...COLORS.ink);
  doc.text(exec.name, MARGIN, y + 8);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.neutral);
  doc.text(`${exec.title}  ·  ${exec.company}  ·  ${exec.location}`, MARGIN, y + 2);
  y += 6;

  // Areas of focus tags
  if (exec.areasOfFocus?.length) {
    doc.setFontSize(7);
    let tagX = MARGIN;
    for (const a of exec.areasOfFocus) {
      const tw = doc.getTextWidth(a) + 5;
      if (tagX + tw > MARGIN + CONTENT_W) { tagX = MARGIN; y += 5.5; }
      y = checkPage(doc, y, 6);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(tagX, y, tw, 4.5, 1, 1, "S");
      doc.setTextColor(...COLORS.ink);
      doc.text(a, tagX + 2.5, y + 3.2);
      tagX += tw + 2;
    }
    y += 7;
  }

  // Deal likelihood barometer
  const likelihood = profile?.dealLikelihood ?? "Possible";
  y = drawLikelihoodBar(doc, y, likelihood);

  // Classification badge
  const classification = exec.hclClassification ?? profile?.overallClassification ?? "Neutral";
  y = checkPage(doc, y, 12);
  doc.setFontSize(8);
  const badgeColor = classification === "Pro" ? COLORS.accent : classification === "Anti" ? COLORS.risk : COLORS.neutral;
  doc.setFillColor(...badgeColor);
  doc.setFont("helvetica", "bold");
  const badgeText = classification.toUpperCase();
  const badgeW = doc.getTextWidth(badgeText) + 8;
  doc.roundedRect(MARGIN, y, badgeW, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...COLORS.white);
  doc.text(badgeText, MARGIN + 4, y + 3.8);
  y += 9;

  // Classification basis — top 3 parameters
  if (profile) {
    const topParams = getTopParameters(profile, 3);
    if (topParams.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text("CLASSIFICATION BASIS", MARGIN, y + 2);
      y += 5;

      for (const { label, param } of topParams) {
        y = checkPage(doc, y, 10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.ink);
        doc.text(label, MARGIN + 2, y + 2);

        // Signal badge inline
        const sigColor = param.signalLevel === "STRONG" ? COLORS.accent : param.signalLevel === "WEAK" ? COLORS.risk : COLORS.neutral;
        doc.setFillColor(...sigColor);
        const sigText = param.signalLevel;
        const labelW = doc.getTextWidth(label);
        doc.setFontSize(5.5);
        const sigW = doc.getTextWidth(sigText) + 3;
        doc.roundedRect(MARGIN + 2 + labelW + 2, y - 0.5, sigW, 3.5, 0.8, 0.8, "F");
        doc.setTextColor(...COLORS.white);
        doc.text(sigText, MARGIN + 2 + labelW + 3.5, y + 1.8);

        // Derived signal
        if (param.derivedSignal) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.neutral);
          const dsLines = doc.splitTextToSize(param.derivedSignal, CONTENT_W - 10);
          doc.text(dsLines, MARGIN + 4, y + 5.5);
          y += 4 + dsLines.length * 3.2 + 2;
        } else {
          y += 5;
        }
      }
    }
  }

  // Overall assessment (classification reasons)
  const reasons = exec.hclClassificationReason ?? profile?.hclClassificationReason ?? [];
  if (reasons.length) {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.neutral);
    doc.text("OVERALL ASSESSMENT", MARGIN, y + 2);
    y += 5;

    doc.setFontSize(8);
    for (const r of reasons) {
      y = checkPage(doc, y, 6);
      const lines = doc.splitTextToSize(r, CONTENT_W - 8);
      doc.setFillColor(...COLORS.accent);
      doc.circle(MARGIN + 1.5, y + 1.2, 0.4, "F");
      doc.setTextColor(...COLORS.neutral);
      doc.text(lines, MARGIN + 5, y + 2);
      y += lines.length * 3.5 + 1.5;
    }
    y += 2;
  }

  // Pull-quote from recommendations
  if (exec.recommendations?.length) {
    y = checkPage(doc, y, 14);
    doc.setFillColor(...COLORS.accent);
    doc.rect(MARGIN + 1, y, 0.5, 10, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.neutral);
    const qLines = doc.splitTextToSize(`"${exec.recommendations[0].text}"`, CONTENT_W - 8);
    doc.text(qLines.slice(0, 3), MARGIN + 5, y + 3);
    const qH = Math.min(qLines.length, 3) * 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(`— ${exec.recommendations[0].from}`, MARGIN + 5, y + qH + 4.5);
    y += qH + 8;
  }

  // divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;

  // ─── SECTION 2: HCL SIGNALS ───
  if (profile) {
    y = sectionHeader(doc, y, "HCL Signals");
    const parameterLabels: { key: string; label: string }[] = [
      { key: "publicPersona", label: "Public Persona" },
      { key: "psychographicMindset", label: "Psychographic & Mindset" },
      { key: "digitalActivity", label: "Digital Activity" },
      { key: "topicAffinity", label: "Topic Affinity" },
      { key: "painPointIndicators", label: "Pain Point Indicators" },
      { key: "ecosystemVendorExposure", label: "Ecosystem & Vendor Exposure" },
      { key: "eventPresence", label: "Event & Presence" },
      { key: "contentInteraction", label: "Content Interaction" },
    ];

    for (const { key, label } of parameterLabels) {
      const param = (profile as any)[key];
      if (!param) continue;

      // Measure content to determine card height
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const summaryLines = doc.splitTextToSize(param.summary, CONTENT_W - 8);
      const cardH = 6 + Math.min(summaryLines.length, 3) * 3.2 + (param.derivedSignal ? 5 : 0) + 3;

      y = checkPage(doc, y, cardH + 2);

      // Card background
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 1, 1, "F");

      // Signal border left
      const sigColor = param.signalLevel === "STRONG" ? COLORS.accent : param.signalLevel === "WEAK" ? COLORS.risk : COLORS.neutral;
      doc.setFillColor(...sigColor);
      doc.rect(MARGIN, y + 0.5, 0.8, cardH - 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);
      doc.text(label, MARGIN + 3, y + 4.5);

      // Signal badge
      doc.setFillColor(...sigColor);
      const sigText = param.signalLevel;
      doc.setFontSize(6);
      const sigW = doc.getTextWidth(sigText) + 4;
      doc.roundedRect(MARGIN + CONTENT_W - sigW - 2, y + 1.5, sigW, 4, 1, 1, "F");
      doc.setTextColor(...COLORS.white);
      doc.text(sigText, MARGIN + CONTENT_W - sigW, y + 4);

      // Summary
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text(summaryLines.slice(0, 3), MARGIN + 3, y + 8.5);

      // Derived signal
      if (param.derivedSignal) {
        const dsY = y + 8.5 + Math.min(summaryLines.length, 3) * 3.2 + 1;
        doc.setFillColor(...COLORS.accentLight);
        doc.setTextColor(...COLORS.accent);
        doc.setFontSize(6.5);
        const dsText = param.derivedSignal;
        const dsW = Math.min(doc.getTextWidth(dsText) + 4, CONTENT_W - 8);
        doc.roundedRect(MARGIN + 3, dsY - 2, dsW, 3, 0.5, 0.5, "F");
        doc.text(dsText.length > 80 ? dsText.slice(0, 77) + '…' : dsText, MARGIN + 5, dsY);
      }

      y += cardH + 2;
    }

    // Opportunity areas
    if (profile.opportunityAreas?.length) {
      y += 2;
      y = checkPage(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.ink);
      doc.text("Identified Opportunities", MARGIN, y + 2);
      y += 6;

      for (const o of profile.opportunityAreas) {
        y = checkPage(doc, y, 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.ink);
        doc.text(`${o.area}`, MARGIN + 2, y + 2);
        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.neutral);
        doc.text(o.type, MARGIN + CONTENT_W - 14, y + 2);

        // Progress bar
        doc.setFillColor(...COLORS.border);
        doc.roundedRect(MARGIN + 2, y + 4, CONTENT_W - 20, 1.5, 0.5, 0.5, "F");
        doc.setFillColor(...COLORS.accent);
        doc.roundedRect(MARGIN + 2, y + 4, (CONTENT_W - 20) * o.confidenceScore / 100, 1.5, 0.5, 0.5, "F");

        doc.text(`${o.confidenceScore}%`, MARGIN + CONTENT_W - 14, y + 5.5);
        y += 9;
      }
    }

    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 6;
  }

  // ─── SECTION 3: BD INTELLIGENCE ───
  y = sectionHeader(doc, y, "BD Intelligence");

  // Competitive Exposure
  y = checkPage(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.ink);
  doc.text("Competitive Exposure", MARGIN, y + 2);
  y += 5;

  const competitorRoles = exec.careerJourney.filter((c) =>
    HCL_COMPETITORS.some((comp) => c.company.toLowerCase().includes(comp.toLowerCase()))
  );

  const ecosystemMentions: { competitor: string }[] = [];
  (exec.competitorsPartners ?? []).forEach((cp) => {
    const cpLower = cp.toLowerCase();
    HCL_COMPETITORS.forEach((comp) => {
      if (cpLower.includes(comp.toLowerCase()) && !ecosystemMentions.some((e) => e.competitor === comp)) {
        ecosystemMentions.push({ competitor: comp });
      }
    });
  });

  if (competitorRoles.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.neutral);
    doc.text("HIGH CONFIDENCE", MARGIN + 2, y + 2);
    y += 4;
    for (const role of competitorRoles) {
      y = checkPage(doc, y, 6);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);
      doc.text(`${role.company} — ${role.from}–${role.to}`, MARGIN + 4, y + 2);
      y += 4;
    }
  }

  if (ecosystemMentions.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.neutral);
    doc.text("MEDIUM CONFIDENCE", MARGIN + 2, y + 2);
    y += 4;
    for (const em of ecosystemMentions) {
      y = checkPage(doc, y, 6);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);
      doc.text(`${em.competitor} — Ecosystem mention`, MARGIN + 4, y + 2);
      y += 4;
    }
  }

  const competitorSignals = (profile as any)?.competitorSignals as string[] | undefined;
  if (competitorSignals?.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.neutral);
    doc.text("INFERRED", MARGIN + 2, y + 2);
    y += 4;
    doc.setFontSize(7.5);
    for (const sig of competitorSignals) {
      y = checkPage(doc, y, 6);
      doc.setTextColor(...COLORS.neutral);
      doc.setFont("helvetica", "italic");
      const sigLines = doc.splitTextToSize(sig, CONTENT_W - 8);
      doc.text(sigLines, MARGIN + 4, y + 2);
      y += sigLines.length * 3.2 + 2;
    }
  }

  if (competitorRoles.length === 0 && ecosystemMentions.length === 0 && !competitorSignals?.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.neutral);
    doc.text("No competitor exposure detected in public record", MARGIN + 2, y + 2);
    y += 5;
  }

  y += 3;

  // Decision Style
  const decisionInsights = exec.decisionInsights?.filter((d) => !d.startsWith('[')) ?? [];
  if (decisionInsights.length > 0) {
    y = checkPage(doc, y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    doc.text("Decision Style", MARGIN, y + 2);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    for (let i = 0; i < decisionInsights.length; i++) {
      y = checkPage(doc, y, 8);
      doc.setTextColor(...COLORS.accent);
      doc.setFontSize(7);
      doc.text(String(i + 1).padStart(2, '0'), MARGIN + 2, y + 2);
      doc.setTextColor(...COLORS.ink);
      doc.setFontSize(8);
      const dLines = doc.splitTextToSize(decisionInsights[i], CONTENT_W - 12);
      doc.text(dLines, MARGIN + 8, y + 2);
      y += dLines.length * 3.5 + 1.5;
    }
    y += 3;
  }

  // Growth Priorities
  const opps = exec.opportunities?.filter((o) => !o.startsWith('[')) ?? [];
  if (opps.length > 0) {
    y = checkPage(doc, y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    doc.text("Growth Priorities", MARGIN, y + 2);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const o of opps) {
      y = checkPage(doc, y, 7);
      doc.setTextColor(...COLORS.accent);
      doc.text("→", MARGIN + 2, y + 2);
      doc.setTextColor(...COLORS.ink);
      const oLines = doc.splitTextToSize(o, CONTENT_W - 10);
      doc.text(oLines, MARGIN + 7, y + 2);
      y += oLines.length * 3.5 + 1.5;
    }
    y += 3;
  }

  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;

  // ─── SECTION 4: PROFILE INSIGHTS ───
  if (exec.visionQuotes?.length) {
    y = sectionHeader(doc, y, "Vision & Philosophy");
    for (const q of exec.visionQuotes) {
      y = checkPage(doc, y, 12);
      doc.setFillColor(...COLORS.accent);
      doc.rect(MARGIN + 1, y, 0.5, 8, "F");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.ink);
      const qLines = doc.splitTextToSize(`"${q}"`, CONTENT_W - 8);
      doc.text(qLines, MARGIN + 5, y + 3);
      y += qLines.length * 3.5 + 4;
    }
    y += 2;
  }

  if (exec.challenges?.length) {
    y = sectionHeader(doc, y, "Challenges");
    y = bulletList(doc, y, exec.challenges, COLORS.risk);
    y += 2;
  }

  // About Bio
  if (exec.aboutBio && !exec.aboutBio.startsWith('[')) {
    y = checkPage(doc, y, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.neutral);
    doc.text("IN THEIR OWN WORDS", MARGIN, y + 2);
    y += 5;

    doc.setFillColor(...COLORS.cardBg);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    const bioLines = doc.splitTextToSize(exec.aboutBio, CONTENT_W - 8);
    const bioH = bioLines.length * 3.5 + 4;
    y = checkPage(doc, y, bioH + 2);
    doc.roundedRect(MARGIN, y, CONTENT_W, bioH, 1, 1, "F");
    doc.text(bioLines, MARGIN + 4, y + 4);
    y += bioH + 4;
  }

  if (exec.strategies?.length) {
    y = sectionHeader(doc, y, "Strategies");
    y = bulletList(doc, y, exec.strategies);
    y += 2;
  }

  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;

  // ─── SECTION 5: INSTITUTIONAL DATA ───
  y = sectionHeader(doc, y, "Institutional Data");

  // Metrics row — separate blocks
  const metrics: [string, string][] = [];
  if (exec.annualRevenue) metrics.push(["Revenue", exec.annualRevenue]);
  if (exec.teamSize) metrics.push(["Team Size", exec.teamSize]);
  if (exec.netWorth) metrics.push(["Net Worth", exec.netWorth]);

  if (metrics.length) {
    y = checkPage(doc, y, 14);
    const colW = CONTENT_W / metrics.length;
    for (let i = 0; i < metrics.length; i++) {
      const [label, value] = metrics[i];
      const mx = MARGIN + i * colW;

      // Truncate value to fit column
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.ink);
      const truncValue = doc.splitTextToSize(value, colW - 4);
      doc.text(truncValue[0], mx, y + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text(label.toUpperCase(), mx, y + 8);
    }
    y += 14;
  }

  // Skills
  if (exec.skills?.length) {
    y = checkPage(doc, y, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.neutral);
    doc.text("KNOWN EXPERTISE", MARGIN, y + 2);
    y += 4;

    doc.setFontSize(7);
    let tagX = MARGIN;
    for (const s of exec.skills.slice(0, 8)) {
      const tw = doc.getTextWidth(s) + 4;
      if (tagX + tw > MARGIN + CONTENT_W) { tagX = MARGIN; y += 5; }
      y = checkPage(doc, y, 5);
      doc.setFillColor(...COLORS.accentLight);
      doc.roundedRect(tagX, y, tw, 3.5, 0.5, 0.5, "F");
      doc.setTextColor(...COLORS.accent);
      doc.text(s, tagX + 2, y + 2.5);
      tagX += tw + 1.5;
    }
    y += 6;
  }

  // Career timeline
  if (exec.careerJourney?.length) {
    y = checkPage(doc, y, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    doc.text("Career Journey", MARGIN, y + 2);
    y += 6;

    for (const c of exec.careerJourney) {
      y = checkPage(doc, y, 8);
      doc.setFillColor(...COLORS.accent);
      doc.circle(MARGIN + 1.5, y + 1.5, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);
      doc.text(c.role, MARGIN + 5, y + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text(`${c.company}  ·  ${c.from}–${c.to}`, MARGIN + 5, y + 5.5);
      y += 9;
    }
    y += 2;
  }

  // Education
  if (exec.education?.length) {
    y = checkPage(doc, y, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    doc.text("Education", MARGIN, y + 2);
    y += 6;

    for (const e of exec.education) {
      y = checkPage(doc, y, 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);
      const eduLines = doc.splitTextToSize(`${e.degree} — ${e.institution}`, CONTENT_W - 4);
      doc.text(eduLines, MARGIN + 2, y + 2);
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.neutral);
      doc.text(e.years, MARGIN + 2, y + 2 + eduLines.length * 3.5);
      y += eduLines.length * 3.5 + 5;
    }
    y += 2;
  }

  // ─── SECTION 6: SOCIAL PULSE ───
  if (exec.socialPosts?.length) {
    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 6;
    y = sectionHeader(doc, y, "Social Pulse");

    for (const post of exec.socialPosts) {
      // Measure content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const postLines = doc.splitTextToSize(post.text, CONTENT_W - 6);
      const displayLines = postLines.slice(0, 3);
      const cardH = 6 + displayLines.length * 3.2 + (post.engagement ? 4 : 0) + 2;

      y = checkPage(doc, y, cardH + 2);
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 1, 1, "F");

      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text(`${post.platform.toUpperCase()}  ·  ${post.date}`, MARGIN + 3, y + 3.5);

      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.ink);
      doc.text(displayLines, MARGIN + 3, y + 7);

      if (post.engagement) {
        doc.setFontSize(6);
        doc.setTextColor(...COLORS.neutral);
        doc.text(post.engagement, MARGIN + 3, y + 7 + displayLines.length * 3.2 + 1.5);
      }
      y += cardH + 2;
    }
  }

  // ─── FOOTER ───
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.neutral);
    doc.text(`CXOWorld × HCL  ·  ${exec.name}  ·  Page ${i} of ${pageCount}`, MARGIN, PAGE_H - 8);
    doc.text(`Last updated: ${exec.lastUpdated ?? "—"}`, MARGIN + CONTENT_W - 30, PAGE_H - 8);
  }

  doc.save(`${exec.id}-profile.pdf`);
}
