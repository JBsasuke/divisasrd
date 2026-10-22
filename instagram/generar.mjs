// =====================================================================
//  Divisas RD - Genera las imágenes de Instagram (@divisas_rd)
//  Uso:  node generar.mjs tasa           -> ig/tasa-AAAA-MM-DD.jpg
//        node generar.mjs combustibles   -> ig/combustibles-AAAA-MM-DD.jpg
//  Con DATOS_LOCALES=carpeta lee los .json de esa carpeta en vez de internet.
// =====================================================================
import { chromium } from "playwright";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SERVIDOR = "https://divisas-rd.juanbatista88.workers.dev";
const modo = process.argv[2] === "combustibles" ? "combustibles" : "tasa";

async function leer(nombre, url) {
  if (process.env.DATOS_LOCALES) return JSON.parse(await readFile(path.join(process.env.DATOS_LOCALES, nombre), "utf8"));
  const r = await fetch(url, { headers: { "User-Agent": "DivisasRD-Instagram" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return r.json();
}

const datos = modo === "combustibles"
  ? { combustibles: await leer("combustibles.json", SERVIDOR + "/combustibles?refrescar=1") } // fresco: el MICM publica el viernes por la tarde
  : { tasas: await leer("tasas.json", SERVIDOR + "/tasas"), mercado: await leer("mercado.json", "https://open.er-api.com/v6/latest/USD") };

// Revisión: no publicar una imagen vacía
if (modo === "tasa" && !(datos.mercado?.rates?.DOP > 0 && datos.tasas?.entidades?.length)) throw new Error("Faltan tasas");
if (modo === "combustibles" && !datos.combustibles?.rd?.precios?.some((p) => p.precio != null)) throw new Error("Faltan combustibles");

const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" }); // AAAA-MM-DD
const carpeta = process.env.CARPETA_SALIDA || path.join(AQUI, "..", "ig");
const salida = path.join(carpeta, `${modo}-${hoy}.jpg`);
await mkdir(carpeta, { recursive: true });

// Para GitHub Actions: deja los resultados como salidas del paso
async function salidaGH(clave, valor) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${clave}=${valor}\n`);
}

// Combustibles: no repetir una semana ya publicada (el MICM a veces publica tarde el viernes)
const marcaSemana = path.join(carpeta, "ultima-semana.txt");
if (modo === "combustibles") {
  const semana = datos.combustibles.rd.semana || "";
  let anterior = "";
  try { anterior = (await readFile(marcaSemana, "utf8")).trim(); } catch (_) {}
  if (!datos.combustibles.rd.enVivo || semana === anterior) {
    console.log(`Semana ya publicada o sin datos en vivo (${semana}). No se publica.`);
    await salidaGH("saltar", "true");
    process.exit(0);
  }
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await pagina.goto("file://" + path.join(AQUI, "plantilla.html"));
await pagina.evaluate(([m, d]) => window.pintar(m, d), [modo, datos]);
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: salida, type: "jpeg", quality: 92 });

// Versión para historias (1080×1920): la misma imagen en el centro, con franjas arriba y abajo.
// Las franjas quedan donde Instagram pone su nombre y la barra de respuesta, así no tapan los precios.
const salidaHistoria = salida.replace(/\.jpg$/, "-historia.jpg");
const imagenBase64 = (await readFile(salida)).toString("base64");
const historia = await navegador.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await historia.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1920px; overflow: hidden; font-family: Inter, system-ui, sans-serif; color: #fff;
         background: linear-gradient(170deg, #061428 0%, #002d62 55%, #0b4a8f 100%);
         display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .franja { height: 335px; width: 100%; display: flex; align-items: center; justify-content: center; text-align: center; }
  .arriba { padding-top: 120px; font-size: 34px; font-weight: 800; color: #ffc107; letter-spacing: .08em; text-transform: uppercase; }
  .abajo { flex-direction: column; padding-bottom: 150px; font-size: 30px; color: #b8c7e0; }
  .abajo b { font-size: 44px; color: #ffc107; display: block; margin-top: 6px; }
  img { width: 1000px; height: 1250px; display: block; border-radius: 40px;
        border: 3px solid rgba(255,193,7,.55); box-shadow: 0 20px 60px rgba(0,0,0,.45); }
</style></head><body>
  <div class="franja arriba">${modo === "combustibles" ? "Combustibles de la semana" : "La tasa de hoy"}</div>
  <img src="data:image/jpeg;base64,${imagenBase64}">
  <div class="franja abajo">Todas las tasas en<b>divisasrd.com</b></div>
</body></html>`);
await historia.evaluate(() => document.fonts.ready);
await historia.screenshot({ path: salidaHistoria, type: "jpeg", quality: 90 });
await navegador.close();

// Texto de la publicación
const fmt = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let texto;
if (modo === "tasa") {
  const dop = datos.mercado.rates.DOP;
  const ent = datos.tasas.entidades.filter((e) => e.compra != null);
  const mejor = ent.reduce((a, b) => (b.compra > a.compra ? b : a));
  texto = `💵 Dólar hoy en RD: RD$ ${fmt(dop)} (tasa de mercado)\n` +
          `⭐ Mejor compra: ${mejor.nombre} a RD$ ${fmt(mejor.compra)}\n\n` +
          `Todas las tasas de bancos, remesadoras y casas de cambio en divisasrd.com (enlace en la bio) 👆\n\n` +
          `#TasaDelDolar #DolarHoy #RepublicaDominicana #RD #Remesas #Banreservas #Dominicanos`;
} else {
  const p = Object.fromEntries(datos.combustibles.rd.precios.map((x) => [x.clave, x.precio]));
  texto = `⛽ Combustibles RD · semana del ${datos.combustibles.rd.semana}\n\n` +
          `Gasolina Premium: RD$ ${fmt(p.premium)}\nGasolina Regular: RD$ ${fmt(p.regular)}\n` +
          `Gasoil Óptimo: RD$ ${fmt(p.gasoilOptimo)}\nGasoil Regular: RD$ ${fmt(p.gasoilRegular)}\n` +
          `GLP: RD$ ${fmt(p.glp)}\n\nPrecios oficiales del MICM. Más en divisasrd.com 👆\n\n` +
          `#Combustibles #Gasolina #PrecioGasolina #RepublicaDominicana #RD #MICM #Dominicanos`;
}
await writeFile(salida.replace(/\.jpg$/, ".txt"), texto);
// La semana se marca como publicada en el workflow, solo si Instagram acepta la publicación
if (modo === "combustibles") await salidaGH("semana", datos.combustibles.rd.semana);
await salidaGH("saltar", "false");
await salidaGH("archivo", path.basename(salida));
await salidaGH("historia", path.basename(salidaHistoria));
console.log(salida);
