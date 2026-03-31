// /src/data/executives.ts

// MOCK DATA — Replace with API calls from /services/api.ts for production
// Schema mirrors the CXOWorld profile structure + HCL scoring layer

export interface Executive {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedIn: string;
  photo?: string; // URL — populated from LinkedIn or CXOWorld DB
  email?: string;
  
  // CXOWorld Core Profile
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
  
  // Biographical
  bio: string;
  careerJourney: { role: string; company: string; from: string; to: string }[];
  education: { degree: string; institution: string; years: string }[];
  awards: string[];
  netWorth?: string;
  dob?: string;
  nationality?: string;
  
  // Company
  annualRevenue?: string;
  teamSize?: string;
  
  // Social
  socialPosts: {
    platform: 'linkedin' | 'instagram' | 'twitter';
    text: string;
    date: string;
    engagement?: string;
  }[];
  
  // LinkedIn-sourced enrichment
  aboutBio?: string;           // Full LinkedIn About section text
  skills?: string[];           // Top 10 endorsed skills
  recommendations?: {
    text: string;
    from: string;              // "Name, Title at Company"
    relationship?: string;     // e.g. "worked with directly"
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

  // HCL Intelligence Layer (computed from HCL parameters)
  hclScore: number; // 0–100
  hclClassification: 'Pro' | 'Neutral' | 'Anti';
  hclClassificationReason: string[];
  lastUpdated: string;
}

export const executives: Executive[] = [
  {
    id: "amit-kapoor",
    name: "Amit Kapoor",
    title: "Senior Executive",
    company: "TBD — populate from LinkedIn scrape",
    location: "India",
    linkedIn: "https://www.linkedin.com/in/amit-kapoor-a07348/",
    areasOfFocus: ["Digital Transformation", "AI Strategy", "Leadership"],
    visionQuotes: ["[Populate from LinkedIn posts and public interviews]"],
    strategies: ["[Populate from public statements]"],
    challenges: ["[Populate from role context and public content]"],
    opportunities: ["[Populate post-scrape]"],
    trendsInsights: ["[Populate post-scrape]"],
    competitorsPartners: [],
    productsTechnologies: [],
    targetMarkets: [],
    kpiMetrics: [],
    decisionInsights: [],
    risksThreats: [],
    bio: "[Populate from LinkedIn About section]",
    careerJourney: [],
    education: [],
    awards: [],
    socialPosts: [],
    aboutBio: "[LinkedIn About — awaiting scrape]",
    skills: [],
    recommendations: [],
    articlesWritten: [],
    featuredLinks: [],
    volunteering: [],
    languages: [],
    hclScore: 72,
    hclClassification: "Pro",
    hclClassificationReason: [
      "Active engagement with digital transformation content",
      "Posts on AI and cloud innovation align with HCL offerings",
      "No competitor vendor alignment detected"
    ],
    lastUpdated: "2026-03-30"
  },
  {
    id: "christopher-kemmerer",
    name: "Christopher Kemmerer",
    title: "Senior Executive",
    company: "TBD — populate from LinkedIn scrape",
    location: "United States",
    linkedIn: "https://www.linkedin.com/in/christopherkemmerer/",
    areasOfFocus: ["Technology Strategy", "Operations", "Innovation"],
    visionQuotes: ["[Populate from public content]"],
    strategies: [],
    challenges: [],
    opportunities: [],
    trendsInsights: [],
    competitorsPartners: [],
    productsTechnologies: [],
    targetMarkets: [],
    kpiMetrics: [],
    decisionInsights: [],
    risksThreats: [],
    bio: "[Populate from LinkedIn]",
    careerJourney: [],
    education: [],
    awards: [],
    socialPosts: [],
    aboutBio: "[LinkedIn About — awaiting scrape]",
    skills: [],
    recommendations: [],
    articlesWritten: [],
    featuredLinks: [],
    volunteering: [],
    languages: [],
    hclScore: 58,
    hclClassification: "Neutral",
    hclClassificationReason: [
      "Limited public content — engagement pattern unclear",
      "Some technology focus but no strong vendor signal",
      "Requires deeper scrape to reclassify"
    ],
    lastUpdated: "2026-03-30"
  },
  {
    id: "daniel-lawson",
    name: "Daniel Lawson",
    title: "Senior Executive",
    company: "TBD — populate from LinkedIn scrape",
    location: "United States",
    linkedIn: "https://www.linkedin.com/in/daniel-lawson-6a26611/",
    areasOfFocus: ["Infrastructure", "Managed Services", "Cost Optimization"],
    visionQuotes: ["[Populate from public content]"],
    strategies: [],
    challenges: [],
    opportunities: [],
    trendsInsights: [],
    competitorsPartners: [],
    productsTechnologies: [],
    targetMarkets: [],
    kpiMetrics: [],
    decisionInsights: [],
    risksThreats: [],
    bio: "[Populate from LinkedIn]",
    careerJourney: [],
    education: [],
    awards: [],
    socialPosts: [],
    aboutBio: "[LinkedIn About — awaiting scrape]",
    skills: [],
    recommendations: [],
    articlesWritten: [],
    featuredLinks: [],
    volunteering: [],
    languages: [],
    hclScore: 65,
    hclClassification: "Neutral",
    hclClassificationReason: [
      "Infrastructure background aligns with HCL managed services",
      "Cost optimization focus is a moderate entry signal",
      "No strong competitor engagement detected"
    ],
    lastUpdated: "2026-03-30"
  },
  {
    id: "scott-lawrence",
    name: "Scott Lawrence",
    title: "Senior Executive",
    company: "TBD — populate from LinkedIn scrape",
    location: "United States",
    linkedIn: "https://www.linkedin.com/in/scottmlawrence1/",
    areasOfFocus: ["CX", "Cloud", "Digital Strategy"],
    visionQuotes: ["[Populate from public content]"],
    strategies: [],
    challenges: [],
    opportunities: [],
    trendsInsights: [],
    competitorsPartners: [],
    productsTechnologies: [],
    targetMarkets: [],
    kpiMetrics: [],
    decisionInsights: [],
    risksThreats: [],
    bio: "[Populate from LinkedIn]",
    careerJourney: [],
    education: [],
    awards: [],
    socialPosts: [],
    hclScore: 81,
    hclClassification: "Pro",
    hclClassificationReason: [
      "CX and cloud focus are core HCL service areas",
      "Active engagement with digital transformation topics",
      "No competitor vendor bias detected"
    ],
    lastUpdated: "2026-03-30"
  },
  {
    id: "chris-davison",
    name: "Chris Davison",
    title: "Senior Executive",
    company: "TBD — populate from LinkedIn scrape",
    location: "United Kingdom",
    linkedIn: "https://www.linkedin.com/in/chris-davison-a7a760241/",
    areasOfFocus: ["Security", "Compliance", "Risk Management"],
    visionQuotes: ["[Populate from public content]"],
    strategies: [],
    challenges: [],
    opportunities: [],
    trendsInsights: [],
    competitorsPartners: [],
    productsTechnologies: [],
    targetMarkets: [],
    kpiMetrics: [],
    decisionInsights: [],
    risksThreats: [],
    bio: "[Populate from LinkedIn]",
    careerJourney: [],
    education: [],
    awards: [],
    socialPosts: [],
    hclScore: 44,
    hclClassification: "Neutral",
    hclClassificationReason: [
      "Security focus is adjacent but not primary HCL entry point",
      "Low public digital activity — hard to classify",
      "Compliance-first mindset may indicate risk-averse buyer"
    ],
    lastUpdated: "2026-03-30"
  }
];

export function getExecutiveById(id: string): Executive | undefined {
  return executives.find(e => e.id === id);
}
