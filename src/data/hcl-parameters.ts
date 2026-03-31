// /src/data/hcl-parameters.ts

// HCL 8-parameter scoring schema
// Each executive gets a ParameterProfile — populated by research team post-scrape
// Signal levels: "STRONG" | "MODERATE" | "WEAK"
// Classification: "Pro" | "Neutral" | "Anti"

export interface ParameterScore {
  signalLevel: 'STRONG' | 'MODERATE' | 'WEAK';
  summary: string;
  derivedSignal: string;
}

export interface OpportunityArea {
  area: string; // e.g. "AI / Cloud"
  type: 'Strategic' | 'Tactical' | 'Emerging';
  confidenceScore: number; // 0–100
}

export interface HCLParameterProfile {
  executiveId: string;
  
  // 8 Parameters from HCL research framework
  publicPersona: ParameterScore;
  psychographicMindset: ParameterScore;
  digitalActivity: ParameterScore;
  topicAffinity: ParameterScore;
  painPointIndicators: ParameterScore;
  ecosystemVendorExposure: ParameterScore;
  eventPresence: ParameterScore;
  contentInteraction: ParameterScore;
  
  // Output
  opportunityAreas: OpportunityArea[];
  overallClassification: 'Pro' | 'Neutral' | 'Anti';
  dealInterestScore: number; // 0–100, used in gauge
}

export const hclParameterProfiles: HCLParameterProfile[] = [
  {
    executiveId: "amit-kapoor",
    publicPersona: {
      signalLevel: 'STRONG',
      summary: 'Senior role at a tech-forward organization. Career history shows consistent digital and AI exposure.',
      derivedSignal: 'Digital background → AI / CX opportunity'
    },
    psychographicMindset: {
      signalLevel: 'STRONG',
      summary: 'Public posts reflect innovation-first language. References transformation and people-plus-tech framing.',
      derivedSignal: 'Innovation mindset → Pro / Convertible'
    },
    digitalActivity: {
      signalLevel: 'MODERATE',
      summary: 'Regular LinkedIn activity. Mix of original posts and engagement with sector content.',
      derivedSignal: 'Active thought leader → High influence'
    },
    topicAffinity: {
      signalLevel: 'STRONG',
      summary: 'Posts on AI, digital transformation, and cloud closely align with HCL service areas.',
      derivedSignal: 'Direct topic match → Immediate opportunity'
    },
    painPointIndicators: {
      signalLevel: 'MODERATE',
      summary: 'Engages with content about legacy modernization and scalability challenges.',
      derivedSignal: 'Legacy issues → Modernization opportunity'
    },
    ecosystemVendorExposure: {
      signalLevel: 'MODERATE',
      summary: 'Multi-vendor engagement detected. No strong competitor lock-in.',
      derivedSignal: 'Multi-vendor → Entry opportunity'
    },
    eventPresence: {
      signalLevel: 'MODERATE',
      summary: 'Participates in industry forums. Some conference attendance visible.',
      derivedSignal: 'Attendee → Nurture opportunity'
    },
    contentInteraction: {
      signalLevel: 'STRONG',
      summary: 'Active engagement with AI and digital transformation content. Commenting, not just liking.',
      derivedSignal: 'Deep engagement → High-value signal'
    },
    opportunityAreas: [
      { area: 'AI / Cloud', type: 'Strategic', confidenceScore: 78 },
      { area: 'CX Transformation', type: 'Tactical', confidenceScore: 65 },
      { area: 'Digital Modernization', type: 'Emerging', confidenceScore: 55 }
    ],
    overallClassification: 'Pro',
    dealInterestScore: 72
  },
  {
    executiveId: "christopher-kemmerer",
    publicPersona: {
      signalLevel: 'MODERATE',
      summary: 'Technology leadership background. Role suggests infrastructure and operations responsibility.',
      derivedSignal: 'Infra role → Cost / Managed services opportunity'
    },
    psychographicMindset: {
      signalLevel: 'WEAK',
      summary: 'Limited public content. Tone appears measured and analytical — not overtly innovation-focused.',
      derivedSignal: 'Conservative tone → Slower conversion'
    },
    digitalActivity: {
      signalLevel: 'WEAK',
      summary: 'Low public LinkedIn activity. Primarily passive consumer of content.',
      derivedSignal: 'Passive consumer → Neutral'
    },
    topicAffinity: {
      signalLevel: 'MODERATE',
      summary: 'Some engagement with technology and operations topics. Partial HCL overlap.',
      derivedSignal: 'Adjacent topics → Neutral'
    },
    painPointIndicators: {
      signalLevel: 'MODERATE',
      summary: 'Role context implies scalability and cost management as live concerns.',
      derivedSignal: 'Cost concerns → Managed services'
    },
    ecosystemVendorExposure: {
      signalLevel: 'WEAK',
      summary: 'No strong vendor signals visible publicly.',
      derivedSignal: 'No engagement → Greenfield opportunity'
    },
    eventPresence: {
      signalLevel: 'WEAK',
      summary: 'No conference participation visible in public record.',
      derivedSignal: 'No presence → Low engagement'
    },
    contentInteraction: {
      signalLevel: 'WEAK',
      summary: 'Generic engagement only. No HCL-adjacent content interaction.',
      derivedSignal: 'Generic engagement → Neutral signal'
    },
    opportunityAreas: [
      { area: 'Managed Services', type: 'Tactical', confidenceScore: 48 },
      { area: 'Infrastructure Modernization', type: 'Emerging', confidenceScore: 42 }
    ],
    overallClassification: 'Neutral',
    dealInterestScore: 58
  },
  {
    executiveId: "daniel-lawson",
    publicPersona: {
      signalLevel: 'MODERATE',
      summary: 'Operations and infrastructure background. Career signals cost optimization and efficiency focus.',
      derivedSignal: 'Infra → Cost / Managed services opportunity'
    },
    psychographicMindset: {
      signalLevel: 'MODERATE',
      summary: 'Efficiency and results-oriented language. Pragmatic rather than visionary in public tone.',
      derivedSignal: 'Efficiency mindset → Cost optimization opportunity'
    },
    digitalActivity: {
      signalLevel: 'MODERATE',
      summary: 'Moderate LinkedIn presence. Regular but not high-frequency posting.',
      derivedSignal: 'Moderate activity → Nurture candidate'
    },
    topicAffinity: {
      signalLevel: 'MODERATE',
      summary: 'Infrastructure and cloud content engagement. Some overlap with HCL managed services.',
      derivedSignal: 'Adjacent topics → Moderate opportunity'
    },
    painPointIndicators: {
      signalLevel: 'STRONG',
      summary: 'Explicit engagement with content about legacy systems and managed cost reduction.',
      derivedSignal: 'Legacy issues → Modernization / managed services'
    },
    ecosystemVendorExposure: {
      signalLevel: 'MODERATE',
      summary: 'Multi-vendor environment implied. No strong single-vendor lock-in.',
      derivedSignal: 'Multi-vendor → Entry opportunity'
    },
    eventPresence: {
      signalLevel: 'WEAK',
      summary: 'Limited public conference participation visible.',
      derivedSignal: 'Low presence → Indirect engagement preferred'
    },
    contentInteraction: {
      signalLevel: 'MODERATE',
      summary: 'Engages with operational efficiency and technology content.',
      derivedSignal: 'Moderate engagement → Neutral / Convertible'
    },
    opportunityAreas: [
      { area: 'Managed Services', type: 'Strategic', confidenceScore: 62 },
      { area: 'Infrastructure / Cloud', type: 'Tactical', confidenceScore: 58 },
      { area: 'Cost Optimization', type: 'Strategic', confidenceScore: 70 }
    ],
    overallClassification: 'Neutral',
    dealInterestScore: 65
  },
  {
    executiveId: "scott-lawrence",
    publicPersona: {
      signalLevel: 'STRONG',
      summary: 'Digital and CX leadership background. Role directly maps to HCL CX and cloud service lines.',
      derivedSignal: 'Digital → AI / CX / Cloud opportunity'
    },
    psychographicMindset: {
      signalLevel: 'STRONG',
      summary: 'Innovation-first language. Actively advocates for technology-led transformation.',
      derivedSignal: 'Innovation focus → Pro / Convertible'
    },
    digitalActivity: {
      signalLevel: 'STRONG',
      summary: 'High LinkedIn activity. Original posts on CX, AI, and digital strategy.',
      derivedSignal: 'Active thought leader → High-value target'
    },
    topicAffinity: {
      signalLevel: 'STRONG',
      summary: 'Posts and engages heavily with CX, cloud, and AI topics — all core HCL service areas.',
      derivedSignal: 'Direct match → Immediate opportunity'
    },
    painPointIndicators: {
      signalLevel: 'MODERATE',
      summary: 'Engages with scalability and CX efficiency challenges.',
      derivedSignal: 'Scalability → Cloud / AI transformation'
    },
    ecosystemVendorExposure: {
      signalLevel: 'MODERATE',
      summary: 'Multi-vendor engagement. No strong competitor lock-in identified.',
      derivedSignal: 'Multi-vendor → Entry opportunity'
    },
    eventPresence: {
      signalLevel: 'STRONG',
      summary: 'Speaker or participant at CX and technology conferences.',
      derivedSignal: 'Speaker → High-value, Pro/Convertible'
    },
    contentInteraction: {
      signalLevel: 'STRONG',
      summary: 'Deep engagement with HCL-adjacent content. Comments on AI and CX transformation posts.',
      derivedSignal: 'Deep HCL-adjacent engagement → Strong Pro signal'
    },
    opportunityAreas: [
      { area: 'CX / AI', type: 'Strategic', confidenceScore: 85 },
      { area: 'Cloud Transformation', type: 'Strategic', confidenceScore: 78 },
      { area: 'Digital Strategy', type: 'Tactical', confidenceScore: 72 }
    ],
    overallClassification: 'Pro',
    dealInterestScore: 81
  },
  {
    executiveId: "chris-davison",
    publicPersona: {
      signalLevel: 'MODERATE',
      summary: 'Security and compliance background. Role maps to HCL security / risk service lines.',
      derivedSignal: 'Risk role → Security / Compliance opportunity'
    },
    psychographicMindset: {
      signalLevel: 'WEAK',
      summary: 'Limited public content. Risk-averse framing where visible.',
      derivedSignal: 'Risk-averse tone → Slower conversion / Neutral'
    },
    digitalActivity: {
      signalLevel: 'WEAK',
      summary: 'Low LinkedIn activity. Primarily passive.',
      derivedSignal: 'Passive consumer → Neutral'
    },
    topicAffinity: {
      signalLevel: 'MODERATE',
      summary: 'Security and compliance topics — adjacent to HCL but not primary growth area.',
      derivedSignal: 'Adjacent topics → Moderate opportunity'
    },
    painPointIndicators: {
      signalLevel: 'MODERATE',
      summary: 'Compliance and regulatory complexity implied by role context.',
      derivedSignal: 'Compliance concerns → Security / managed risk opportunity'
    },
    ecosystemVendorExposure: {
      signalLevel: 'WEAK',
      summary: 'No strong vendor engagement visible.',
      derivedSignal: 'No engagement → Greenfield'
    },
    eventPresence: {
      signalLevel: 'WEAK',
      summary: 'No conference participation visible publicly.',
      derivedSignal: 'No presence → Low engagement'
    },
    contentInteraction: {
      signalLevel: 'WEAK',
      summary: 'Minimal content interaction visible.',
      derivedSignal: 'Weak signal → Deprioritize or nurture slowly'
    },
    opportunityAreas: [
      { area: 'Security / Compliance', type: 'Tactical', confidenceScore: 52 },
      { area: 'Managed Risk Services', type: 'Emerging', confidenceScore: 38 }
    ],
    overallClassification: 'Neutral',
    dealInterestScore: 44
  }
];

export function getParameterProfileById(executiveId: string): HCLParameterProfile | undefined {
  return hclParameterProfiles.find(p => p.executiveId === executiveId);
}
