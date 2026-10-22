// =====================================================================
//  Divisas RD - Renueva el token de Instagram (dura 60 días)
//  Escribe el token nuevo en el archivo indicado, sin mostrarlo nunca.
// =====================================================================
import { writeFile } from "node:fs/promises";

const { IG_TOKEN } = process.env;
const destino = process.argv[2];
if (!IG_TOKEN || !destino) throw new Error("Falta IG_TOKEN o el archivo de destino");

const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(IG_TOKEN)}`);
const j = await r.json().catch(() => ({}));
if (!r.ok || !j.access_token) throw new Error(`No se pudo renovar el token: HTTP ${r.status} · ${j.error?.message || "sin detalle"}`);
await writeFile(destino, j.access_token, { mode: 0o600 });
console.log(`Token renovado; caduca en ${Math.round((j.expires_in || 0) / 86400)} días`);
