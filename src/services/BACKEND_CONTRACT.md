# Data Architecture

## CXOWorld × HCL Frontend

Data is served as static JSON files from `/public/data/`.
No backend server required. No environment variables needed.

---

## File structure

```
/public/data/
  index.json                    ← Executive index (id + name)
  executives/
    {id}.json                   ← Full Executive profile
  hcl/
    {id}.json                   ← HCL parameter profile
```

## How it works

1. `getAllExecutives()` fetches `/data/index.json`, then loads
   each executive JSON in parallel.
2. `getExecutive(id)` fetches `/data/executives/{id}.json` directly.
   Includes fuzzy matching — strips trailing hash suffixes so
   `amit-kapoor-a07348` resolves to `amit-kapoor.json`.
3. `getHCLProfile(id)` fetches `/data/hcl/{id}.json` with the
   same fuzzy matching.

## To add a new executive

1. Create `/public/data/executives/{slug}.json` matching the
   Executive interface in `/src/types/executive.ts`.
2. Create `/public/data/hcl/{slug}.json` matching the
   HCLParameterProfile interface in `/src/types/hcl-parameters.ts`.
3. Add `{ "id": "{slug}", "name": "Full Name" }` to
   `/public/data/index.json`.

No code changes needed.

---

## Type contracts

### Executive — `/src/types/executive.ts`

All fields marked \* are required. Others are optional but rendered
conditionally where available.

```
id*                string    URL-safe slug. e.g. "amit-kapoor"
name*              string    Full name
title*             string    Current job title
company*           string    Current employer
location*          string    City, Country
linkedIn*          string    Full LinkedIn profile URL
photo              string    Direct image URL for headshot
email              string    Professional email if available
```

See `/src/types/executive.ts` for the complete interface.

### HCLParameterProfile — `/src/types/hcl-parameters.ts`

See `/src/types/hcl-parameters.ts` for the complete interface.

---

## Competitor name matching

The frontend scans `careerJourney[].company` against a hardcoded
list in `/src/utils/competitors.ts`. JSON data must use exact
spelling from that list:

```
Accenture, TCS, Tata Consultancy, Wipro, Infosys,
Cognizant, Capgemini, IBM, Deloitte, EY, PWC,
KPMG, DXC, Unisys, NTT Data, LTIMindtree
```
