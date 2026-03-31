# Backend Contract

## CXOWorld × HCL Frontend ↔ API

This file is the single source of truth for the backend developer
and scraping team. The frontend expects exactly these endpoints,
field names, and types. Do not rename fields — match this contract
precisely to avoid silent failures.

---

## How to go live

1. Set `VITE_USE_MOCK=false` in `.env`
2. Set `VITE_API_BASE_URL=https://your-api.com` in `.env`
3. Done. No component changes needed.

---

## Endpoints

### GET /api/executives

Returns all tracked executives as an array.

Response: `Executive[]`

### GET /api/executives/:id

Returns a single executive by id slug (e.g. "amit-kapoor").

Response: `Executive`

Error if not found: 404

### GET /api/hcl-parameters/:id

Returns the HCL parameter profile for an executive by id slug.

Response: `HCLParameterProfile`

Error if not found: 404

---

## Executive — field contract

All fields marked \* are required. All others are optional but
should be populated where data is available — the frontend
renders them conditionally and degrades gracefully if absent.

```
id*                string    URL-safe slug. e.g. "amit-kapoor"
                             Must be consistent across both endpoints.

name*              string    Full name. e.g. "Amit Kapoor"
title*             string    Current job title
company*           string    Current employer
location*          string    City, Country
linkedIn*          string    Full LinkedIn profile URL

photo              string    Direct image URL for headshot.
                             If absent, UI shows initials avatar.
email              string    Professional email if available.
```

### LinkedIn-scraped fields

```
aboutBio           string    Full LinkedIn About section text.

skills             string[]  Up to 10 endorsed skills.
                             e.g. ["Cloud Strategy", "AI", "CX"]

recommendations    object[]  Each object:
                               text*        string  Full recommendation text
                               from*        string  "Name, Title at Company"
                               relationship string  e.g. "worked directly"

articlesWritten    object[]  Each object:
                               title*   string
                               date*    string  ISO 8601. e.g. "2025-11-04"
                               url      string
                               excerpt  string  First 200 chars of article

featuredLinks      object[]  Each object:
                               label*  string
                               url*    string

socialPosts        object[]  Each object:
                               platform*   "linkedin" | "instagram" | "twitter"
                               text*       string  Full post text
                               date*       string  ISO 8601
                               engagement  string  e.g. "1,363 likes"
                             Note: likes per post not publicly
                             available via scrape — use total
                             engagement string where visible.

languages          string[]  e.g. ["English", "Hindi"]
volunteering       string[]  e.g. ["Board Member, NGO Name"]
```

### Profile intelligence fields

These are research-derived, not scraped directly.
Populated by Netscribes research team post-scrape.

```
areasOfFocus*      string[]  5 tags. Strategic priority themes.
visionQuotes*      string[]  3–5 verbatim or paraphrased belief statements.
strategies*        string[]  5 items. Distilled strategic approaches.
challenges*        string[]  5 items. Current pain points.
opportunities*     string[]  5 items. Executive's own stated growth areas.
trendsInsights*    string[]  5 items. Macro trends relevant to their context.
competitorsPartners string[] 5 items. Named competitors and partners.
productsTechnologies string[] 5 items. Technologies actively deployed.
targetMarkets      string[]  5 items. Customer segments and geographies.
kpiMetrics*        string[]  5 items. Quantified scale/performance metrics.
decisionInsights*  string[]  5 items. Decision-making frameworks inferred.
risksThreats*      string[]  5 items. Organizational vulnerabilities.
```

### Biographical fields

```
bio                string    One-paragraph leadership summary.
dob                string    ISO 8601 date or year only. e.g. "1966-10-17"
nationality        string    e.g. "American"
netWorth           string    e.g. "$530 Million"

careerJourney      object[]  Each object:
                               role*     string
                               company*  string
                               from*     string  e.g. "Feb 2014"
                               to*       string  e.g. "Present"
                             IMPORTANT: company field is scanned
                             against HCL competitor list. Spelling
                             must match entries in
                             /src/utils/competitors.ts exactly.

education          object[]  Each object:
                               degree*      string
                               institution* string
                               years*       string  e.g. "1985–1989"

awards             string[]  Named awards and honors.
```

### Company fields

```
annualRevenue      string    e.g. "$681 billion"
teamSize           string    e.g. "2,100,000"
```

### Video / Event fields

```
videoGallery       object[]  Each object:
                               title*        string
                               source*       string  e.g. "YouTube",
                                                     "AWS Summit 2024"
                               date*         string  ISO 8601
                               url           string  Direct video URL
                               thumbnailUrl  string  Direct image URL
                               tier*         "direct" | "conference"
                                             | "inferred"
                             tier="direct":     confirmed on-camera appearance
                             tier="conference": listed as speaker/attendee,
                                                no video confirmed
                             tier="inferred":   no record found

lastUpdated*       string    ISO 8601. Date this profile was last enriched.
```

---

## HCLParameterProfile — field contract

```
executiveId*            string   Must match Executive.id exactly.
```

### 8 Parameter scores

Each parameter is an object with:

```
signalLevel*    "STRONG" | "MODERATE" | "WEAK"
summary*        string   2-sentence human-readable finding.
derivedSignal*  string   1-line implication. e.g. "Innovation focus → Pro"
```

Parameters:

```
publicPersona*
psychographicMindset*
digitalActivity*
topicAffinity*
painPointIndicators*
ecosystemVendorExposure*
eventPresence*
contentInteraction*
```

### Output fields

```
opportunityAreas*       object[]  Each object:
                                    area*            string
                                    type*            "Strategic" |
                                                     "Tactical" |
                                                     "Emerging"
                                    confidenceScore* number  0–100

overallClassification*  "Pro" | "Neutral" | "Anti"
dealInterestScore*      number   0–100. Used in gauge component.
```

---

## Data sourcing guide for scraping team

**SCRAPED FROM LINKEDIN:**

name, title, company, location, linkedIn, photo, aboutBio,
skills, recommendations, articlesWritten, featuredLinks,
socialPosts, languages, volunteering, careerJourney, education,
awards, videoGallery (tier="conference" from event mentions in posts)

**SCRAPED FROM PUBLIC WEB:**

email (company website / press releases)
annualRevenue, teamSize (company filings / Crunchbase)
netWorth (Forbes, Bloomberg where available)
videoGallery (tier="direct" from YouTube search by name)
kpiMetrics (earnings calls, annual reports, press)
competitorsPartners (company website, press releases)

**RESEARCH-DERIVED (Netscribes team):**

areasOfFocus, visionQuotes, strategies, challenges,
opportunities, trendsInsights, productsTechnologies,
targetMarkets, decisionInsights, risksThreats,
all HCLParameterProfile fields

**NOT AVAILABLE / DO NOT ATTEMPT:**

- LinkedIn likes per post (not public)
- LinkedIn connection count (requires login)
- LinkedIn follows (requires login)
- Private or connection-gated profile content

---

## Competitor name matching

The frontend scans `careerJourney[].company` against a hardcoded
list in `/src/utils/competitors.ts`. Your scraper must return
company names that match this list spelling exactly:

```
Accenture, TCS, Tata Consultancy, Wipro, Infosys,
Cognizant, Capgemini, IBM, Deloitte, EY, PWC,
KPMG, DXC, Unisys, NTT Data, LTIMindtree
```

If a company name from LinkedIn is a variant (e.g. "Tata
Consultancy Services" instead of "TCS"), normalize it to
the list entry before returning from the API.
