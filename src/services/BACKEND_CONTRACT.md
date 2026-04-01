# Backend Contract

## CXOWorld × HCL — JSON Data Specification

This file tells the scraping team exactly what to produce.

One JSON file per executive, two files total per person.

Drop the files in the right folder and the frontend works.

No server. No API. No environment variables.

---

## File structure

```
/public/data/
  index.json                          ← master list of all executives
  executives/
    amit-kapoor.json                  ← full profile per executive
    christopher-kemmerer.json
    daniel-lawson.json
    scott-lawrence.json
    chris-davison.json
  hcl/
    amit-kapoor.json                  ← HCL scoring per executive
    christopher-kemmerer.json
    daniel-lawson.json
    scott-lawrence.json
    chris-davison.json
```

---

## index.json

Must be updated whenever a new executive is added.

```json
{
  "executives": [
    { "id": "amit-kapoor", "name": "Amit Kapoor" },
    { "id": "christopher-kemmerer", "name": "Christopher Kemmerer" },
    { "id": "daniel-lawson", "name": "Daniel Lawson" },
    { "id": "scott-lawrence", "name": "Scott Lawrence" },
    { "id": "chris-davison", "name": "Chris Davison" }
  ]
}
```

ID rules:

- Lowercase, hyphen-separated
- First name + last name only — drop alphanumeric suffixes
  e.g. LinkedIn URL "amit-kapoor-a07348" → id "amit-kapoor"
- Must match filename exactly: "amit-kapoor" → amit-kapoor.json
- Must match across both /executives/ and /hcl/ folders

---

## executives/[id].json — full schema

Fields marked \* are required.

All others render conditionally — include if available,
omit entirely if not (do not include empty strings or null).

```json
{
  "id": "*string",
  "name": "*string",
  "title": "*string",
  "company": "*string",
  "location": "*string",
  "linkedIn": "*string",
  "lastUpdated": "*string",        // ISO 8601 e.g. "2026-04-01"

  "photo": "string",               // Direct image URL
  "email": "string",

  // LinkedIn About section
  "aboutBio": "string",

  // LinkedIn skills (max 10)
  "skills": ["string"],

  // LinkedIn recommendations received
  "recommendations": [
    {
      "text": "*string",
      "from": "*string",           // "Name, Title at Company"
      "relationship": "string"     // e.g. "worked directly"
    }
  ],

  // LinkedIn articles / long-form posts
  "articlesWritten": [
    {
      "title": "*string",
      "date": "*string",           // ISO 8601
      "url": "string",
      "excerpt": "string"          // First 200 chars
    }
  ],

  // LinkedIn featured section
  "featuredLinks": [
    {
      "label": "*string",
      "url": "*string"
    }
  ],

  // LinkedIn posts and social activity
  "socialPosts": [
    {
      "platform": "*linkedin | instagram | twitter",
      "text": "*string",
      "date": "*string",           // ISO 8601
      "engagement": "string"       // e.g. "1,363 likes" — visible text only
    }
  ],

  "languages": ["string"],
  "volunteering": ["string"],

  // Research-derived profile intelligence
  // Populated by Netscribes team, not scraped directly
  "areasOfFocus": ["*string"],     // 5 items
  "visionQuotes": ["*string"],     // 3–5 items
  "strategies": ["*string"],       // 5 items
  "challenges": ["*string"],       // 5 items
  "opportunities": ["*string"],    // 5 items
  "trendsInsights": ["*string"],   // 5 items
  "competitorsPartners": ["string"],
  "productsTechnologies": ["string"],
  "targetMarkets": ["string"],
  "kpiMetrics": ["*string"],       // 5 items
  "decisionInsights": ["*string"], // 5 items
  "risksThreats": ["*string"],     // 5 items
  "quotes": ["string"],            // Verbatim attributed quotes

  // Biographical
  "bio": "string",
  "dob": "string",                 // ISO 8601 or year only
  "nationality": "string",
  "netWorth": "string",            // e.g. "$530 Million"

  // Career — IMPORTANT: company names must match
  // /src/utils/competitors.ts spelling exactly for
  // competitor detection to work
  "careerJourney": [
    {
      "role": "*string",
      "company": "*string",
      "from": "*string",           // e.g. "Feb 2014"
      "to": "*string"              // e.g. "Present"
    }
  ],

  "education": [
    {
      "degree": "*string",
      "institution": "*string",
      "years": "*string"           // e.g. "1985–1989"
    }
  ],

  "awards": ["string"],

  // Company
  "annualRevenue": "string",       // e.g. "$681 billion"
  "teamSize": "string",            // e.g. "2,100,000"

  // Video and event appearances
  "videoGallery": [
    {
      "title": "*string",
      "source": "*string",
      "date": "*string",           // ISO 8601
      "url": "string",
      "thumbnailUrl": "string",
      "tier": "*direct | conference | inferred"
      // direct     = confirmed on-camera appearance (YouTube etc.)
      // conference = listed as speaker/attendee, no video confirmed
      // inferred   = no record found — omit entry entirely,
      //              frontend shows monitoring note automatically
    }
  ]
}
```

---

## hcl/[id].json — HCL scoring schema

This file is produced by the Netscribes research team
based on the scrape output. Not auto-generated.

```json
{
  "executiveId": "*string",        // Must match executives/[id].json id

  // 8 parameter scores
  // Each follows identical structure:
  "publicPersona": {
    "signalLevel": "*STRONG | MODERATE | WEAK",
    "summary": "*string",          // 2 sentences max
    "derivedSignal": "string"      // e.g. "Innovation focus → Pro"
  },
  "psychographicMindset": { "..." : "same structure" },
  "digitalActivity": { "..." : "same structure" },
  "topicAffinity": { "..." : "same structure" },
  "painPointIndicators": { "..." : "same structure" },
  "ecosystemVendorExposure": { "..." : "same structure" },
  "eventPresence": { "..." : "same structure" },
  "contentInteraction": { "..." : "same structure" },

  // Output
  "opportunityAreas": [
    {
      "area": "*string",
      "type": "*Strategic | Tactical | Emerging",
      "confidenceScore": "*number"  // 0–100
    }
  ],

  "overallClassification": "*Pro | Neutral | Anti",
  "dealInterestScore": "*number",   // 0–100
  "hclClassificationReason": ["*string"]  // 3 bullet reasons
}
```

---

## Data sourcing guide

**SCRAPED FROM LINKEDIN:**

name, title, company, location, linkedIn, photo,
aboutBio, skills, recommendations, articlesWritten,
featuredLinks, socialPosts, languages, volunteering,
careerJourney, education, awards,
videoGallery tier="conference" (from event mentions in posts)

**SCRAPED FROM PUBLIC WEB:**

email (company website / press releases)
annualRevenue, teamSize (Crunchbase / filings)
netWorth (Forbes / Bloomberg where public)
videoGallery tier="direct" (YouTube search by name)
kpiMetrics (earnings calls / annual reports)
competitorsPartners (company website / press)
quotes (earnings calls / interviews / speeches)

**RESEARCH-DERIVED — Netscribes team fills these manually
based on scrape output, not auto-generated:**

areasOfFocus, visionQuotes, strategies, challenges,
opportunities, trendsInsights, productsTechnologies,
targetMarkets, decisionInsights, risksThreats,
entire hcl/[id].json file

**NOT AVAILABLE — do not attempt:**

- LinkedIn likes per post
- LinkedIn connection count
- LinkedIn follows / following
- Connection-gated profile content

---

## Competitor name matching

`careerJourney[].company` is scanned against this list.
Normalize LinkedIn company names to match exactly:

```
Accenture, TCS, Tata Consultancy, Wipro, Infosys,
Cognizant, Capgemini, IBM, Deloitte, EY, PWC,
KPMG, DXC, Unisys, NTT Data, LTIMindtree
```

Example: "Tata Consultancy Services" → normalize to "TCS"

---

## To add a new executive

1. Add entry to `index.json`
2. Drop `executives/[new-id].json`
3. Drop `hcl/[new-id].json`
4. Refresh browser — appears automatically

No code changes needed.
