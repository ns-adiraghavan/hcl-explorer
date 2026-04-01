export interface ParameterScore {
  signalLevel: 'STRONG' | 'MODERATE' | 'WEAK';
  summary: string;
  derivedSignal: string;
}

export interface OpportunityArea {
  area: string;
  type: 'Strategic' | 'Tactical' | 'Emerging';
  confidenceScore: number;
}

export interface HCLParameterProfile {
  executiveId: string;

  publicPersona: ParameterScore;
  psychographicMindset: ParameterScore;
  digitalActivity: ParameterScore;
  topicAffinity: ParameterScore;
  painPointIndicators: ParameterScore;
  ecosystemVendorExposure: ParameterScore;
  eventPresence: ParameterScore;
  contentInteraction: ParameterScore;

  opportunityAreas: OpportunityArea[];
  overallClassification: 'Pro' | 'Neutral' | 'Anti';
  dealInterestScore: number;
  hclClassificationReason: string[];
}
