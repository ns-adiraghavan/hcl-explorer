import jsPDF from "jspdf";
import type { Executive } from "@/types/executive";
import type { HCLParameterProfile } from "@/types/hcl-parameters";

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
  // accent dot
  doc.setFillColor(...COLORS.accent);
  doc.circle(MARGIN + 1.5, y + 1.5, 0.8, "F");
  // label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.neutral);
  doc.text(title.toUpperCase(), MARGIN + 5, y + 2.5);
  // line
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

export function generateProfilePdf(exec: Executive, profile: HCLParameterProfile | null) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = MARGIN;

  // ─── HEADER ───
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

  // Classification badge
  const classification = exec.hclClassification ?? profile?.overallClassification ?? "Neutral";
  const score = exec.hclScore ?? profile?.dealInterestScore ?? 0;
  y = checkPage(doc, y, 12);
  doc.setFontSize(8);
  const badgeColor = classification === "Pro" ? COLORS.accent : classification === "Anti" ? COLORS.risk : COLORS.neutral;
  doc.setFillColor(...badgeColor);
  const badgeText = `${classification.toUpperCase()}  ·  Score: ${score}`;
  const badgeW = doc.getTextWidth(badgeText) + 8;
  doc.roundedRect(MARGIN, y, badgeW, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text(badgeText, MARGIN + 4, y + 3.8);
  y += 10;

  // Classification reasons
  const reasons = exec.hclClassificationReason ?? profile?.hclClassificationReason ?? [];
  if (reasons.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.neutral);
    for (const r of reasons) {
      y = checkPage(doc, y, 6);
      doc.text(`• ${r}`, MARGIN + 2, y + 2);
      const lines = doc.splitTextToSize(`• ${r}`, CONTENT_W - 4);
      y += lines.length * 3.5 + 1;
    }
    y += 4;
  }

  // divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;

  // ─── HCL PARAMETERS ───
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
      y = checkPage(doc, y, 18);

      // Card background
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(MARGIN, y, CONTENT_W, 14, 1, 1, "F");

      // Signal border left
      const sigColor = param.signalLevel === "STRONG" ? COLORS.accent : param.signalLevel === "WEAK" ? COLORS.risk : COLORS.neutral;
      doc.setFillColor(...sigColor);
      doc.rect(MARGIN, y + 0.5, 0.8, 13, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);
      doc.text(label, MARGIN + 3, y + 4.5);

      // Signal badge
      doc.setFillColor(...sigColor);
      const sigText = param.signalLevel;
      const sigW = doc.getTextWidth(sigText) + 4;
      doc.roundedRect(MARGIN + CONTENT_W - sigW - 2, y + 1.5, sigW, 4, 1, 1, "F");
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(6);
      doc.text(sigText, MARGIN + CONTENT_W - sigW, y + 4);

      // Summary
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.neutral);
      const summaryLines = doc.splitTextToSize(param.summary, CONTENT_W - 8);
      doc.text(summaryLines.slice(0, 2), MARGIN + 3, y + 8.5);

      // Derived signal
      if (param.derivedSignal) {
        doc.setFillColor(...COLORS.accentLight);
        doc.setTextColor(...COLORS.accent);
        doc.setFontSize(6.5);
        const dsW = doc.getTextWidth(param.derivedSignal) + 4;
        doc.roundedRect(MARGIN + 3, y + 11, dsW, 3, 0.5, 0.5, "F");
        doc.text(param.derivedSignal, MARGIN + 5, y + 13);
      }

      y += 16;
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
        doc.text(`${o.area}  (${o.type})`, MARGIN + 2, y + 2);

        // Progress bar
        doc.setFillColor(...COLORS.border);
        doc.roundedRect(MARGIN + 2, y + 4, CONTENT_W - 20, 1.5, 0.5, 0.5, "F");
        doc.setFillColor(...COLORS.accent);
        doc.roundedRect(MARGIN + 2, y + 4, (CONTENT_W - 20) * o.confidenceScore / 100, 1.5, 0.5, 0.5, "F");

        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.neutral);
        doc.text(`${o.confidenceScore}%`, MARGIN + CONTENT_W - 14, y + 5.5);
        y += 9;
      }
    }

    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 6;
  }

  // ─── PROFILE INSIGHTS ───
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

  if (exec.strategies?.length) {
    y = sectionHeader(doc, y, "Strategies");
    y = bulletList(doc, y, exec.strategies);
    y += 2;
  }

  // ─── INSTITUTIONAL DATA ───
  y = sectionHeader(doc, y, "Institutional Data");

  // Metrics
  const metrics: [string, string][] = [];
  if (exec.annualRevenue) metrics.push(["Revenue", exec.annualRevenue]);
  if (exec.teamSize) metrics.push(["Team Size", exec.teamSize]);
  if (exec.netWorth) metrics.push(["Net Worth", exec.netWorth]);

  if (metrics.length) {
    y = checkPage(doc, y, 12);
    let mx = MARGIN;
    for (const [label, value] of metrics) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.ink);
      doc.text(value, mx, y + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text(label.toUpperCase(), mx, y + 8);
      mx += 50;
    }
    y += 14;
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
      doc.text(`${e.degree} — ${e.institution}`, MARGIN + 2, y + 2);
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.neutral);
      doc.text(e.years, MARGIN + 2, y + 5.5);
      y += 8;
    }
    y += 2;
  }

  // ─── SOCIAL PULSE ───
  if (exec.socialPosts?.length) {
    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 6;
    y = sectionHeader(doc, y, "Social Pulse");

    for (const post of exec.socialPosts) {
      y = checkPage(doc, y, 14);
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(MARGIN, y, CONTENT_W, 12, 1, 1, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.neutral);
      doc.text(`${post.platform.toUpperCase()}  ·  ${post.date}`, MARGIN + 3, y + 3.5);

      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.ink);
      const postText = post.text.length > 140 ? `${post.text.slice(0, 140)}…` : post.text;
      const pLines = doc.splitTextToSize(postText, CONTENT_W - 6);
      doc.text(pLines.slice(0, 2), MARGIN + 3, y + 7);

      if (post.engagement) {
        doc.setFontSize(6);
        doc.setTextColor(...COLORS.neutral);
        doc.text(post.engagement, MARGIN + 3, y + 11);
      }
      y += 14;
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
