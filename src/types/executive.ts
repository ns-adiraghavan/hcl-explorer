export interface Executive {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedIn: string;
  photo?: string;
  email?: string;

  areasOfFocus: string[];
  visionQuotes: string[];
  strategies: string[];
  challenges: string[];
  opportunities: string[];
  trendsInsights: string[];
  competitorsPartners: string[];
  productsTechnologies: string[];
  targetMarkets: string[];
  kpiMetrics: string[];
  decisionInsights: string[];
  risksThreats: string[];

  bio: string;
  careerJourney: { role: string; company: string; from: string; to: string }[];
  education: { degree: string; institution: string; years: string }[];
  awards: string[];
  netWorth?: string;
  dob?: string;
  nationality?: string;

  annualRevenue?: string;
  teamSize?: string;

  socialPosts: {
    platform: 'linkedin' | 'instagram' | 'twitter';
    text: string;
    date: string;
    engagement?: string;
  }[];

  aboutBio?: string;
  skills?: string[];
  recommendations?: {
    text: string;
    from: string;
    relationship?: string;
  }[];
  articlesWritten?: {
    title: string;
    date: string;
    url?: string;
    excerpt?: string;
  }[];
  featuredLinks?: {
    label: string;
    url: string;
  }[];
  volunteering?: string[];
  languages?: string[];

  hclScore: number;
  hclClassification: 'Pro' | 'Neutral' | 'Anti';
  hclClassificationReason: string[];
  lastUpdated: string;
}
