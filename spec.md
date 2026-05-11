# Bismarckia Landing Page — Build Spec for Claude Code

> One-shot brief: everything required to ship `bismarckia.pepinierebelkora.com` to parity with the three existing landing pages (`bambou-oldhamii`, `drosanthemum-floribundum`, `zoysia-tenuifolia`).
>
> **Read order:** sections 1–3 = what to build, 4–6 = exact tracking + Odoo wiring (already provisioned for you), 7 = open items you must hand back to Mohammed.

---

## 0. TL;DR for the implementing agent

1. Scaffold a sibling folder to `bambou-oldhamii/` — same Express + static-HTML architecture, **no framework**.
2. Copy `drosanthemum-floribundum/index.html` as the **structural template** (most recent, has terrain_type + cross-sell chips + UTM-to-localStorage). Adapt content to Bismarckia.
3. Copy `drosanthemum-floribundum/server.js` and swap the four CRM constants (already created in Odoo — see §5).
4. Keep all global IDs unchanged: GA4 `G-80QJVYT4RT`, Meta Pixel `1412219209902062`, Google Ads `AW-759879955` with conversion label `XOeECJbPvP0bEJOyq-oC` (reused).
5. Form submits `POST /api/lead` → server creates a `crm.lead` in Odoo with the right `source_id`, `campaign_id`, `tag_ids`, `team_id`.
6. **Do not** introduce TypeScript, a bundler, or React. Sites are single-file HTML for Railway-friendly cold-start and CRO ad-hoc tweaks.

---

## 1. Product brief — *Bismarckia nobilis*

**Common name (FR):** Palmier de Bismarck, Palmier bleu d'argent
**Common name (EN):** Bismarck palm, Silver Bismarck palm
**Scientific:** *Bismarckia nobilis* Hildebr. & H.Wendl.
**Family:** Arecaceae (palmiers)
**Origin:** Madagascar

### Positioning vs the three siblings

| Page              | Hero promise                                    | Buyer intent        | Avg basket |
|-------------------|-------------------------------------------------|---------------------|------------|
| Bambou oldhamii   | Brise-vue dense rapide                          | Privacy / haie      | Medium     |
| Drosanthemum      | Tapis de fleurs zéro arrosage                   | Couvre-sol budget   | Low        |
| Zoysia tenuifolia | Gazon des Mascareignes haut de gamme            | Pelouse premium     | Medium     |
| **Bismarckia**    | **Le palmier architectural d'exception**         | **Centerpiece villa / projet design** | **High** |

### Why this positioning matters for the design

Bismarckia is the **most expensive product** of the four (specimens can run several thousand MAD per palm). The page must **read as more architectural, less promotional** than the others. Practical implications:

- Hero photo full-bleed, no overlaid sale badge.
- Drop the "Calculateur" surface-to-plants widget (Drosanthemum-style). Bismarckia is sold by the unit, not by the square meter.
- Replace the calculator section with a **"Mes contraintes projet"** block (sun exposure, hauteur sous portail, dégagement racinaire) that doubles as a qualifier.
- Keep WhatsApp + form CTAs, but tone down "Stock disponible — départ immédiat" — large specimens often require advance preparation.
- The "Comment ça marche" / 4-étapes block stays, but step copy emphasises **visite chantier + plantation grue** (because for big specimens we do come with equipment).

### Headline candidates (pick one in copy, A/B candidates kept in comments)

- "Le palmier qui sculpte votre jardin" — recommended H1
- "*Bismarckia nobilis* — palmier bleu d'exception"
- "L'éventail bleu qui signe une villa"

### Trust copy (reuse across pages)

- "Pépiniéristes depuis 2004"
- "Plus de 200 villas plantées"
- "Livraison et plantation dans tout le Maroc"
- "Note Google 4.8 / 33 avis vérifiés"

### Subdomain

`bismarckia.pepinierebelkora.com` — set the canonical, hreflang, OG URL, and Maps embed referrer to this exact host.

---

## 2. Architecture (identical to siblings)

```
Bismarckia/
├── .env.example          # Odoo creds — copy the 4 keys from siblings
├── .gitignore            # node_modules/ .env .DS_Store
├── package.json          # express ^4.21.2, "start": "node server.js"
├── server.js             # 260 LOC, see §5 for the swaps
├── index.html            # single-file landing, 1500–1900 LOC
├── assets/
│   ├── logos/            # client logos (reuse from bambou)
│   └── photos/           # Bismarckia hero + galerie photos
└── images/               # optimised section photos (-opt.jpg variants)
```

**Express server** (`server.js`):
- Serves the folder statically.
- `POST /api/lead` — JSON, validates, creates `crm.lead` via Odoo JSON-RPC.
- `GET /api/health` — used by Railway health check.
- In-memory rate limit: 5 submissions / minute / IP, `app.set("trust proxy", 1)` because Railway.
- Honeypot field `website` — silent accept if filled (don't tip off bots).

**No build step.** Edit `index.html` in place and ship. CRO-friendly.

**Deps:** only `express`. Lucide icons are loaded from unpkg CDN. Fonts (Cormorant Garamond + Sora) from Google Fonts.

---

## 3. Page structure (1:1 with `drosanthemum-floribundum/index.html`)

Follow this exact section order — it's been A/B-validated across the three live pages:

1. **`<head>`** — see §4 for the tracking blocks.
2. **`<nav>`** — logo left, phone + primary CTA right. Sticky with `.scrolled` class after 80px scroll.
3. **Hero** — `grid-template-columns: 1fr 1fr`, text left, hero photo right (full-bleed background).
   - Tag, H1 (Cormorant 52px, italic accent on key word), sub (Sora 16px, 300 weight), 5★ proof row, season-badge, two CTAs (`btn-terra` to `#devis`, `btn-wa` to WhatsApp).
4. **Trust bar** — 4 inline items: "Producteur direct depuis 2004 · 200+ villas plantées · Livraison Maroc · WhatsApp 7j/7".
5. **Logos clients** — marquee/grid of `assets/logos/*.png`. Reuse the same 22 client logos from bambou.
6. **Problème / Solution** — two columns: "Acheter un palmier mature, c'est risqué" vs "Le Bismarckia chez Belkora". Replaces the calculator's pain point.
7. **Produit** — close-up photo + 3-bullet description. Field "Plant de Bismarckia nobilis" (vs Drosanthemum godet block). List sizes you actually sell — confirm with Mohammed (e.g. 1.5 m / 2.5 m / 4 m / 6 m spécimen).
8. **Contraintes projet** *(replaces the calculator)* — 4-cell grid: Exposition · Hauteur dispo · Largeur dispo · Accès grue. Doubles as a soft qualifier; copy each field's hint to nudge the buyer toward the form.
9. **Comparaison** — Bismarckia vs Phoenix canariensis vs Washingtonia vs Chamaerops. 4 rows × 5 columns (criteria: silhouette, couleur, croissance, racines, prix).
10. **Comment ça marche** — 4-step horizontal flow: Devis → Visite chantier → Livraison grue → Plantation + suivi.
11. **Avantages** — 6-card grid: Silhouette unique · Bleu argenté · Résistant à la sécheresse · Sol pauvre OK · Pas de taille · Aucun parasite courant.
12. **Cas d'utilisation** — "Le Bismarckia s'adapte partout": villa d'exception, entrée de propriété, allée de palmiers alignés, jardin contemporain, hôtel/resort, projet paysagiste.
13. **Galerie** — 4–6 photos with captions. Use `loading="lazy"`. Optimised `-opt.jpg` per project convention (kept-in-place uncompressed source + `-opt.jpg` Mozjpeg ~80q).
14. **FAQ** — 8–10 questions. Accordion (`<button class="faq-q" aria-expanded="false">`). Required topics:
    - Le Bismarckia survit-il aux gelées de l'Atlas ?
    - À quel âge atteint-il sa couleur bleue caractéristique ?
    - Combien de temps pour transplanter un spécimen de 4 m ?
    - Garantie reprise ?
    - Sol argileux possible ?
    - Espace racinaire minimum ?
    - Voisinage piscine OK ?
    - Quel prix moyen ?
15. **Formulaire** (`id="devis"`) — split layout, left = trust list + WhatsApp fallback, right = form card (see §3.1).
16. **CTA final** — full-width forest band, H2 + paragraph + two CTAs.
17. **Footer** — 3-column: address + phone + Instagram, Google Maps iframe, Google review badge (4.8 / 33).
18. **WhatsApp floating button** (`.wa-float`, bottom-right).
19. **Sticky CTA bar** (`.sticky-cta`, hidden until scrolled past trust bar).

### 3.1. Form schema — Bismarckia variant

Hidden fields (always send):
```
utm_source, utm_medium, utm_campaign, utm_content, utm_term  # auto-populated from URL + localStorage
landing_page = "/bismarckia"
brand = "pepi"
website                                                       # honeypot
```

Visible fields:

| Field             | Type     | Required | Notes                                          |
|-------------------|----------|----------|------------------------------------------------|
| `contact_name`    | text     | ✅       | autocomplete=name, min 2 chars                  |
| `phone`           | tel      | ✅       | `pattern="[0-9+\s\-]{9,15}"`, strip spaces on submit |
| `email`           | email    | ❌       | optional                                       |
| `city`            | select   | ✅       | Rabat, Casablanca, Marrakech, Tanger, Fès, Agadir, Meknès, Kénitra, Autre |
| `quantity`        | number   | ❌       | "Nombre de palmiers", min 1 max 50              |
| `size`            | select   | ❌       | "Taille souhaitée": 1.5 m, 2.5 m, 4 m, 6 m+, "Je ne sais pas" |
| `usage`           | select   | ❌       | Entrée villa, Allée, Jardin, Hôtel/Resort, Autre |
| `description`     | textarea | ❌       | "Contraintes accès grue, exposition, sol, délai..." |
| `interest_amenagement` | checkbox | ❌ | Cross-sell chip                                |
| `interest_palmiers_autres` | checkbox | ❌ | Chip: Autres palmiers (Phoenix, Washingtonia...) |
| `interest_bambou` | checkbox | ❌       | Chip                                           |
| `interest_zoysia` | checkbox | ❌       | Chip                                           |
| `interest_conception` | checkbox | ❌  | Chip                                           |

Submit button label: "Demander mon devis Bismarckia"
Below the button: "Conseil et visite chantier offerts pour les projets > 3 spécimens"

The server must validate `contact_name`, `phone` (≥9 chars after strip), `city`. The optional fields go into the lead `description` field (see `drosanthemum-floribundum/server.js` lines 174–202 for the exact `parts.push(...)` pattern).

### 3.2. Design tokens — DO NOT INVENT NEW COLORS

Reuse the exact `:root` CSS variables from `drosanthemum-floribundum/index.html` lines 102–115:

```css
--forest:#14532D; --forest-mid:#166534; --forest-light:#1B7A3D;
--sage:#16A34A; --sage-light:#22C55E;
--gold:#D97706; --gold-light:#E88B0E; --gold-pale:#F59E0B;
--cream:#FAFAF8; --cream-warm:#F5F1EB;
--text:#111827; --text-2:#374151; --text-3:#6B7280; --text-4:#9CA3AF;
--white:#FFFFFF; --border:#E5E7EB; --border-light:#F3F4F6;
/* shadows, radii, surfaces, whatsapp green — copy verbatim */
```

Fonts: **Cormorant Garamond** (300/400/500/600/700, italic 400/500) for h1/h2 + serif accents; **Sora** (200–700) for body + UI. Body weight 300, antialiased.

Animations: keep `reveal`, `floatSoft`, `pulseGlow`, `revealUp` keyframes verbatim. Respect `@media (prefers-reduced-motion: reduce)`.

Accents that differ per page: hero italic word color is `--gold-pale` (drosanthemum) — for Bismarckia, **keep `--gold-pale`** for consistency. We're not introducing a Madagascar-blue token; the silver-blue of the palm comes from the photography, not the brand.

---

## 4. Tracking — exact code blocks to copy

All three IDs below are shared across `pepiniere-belkora` properties — reuse, do not create new ones (see §7 for the one exception).

### 4.1. Data Layer + `belkoraPush` helper

Put this **as the first `<script>` in `<head>`**, before the Meta Pixel and GA snippets. Verbatim copy of `drosanthemum-floribundum/index.html` lines 28–71. The campaign, source, medium, content, term fields auto-populate from `?utm_*` URL params via the IIFE at the bottom of the block. Every analytics event flows through `belkoraPush(eventName, params)` which mirrors the data to `window.dataLayer` and also gets piped to `fbq` + `gtag` calls.

### 4.2. Meta Pixel — `1412219209902062`

```html
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1412219209902062');
fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1412219209902062&ev=PageView&noscript=1" alt=""></noscript>
```

### 4.3. Google Analytics 4 + Google Ads — `G-80QJVYT4RT` and `AW-759879955`

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-80QJVYT4RT"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-80QJVYT4RT', { send_page_view: true });
gtag('config', 'AW-759879955');
</script>
```

### 4.4. Event taxonomy (every page fires these — keep names identical)

| Event           | Triggered when                              | `fbq` call                      | `gtag` call                       | `dataLayer` push          |
|-----------------|---------------------------------------------|---------------------------------|-----------------------------------|---------------------------|
| `PageView`      | Pixel/GA init                                | `fbq('track','PageView')`       | auto (`send_page_view: true`)     | —                         |
| `ViewContent`   | 10 s OR 50 % scroll, whichever first         | `track 'ViewContent'`           | `event 'view_content'`            | `belkoraPush('ViewContent')` |
| `ScrollDepth`   | 25/50/75/100 % scroll, once per milestone    | `trackCustom 'ScrollDepth'`     | `event 'scroll_depth'`            | `belkoraPush('ScrollDepth')` |
| `PhoneClick`    | Click any `a[href^="tel:"]`                  | `track 'Contact'`               | `event 'phone_click'`             | `belkoraPush('PhoneClick')` |
| `WhatsAppClick` | Click `[data-wa="true"]` or `wa.me` link     | `trackCustom 'WhatsAppClick'`   | `event 'whatsapp_click'`          | `belkoraPush('WhatsAppClick')` |
| `ClickCTA`      | Click `[data-cta="true"]`                    | `trackCustom 'ClickCTA'`        | `event 'cta_click'`               | `belkoraPush('ClickCTA')` |
| `FormStart`     | First `focusin` on a form field (non-honeypot) | `trackCustom 'FormStart'`     | `event 'form_start'`              | `belkoraPush('FormStart')` |
| `Lead`          | Form submit passes client-side validation    | `track 'Lead'` *(with eventID for CAPI dedup)* | `event 'generate_lead'`  | `belkoraPush('Lead')` (returns eventID) |
| Google Ads conversion | Form `POST /api/lead` returns `ok:true` | —                               | `event 'conversion', send_to:'AW-759879955/XOeECJbPvP0bEJOyq-oC'` | — |

Verbatim copy targets: `drosanthemum-floribundum/index.html` lines 1675–1832. Just swap `content_name:'drosanthemum-floribundum'` → `content_name:'bismarckia'`.

### 4.5. UTM auto-population (URL → form → localStorage)

`drosanthemum-floribundum/index.html` lines 1528–1546. This:
1. Reads `?utm_source / _medium / _campaign / _content / _term` from `location.search`.
2. Persists each to `localStorage` so a visitor who lands via ad → leaves → comes back direct still has the UTM attribution on form submit.
3. Writes them into the form's hidden inputs at page load.

The server then resolves `utm_source` and `utm_medium` strings to Odoo IDs via the maps in §5.2.

### 4.6. Things the spec deliberately does NOT include

- ❌ **No TikTok pixel.** A placeholder block exists in `drosanthemum-floribundum` but is commented out (`<!-- ... -->`). Leave it commented or remove entirely.
- ❌ **No Meta Conversions API (server-side).** Currently the `Lead` event sends `eventID` to the browser pixel for future deduplication, but there is **no server → Meta CAPI POST**. This is a known follow-up — flagged in §7.
- ❌ **No GTM container.** Tags are inline. Don't add `<script src=".../gtm.js">`.
- ❌ **No cookie banner.** None of the three live pages have one. If/when Mohammed asks for CNDP-compliant consent, that's a separate task.

---

## 5. Odoo wiring — already provisioned

The following records exist in `pepiniere-belkora` (prod Odoo at `https://pepiniere-belkora.odoo.com`) — created by Claude on 2026-05-11 ahead of the build:

### 5.1. CRM constants (paste into `server.js` lines 13–17)

```js
const SOURCE_ID = 36;       // utm.source "Landing Page Bismarckia"  (created 2026-05-11)
const TAG_IDS   = [31, 11, 32]; // crm.tag: Bismarckia(31) + Landing Page(11) + Palmier(32)
const CAMPAIGN_ID = 9;      // utm.campaign "2026-bismarckia-palmier-architectural" (created 2026-05-11)
const TEAM_ID   = 7;        // crm.team "Vente particulier Pépiniere" (B2C, shared)
```

### 5.2. UTM → Odoo ID maps (paste verbatim, identical across pages)

```js
const SOURCE_MAP = {
  google_ads: 27,  // utm.source "Google Ads"
  meta_ads:   26,  // utm.source "Meta Ads"
  meta:       26,  // utm.source "Meta Ads" (alt)
};
const MEDIUM_MAP = {
  cpc:    10, // utm.medium "Google Adwords"
  social: 7,  // utm.medium "Facebook"
  cpm:    7,  // utm.medium "Facebook" (alt)
};
```

Resolution logic stays identical to siblings:
- If `utm_source` matches a key in `SOURCE_MAP`, use that ID; otherwise fall back to `SOURCE_ID = 36` (the landing page itself).
- If `utm_medium` matches `MEDIUM_MAP`, set `medium_id`; otherwise leave it unset on the lead.

### 5.3. Lead create call

```js
const leadValues = {
  name: `Bismarckia ${quantity || ''}${size ? ' ' + size : ''}: ${contact_name.trim()}`,
  contact_name: contact_name.trim(),
  phone: cleanPhone,
  city: city.trim(),
  description: parts.join("\n"),     // built like drosanthemum/server.js:174–202
  source_id: resolvedSource,
  campaign_id: CAMPAIGN_ID,
  team_id: TEAM_ID,
  tag_ids: [[6, 0, TAG_IDS]],        // Odoo many2many "replace" command
  type: "lead",
};
if (email && email.trim()) leadValues.email_from = email.trim();
if (resolvedMedium) leadValues.medium_id = resolvedMedium;
```

### 5.4. Description block format (replicates drosanthemum)

```
<user's free-text description>

--- Projet ---
Quantité: 3
Taille: 4 m
Usage: Entrée villa

--- Landing page ---
Ville: Rabat
Page: /bismarckia
Marque: pepi
Intérêts: Aménagement paysager, Bambou brise-vue
UTM Source: google_ads
UTM Medium: cpc
UTM Campaign: 2026-bismarckia-palmier-architectural
UTM Content: ad-variant-blue-fan
UTM Term: palmier+bismarck+maroc
```

This is read by Mariyam / Zouheir in the WhatsApp cockpit when a Bismarckia lead lands — keep the field labels identical so the same parsers and Odoo views work.

---

## 6. Deployment

### 6.1. Railway service

Create a **new Railway service** in the same project as the three sibling landings:
- **Source:** GitHub repo `belkora-platform` (or wherever the landing folder lives — confirm with Mohammed; the three siblings each live as their own repo today, see `.git` inside each folder).
- **Root directory:** `/Bismarckia` (or just the repo root if it becomes its own repo).
- **Build:** `npm install`
- **Start:** `npm start` → `node server.js`
- **Health check path:** `/api/health` (returns `{status:"ok", odoo: true|false}`).
- **Region:** match siblings (Railway us-west default, since the WhatsApp bot + FreePBX trust list is already configured for us-west IPs — see `~/.claude/projects/.../memory/feedback_freepbx_railway_whitelist.md`).
- **Custom domain:** `bismarckia.pepinierebelkora.com` → set CNAME at the DNS host (Mohammed's task, see §7).

### 6.2. Environment variables (`.env`)

```bash
ODOO_URL=https://pepiniere-belkora.odoo.com
ODOO_DB=pepiniere-belkora
ODOO_USER=contact@pepinierebelkora.com
ODOO_API_KEY=<paste prod key>
PORT=3000   # Railway sets this automatically; default in server.js is also 3000
```

`ODOO_API_KEY` must be a **service-user API key**, not a password. The three siblings already use one — reuse the same value rather than rotating per landing.

### 6.3. Smoke test after deploy

```bash
# 1. health check (Odoo bound)
curl -s https://bismarckia.pepinierebelkora.com/api/health
# expect: {"status":"ok","odoo":true,"timestamp":"..."}

# 2. submit a fake lead, verify it lands in Odoo with tags + campaign + source
curl -s -X POST https://bismarckia.pepinierebelkora.com/api/lead \
  -H 'content-type: application/json' \
  -d '{"contact_name":"Test Bismarckia","phone":"0667000000","city":"Rabat",
       "utm_source":"google_ads","utm_medium":"cpc",
       "utm_campaign":"2026-bismarckia-palmier-architectural",
       "landing_page":"/bismarckia","brand":"pepi"}'
# expect: {"ok":true,"lead_id":<int>}
```

Then open the lead URL in Odoo (`https://pepiniere-belkora.odoo.com/odoo/crm.lead/<lead_id>`) and confirm:
- `source_id` = "Google Ads" (id=27, **not** id=36 — proves SOURCE_MAP override works)
- `medium_id` = "Google Adwords" (id=10)
- `campaign_id` = "2026-bismarckia-palmier-architectural" (id=9)
- `tag_ids` includes Bismarckia(31), Landing Page(11), Palmier(32)
- `team_id` = "Vente particulier Pépiniere" (id=7)
- Description contains the UTM block

Delete the test lead afterwards (or tag it `Test` and let Mariyam purge).

### 6.4. Browser smoke test (must do, not just curl)

1. Visit `https://bismarckia.pepinierebelkora.com/?utm_source=meta_ads&utm_medium=social&utm_campaign=2026-bismarckia-palmier-architectural&utm_content=test-creative-A`.
2. Open DevTools → Network → filter `facebook.com`. Confirm a `PageView` hit fires.
3. Filter `google-analytics.com` / `googletagmanager.com`. Confirm `gtag.js` loads and `page_view` is sent.
4. Scroll to 50 %, watch for `ViewContent` (both Meta + GA hits).
5. Click any `tel:` link — confirm `Contact` (Meta) + `phone_click` (GA) fire.
6. Click a WhatsApp button — confirm `WhatsAppClick`.
7. Open the form, focus the first input — confirm `FormStart`.
8. Submit the form with the fake data — confirm `Lead` (Meta with `eventID`), `generate_lead` (GA), and `conversion` to `AW-759879955/XOeECJbPvP0bEJOyq-oC` all fire **before** the `wa.me` window opens.

If any pixel hit is missing, the page is **not ready to be put behind ad spend**.

---

## 7. Open items requiring Mohammed (manual / out-of-MCP scope)

> Listed in execution order. Most are 5-minute tasks but cannot be done from Claude Code alone.

1. **Photography pack for Bismarckia.** Needed: 1 full-bleed hero (silver-blue palm at golden hour, ideally on a Belkora project), 1 close-up of the fan, 4–6 galerie shots showing villa entrance / driveway alignment / hotel context / corten or stone hardscape pairing. Drop them in `Bismarckia/images/` named `hero-bismarckia-opt.jpg`, `produit-bismarckia-fan.jpg`, `galerie-bismarckia-*-opt.jpg`. Per project convention, keep the uncompressed source next to the optimised `-opt.jpg`.

2. **Pricing tiers to expose in the form size dropdown.** Confirm the four height brackets and which ones we *actually keep in stock* (vs need-to-order). The current draft assumes 1.5 m / 2.5 m / 4 m / 6 m+; adjust if reality differs. Don't put prices on the page — keep the conversation in the lead.

3. **DNS:** add a CNAME `bismarckia` → `<railway service hostname>` at the registrar holding `pepinierebelkora.com`. Then attach the custom domain in Railway and wait for TLS.

4. **Google Ads conversion action.** You opted to reuse the existing label `AW-759879955/XOeECJbPvP0bEJOyq-oC`. That means Bismarckia leads will be lumped together with bambou + drosanthemum in the Google Ads "Conversions" report. If/when you want per-campaign ROAS in Ads, create a new conversion action "Lead Bismarckia" in Google Ads → copy the new label → swap line 1708 of the form-success handler. Until then, separation lives only in Odoo (via `campaign_id` and tags).

5. **Meta Ads creative + ad set.** You will need to create a new Meta campaign with `?utm_source=meta_ads&utm_medium=social&utm_campaign=2026-bismarckia-palmier-architectural` URL params on every creative. The pixel + Lead event are already shared, so no new pixel work is required.

6. **(Optional, future) Meta Conversions API.** Today only the browser pixel fires `Lead`. To improve match quality / iOS attribution, add a server-side CAPI call from `server.js` inside the `/api/lead` success path, posting `event_name: 'Lead'` with the same `event_id` the browser used (already generated by `belkoraPush`). Requires a Meta CAPI access token in `.env` and is the next biggest tracking-quality win.

7. **(Optional, future) Darija variant.** `bambou-oldhamii/` ships a `/darija` route serving `darija.html`. Drosanthemum and Zoysia don't. If Bismarckia targets a more upper-class B2C audience, Darija may be lower-priority — defer until you see actual ad performance.

8. **Cookie/consent banner (CNDP).** Not on any of the three live pages. If you ever want to publicise this site beyond ad traffic (organic SEO push, press), revisit consent UX.

---

## 8. Verification checklist before flipping the ad spend

- [ ] `npm install` succeeds, `node server.js` runs locally, `curl http://localhost:3000/api/health` returns `odoo:true`.
- [ ] Local form submission creates a lead in Odoo with all the right IDs (§6.3).
- [ ] Lighthouse score on `bismarckia.pepinierebelkora.com` ≥ 90 on Performance, 95 on Accessibility, 100 on SEO + Best Practices (siblings score in this range; large hero JPEG is the usual perf risk — keep `-opt.jpg` under 250 KB and use `loading="eager"` only for the hero).
- [ ] Browser DevTools confirms each of the 9 tracking events in §6.4 fires.
- [ ] Mobile responsive at 375 / 414 / 768 / 1280 / 1920 widths. The hero collapses to a single column under 900 px (see drosanthemum's `@media` block around line 290 of the CSS).
- [ ] `prefers-reduced-motion` respected — open System Preferences → Accessibility → Display → "Reduce motion", reload, verify no reveal animations play.
- [ ] OG image renders correctly when the URL is pasted into WhatsApp + Facebook Sharing Debugger.
- [ ] Google Maps iframe loads (referrer policy `no-referrer-when-downgrade`).

When all of the above is green, the page is ready to take ad traffic.

---

## 9. Pointers / cited line ranges (for the implementing agent)

| Thing                              | Reference file                                            | Lines       |
|------------------------------------|-----------------------------------------------------------|-------------|
| Tracking head block (pixel + GA)   | `drosanthemum-floribundum/index.html`                     | 28–98       |
| All tracking events + form submit  | `drosanthemum-floribundum/index.html`                     | 1524–1832   |
| Form HTML structure (richer)       | `drosanthemum-floribundum/index.html`                     | 1336–1453   |
| Form HTML (4-field minimal)        | `bambou-oldhamii/index.html`                              | 1120–1213   |
| Section ordering reference         | `drosanthemum-floribundum/index.html` (greps `<!-- ====`) | —           |
| Express + Odoo JSON-RPC server     | `drosanthemum-floribundum/server.js`                      | 1–257       |
| Description-block parts builder    | `drosanthemum-floribundum/server.js`                      | 174–202     |
| `.env.example` template            | `bambou-oldhamii/.env.example`                            | 1–4         |
| Footer (richer, w/ map + reviews)  | `drosanthemum-floribundum/index.html`                     | 1469–1510   |
| Sticky CTA + WA float              | `drosanthemum-floribundum/index.html`                     | 1512–1522   |
