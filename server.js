const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Odoo config
const ODOO_URL = process.env.ODOO_URL || "https://pepiniere-belkora.odoo.com";
const ODOO_DB = process.env.ODOO_DB || "pepiniere-belkora";
const ODOO_USER = process.env.ODOO_USER || "";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

// CRM constants (provisioned in Odoo on 2026-05-11 for Bismarckia)
const SOURCE_ID = 36; // utm.source "Landing Page Bismarckia"
const TAG_IDS = [31, 11, 32]; // Bismarckia(31), Landing Page(11), Palmier(32)
const CAMPAIGN_ID = 9; // utm.campaign "2026-bismarckia-palmier-architectural"
const TEAM_ID = 7; // Vente particulier Pépinière (B2C)

// UTM -> Odoo ID mapping
const SOURCE_MAP = {
  google_ads: 27, // utm.source "Google Ads"
  meta_ads: 26,   // utm.source "Meta Ads"
  meta: 26,       // utm.source "Meta Ads" (alt)
};
const MEDIUM_MAP = {
  cpc: 10,    // utm.medium "Google Adwords"
  social: 7,  // utm.medium "Facebook"
  cpm: 7,     // utm.medium "Facebook" (alt)
};

// Rate limiting (in-memory)
const rateLimits = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimits) {
    const fresh = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (fresh.length === 0) rateLimits.delete(ip);
    else rateLimits.set(ip, fresh);
  }
}, 5 * 60_000);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust Railway proxy for correct req.ip
app.set("trust proxy", 1);

app.use(express.static(path.join(__dirname), { index: "index.html" }));

// ── Odoo JSON-RPC helpers ──

let cachedUid = null;

async function odooAuth() {
  if (cachedUid) return cachedUid;
  const resp = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "login",
        args: [ODOO_DB, ODOO_USER, ODOO_API_KEY],
      },
    }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || "Odoo auth failed");
  if (!data.result) throw new Error("Odoo auth returned no uid");
  cachedUid = data.result;
  return cachedUid;
}

async function odooCreate(model, values) {
  const uid = await odooAuth();
  const resp = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [ODOO_DB, uid, ODOO_API_KEY, model, "create", [values]],
      },
    }),
  });
  const data = await resp.json();
  if (data.error) {
    throw new Error(
      data.error.data?.message || data.error.message || "Odoo create failed"
    );
  }
  return data.result;
}

// ── Rate limiter ──

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  if (!rateLimits.has(ip)) rateLimits.set(ip, []);
  const timestamps = rateLimits
    .get(ip)
    .filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX) {
    return res
      .status(429)
      .json({ error: "Trop de demandes. Veuillez patienter une minute." });
  }
  timestamps.push(now);
  rateLimits.set(ip, timestamps);
  next();
}

// ── POST /api/lead ──

app.post("/api/lead", rateLimit, async (req, res) => {
  try {
    const {
      contact_name,
      phone,
      email,
      city,
      quantity,
      size,
      usage,
      description,
      interest_amenagement,
      interest_palmiers_autres,
      interest_bambou,
      interest_zoysia,
      interest_conception,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      landing_page,
      brand,
    } = req.body;

    // Honeypot — silent accept
    if (req.body.website) {
      return res.json({ ok: true });
    }

    if (!contact_name || contact_name.trim().length < 2) {
      return res.status(400).json({ error: "Nom requis (min 2 caracteres)" });
    }
    const cleanPhone = (phone || "").replace(/[\s\-]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      return res.status(400).json({ error: "Telephone invalide" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ error: "Ville requise" });
    }

    // Build description with context
    const parts = [];
    if (description && description.trim()) {
      parts.push(description.trim());
    }
    parts.push("");
    parts.push("--- Projet ---");
    if (quantity) parts.push(`Quantité: ${quantity}`);
    if (size) parts.push(`Taille: ${size}`);
    if (usage) parts.push(`Usage: ${usage}`);

    parts.push("");
    parts.push("--- Landing page ---");
    parts.push(`Ville: ${city.trim()}`);
    parts.push(`Page: ${landing_page || "/bismarckia"}`);
    parts.push(`Marque: ${brand || "pepi"}`);

    const interests = [];
    if (interest_amenagement) interests.push("Aménagement paysager");
    if (interest_palmiers_autres) interests.push("Autres palmiers");
    if (interest_bambou) interests.push("Bambou brise-vue");
    if (interest_zoysia) interests.push("Zoysia (gazon)");
    if (interest_conception) interests.push("Conception/Design jardin");
    if (interests.length > 0) {
      parts.push(`Intérêts: ${interests.join(", ")}`);
    }

    if (utm_source) parts.push(`UTM Source: ${utm_source}`);
    if (utm_medium) parts.push(`UTM Medium: ${utm_medium}`);
    if (utm_campaign) parts.push(`UTM Campaign: ${utm_campaign}`);
    if (utm_content) parts.push(`UTM Content: ${utm_content}`);
    if (utm_term) parts.push(`UTM Term: ${utm_term}`);

    const resolvedSource = SOURCE_MAP[utm_source] || SOURCE_ID;
    const resolvedMedium = MEDIUM_MAP[utm_medium] || null;

    const leadName = `Bismarckia ${quantity || ""}${
      size ? " " + size : ""
    }: ${contact_name.trim()}`.replace(/\s+/g, " ").trim();

    const leadValues = {
      name: leadName,
      contact_name: contact_name.trim(),
      phone: cleanPhone,
      city: city.trim(),
      description: parts.join("\n"),
      source_id: resolvedSource,
      campaign_id: CAMPAIGN_ID,
      team_id: TEAM_ID,
      tag_ids: [[6, 0, TAG_IDS]],
      type: "lead",
    };
    if (email && email.trim()) leadValues.email_from = email.trim();
    if (resolvedMedium) leadValues.medium_id = resolvedMedium;

    const leadId = await odooCreate("crm.lead", leadValues);

    console.log(
      `[LEAD] id=${leadId} | ${contact_name.trim()} | ${cleanPhone} | ${city.trim()}`
    );

    res.json({ ok: true, lead_id: leadId });
  } catch (err) {
    console.error("[LEAD ERROR]", err.message);
    cachedUid = null;
    res.status(500).json({ error: "Erreur serveur. Veuillez reessayer." });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    odoo: !!ODOO_USER,
    timestamp: new Date().toISOString(),
  });
});

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bismarckia landing page running on port ${PORT}`);
  console.log(`Odoo: ${ODOO_URL} (db: ${ODOO_DB}, user: ${ODOO_USER})`);
});
