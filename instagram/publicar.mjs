// =====================================================================
//  Divisas RD - Publica una imagen en Instagram (@divisas_rd)
//  Uso: node publicar.mjs <URL pública de la imagen JPG> <archivo .txt con el texto>
//  Necesita las variables IG_TOKEN e IG_USER_ID (secrets del repo).
// =====================================================================
import { readFile } from "node:fs/promises";

const API = "https://graph.instagram.com";
// Para una historia: node publicar.mjs --historia <URL pública de la imagen JPG 1080×1920>
const args = process.argv.slice(2);
const esHistoria = args[0] === "--historia";
const [urlImagen, archivoTexto] = esHistoria ? args.slice(1) : args;
const { IG_TOKEN, IG_USER_ID } = process.env;
if (!urlImagen || (!esHistoria && !archivoTexto)) throw new Error("Uso: node publicar.mjs <url-imagen> <archivo-texto>  |  node publicar.mjs --historia <url-imagen>");
if (!IG_TOKEN || !IG_USER_ID) throw new Error("Faltan los secrets IG_TOKEN o IG_USER_ID");

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Llama a la API sin mostrar nunca el token en los registros
async function api(metodo, ruta, parametros = {}) {
  const cuerpo = new URLSearchParams({ ...parametros, access_token: IG_TOKEN });
  const r = metodo === "GET"
    ? await fetch(`${API}${ruta}?${cuerpo}`)
    : await fetch(`${API}${ruta}`, { method: "POST", body: cuerpo });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const e = j.error || {};
    throw new Error(`Instagram ${ruta.replace(IG_USER_ID, "<cuenta>")}: HTTP ${r.status} · ${e.message || "sin detalle"} (código ${e.code ?? "?"}${e.error_subcode ? "/" + e.error_subcode : ""})`);
  }
  return j;
}

// 1) Crear el contenedor (las historias no llevan texto)
const parametros = esHistoria
  ? { image_url: urlImagen, media_type: "STORIES" }
  : { image_url: urlImagen, caption: (await readFile(archivoTexto, "utf8")).trim() };
const { id: contenedor } = await api("POST", `/${IG_USER_ID}/media`, parametros);
console.log("Contenedor creado");

// 2) Esperar a que Instagram termine de procesar la imagen (máximo ~3 minutos)
for (let i = 0; i < 18; i++) {
  const { status_code } = await api("GET", `/${contenedor}`, { fields: "status_code" });
  if (status_code === "FINISHED") break;
  if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram no pudo procesar la imagen (${status_code})`);
  await esperar(10000);
}

// 3) Publicar
const { id } = await api("POST", `/${IG_USER_ID}/media_publish`, { creation_id: contenedor });
console.log(`${esHistoria ? "Historia publicada" : "Publicado en el perfil"} (id ${id})`);
