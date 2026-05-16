## Why AdSense rejected the site

Google flagged two issues:
1. **Low value content** — the site is mostly a calculator tool with no original written articles.
2. **Ads on screens without publisher content** — the homepage and tool pages are mostly inputs/results with no editorial copy.

To get approved, the site needs (a) standard policy pages, (b) rich original Tamil content explaining astrology concepts, and (c) descriptive editorial copy on existing tool pages.

## What I'll build

### 1. Policy / trust pages (required by AdSense)
- `/about` — About UR Astro Soft (mission, who we are, methodology)
- `/contact` — Contact details + form
- `/privacy-policy` — Privacy policy (covers AdSense, cookies, data)
- `/terms` — Terms of service
- `/disclaimer` — Astrology disclaimer (entertainment/informational use)

### 2. Original Tamil articles (10 in-depth posts, 800–1200 words each)
Stored as static MDX-style data so they index well and need no DB. Topics:
- ஜாதகம் என்றால் என்ன? முழுமையான வழிகாட்டி
- 27 நட்சத்திரங்கள் — பலன்கள், குணங்கள், தொழில்
- 12 ராசிகள் விளக்கம் — மேஷம் முதல் மீனம் வரை
- மகா தசை புத்தி — எப்படி கணக்கிடுவது, பலன்கள்
- திருமண பொருத்தம் 10 — விரிவான விளக்கம்
- நவகிரகங்கள் — பலன்கள், பரிகாரங்கள்
- செவ்வாய் தோஷம் — உண்மை, பரிகாரம்
- கால சர்ப்ப தோஷம்
- பஞ்ச பட்சி சாஸ்திரம்
- நாள், கரணம், யோகம், திதி — பஞ்சாங்கம்

Each article: H1, intro, multiple H2/H3 sections, tables/lists, FAQ, related links, JSON-LD Article schema.

### 3. Homepage & tool page enrichment
- Add hero intro paragraph + "How it works" + "Why use this tool" + FAQ sections on Index, FreeHoroscope, BirthHoroscope, Porutham (200–400 words each, unique per page).
- Internal links between articles and tools.

### 4. SEO & navigation
- Footer with links to all policy pages, articles, tools
- Header nav updated with "Articles" link
- Update `sitemap.xml` and `robots.txt`
- Per-page `<SEO>` (title, description, canonical, og, JSON-LD)
- Breadcrumbs on article pages

### 5. AdSense readiness
- Remove any existing AdSense `<ins>` tags from low-content screens until approval.
- Add `ads.txt` placeholder (publisher ID requested from user later).
- Once approved, ads only on article pages, not on tool/result screens.

## Technical details

- New route file `src/pages/StaticPage.tsx` that renders a shared layout (header, footer, article body, SEO).
- New `src/data/articles.ts` exporting article metadata + body (Tamil markdown as JSX components or `dangerouslySetInnerHTML` with sanitized static HTML).
- New `src/components/SiteFooter.tsx` and `src/components/SiteHeader.tsx` shared across pages.
- Routes added to `App.tsx`:
  - `/about`, `/contact`, `/privacy-policy`, `/terms`, `/disclaimer`
  - `/articles`, `/articles/:slug`
- Update `public/sitemap.xml` and `public/robots.txt` with new URLs.
- Use existing `SEO.tsx` component for meta tags + add JSON-LD `Article` and `BreadcrumbList`.

## After implementation — your steps

1. Verify all pages render and links work.
2. Publish the site.
3. In Google Search Console: submit updated sitemap.
4. Wait 1–2 weeks for content to index.
5. Resubmit to AdSense for review.

## What I need from you

- AdSense publisher ID (`pub-XXXXXXXXXXXXXXXX`) for `ads.txt` — optional, can add later.
- Contact email + phone for Contact page.
- Confirm: keep brand name as "UR ASTRO SOFT"?

Reply **"go"** to start, or tell me which sections to skip/adjust.