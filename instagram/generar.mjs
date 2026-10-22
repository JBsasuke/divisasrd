// =====================================================================
//  Divisas RD - Genera las imágenes de Instagram (@divisa_rd)
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
console.log(salida);
