// =====================================================================
//  KiloClaro - Genera las publicaciones de Instagram del día (@KiloClaroRD)
//  Uso:  node kiloclaro-generar.mjs clima      -> consejo del día según el tiempo (9:00 a. m.)
//        node kiloclaro-generar.mjs            -> lo que toca hoy (12:00 del mediodía)
//        node kiloclaro-generar.mjs consejo    -> forzar un tipo:
//              precio | consejo | truco | frase | recordatorio | ejemplo
//  Qué toca a las 12:00 (hora de RD):
//    lunes recordatorio · martes consejo · miércoles ejemplo de factura (4 publicaciones,
//    una por distribuidora) · jueves truco · viernes frase · sábado consejo · domingo frase
//  Si cambian las tarifas en el servidor, ese día sale la tabla del precio del kWh.
//  Deja en ig/kc/: kc-...-AAAA-MM-DD.jpg, ...-historia.jpg y .txt (texto de la publicación)
// =====================================================================
import { chromium } from "playwright";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import path from "node:path";
import {
  CONSEJOS, TRUCOS, FRASES, RECORDATORIOS, EJEMPLOS_KWH, EJEMPLOS_DISTRIBUIDORAS, ZONAS, CLIMA, TEMPORADAS, HASHTAGS,
} from "./kiloclaro-contenido.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SERVIDOR = "https://divisas-rd.juanbatista88.workers.dev";
const TIPOS = ["clima", "precio", "consejo", "truco", "frase", "recordatorio", "ejemplo"];
const POR_DIA = ["frase", "recordatorio", "consejo", "ejemplo", "truco", "frase", "consejo"]; // domingo=0
const BASE_TAGS = "#KiloClaro #FacturaDeLuz #AhorroDeEnergia #RepublicaDominicana #RD #Dominicanos";

async function salidaGH(clave, valor) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${clave}=${valor}\n`);
}
async function leerJSON(archivo, porDefecto) {
  try { return JSON.parse(await readFile(archivo, "utf8")); } catch (_) { return porDefecto; }
}
async function bajar(nombre, url) {
  if (process.env.DATOS_LOCALES) return JSON.parse(await readFile(path.join(process.env.DATOS_LOCALES, nombre), "utf8"));
  const r = await fetch(url, { headers: { "User-Agent": "KiloClaro-Instagram" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return r.json();
}

// ---------- Qué toca hoy ----------
const ZONA = "America/Santo_Domingo";
const hoy = process.env.FECHA_PRUEBA || new Date().toLocaleDateString("en-CA", { timeZone: ZONA }); // AAAA-MM-DD
const [anio, mes, dia] = hoy.split("-").map(Number);
const diaSemana = new Date(hoy + "T12:00:00Z").getUTCDay();
const carpeta = process.env.CARPETA_SALIDA || path.join(AQUI, "..", "ig", "kc");
await mkdir(carpeta, { recursive: true });

const pedido = (process.argv[2] || "auto").toLowerCase();
if (pedido !== "auto" && !TIPOS.includes(pedido)) throw new Error(`Tipo desconocido: ${pedido}. Usa: auto, ${TIPOS.join(", ")}`);

// ---------- Tarifas (las mismas de la app y la web) ----------
const luz = await bajar("luz.json", SERVIDOR + "/luz");
if (!Array.isArray(luz.tarifas) || !luz.tarifas.length) throw new Error("El servidor no devolvió tarifas");
const buscar = (dist) => luz.tarifas.find((t) => t.servicio === "Residencial" && (t.distribuidoras || []).includes(dist));
const firmaTarifa = createHash("sha256").update(JSON.stringify([luz.vigenciaDesde, luz.vigenciaHasta, luz.tarifas])).digest("hex").slice(0, 16);

function calcular(consumo, t) {
  const lineas = []; let desde = 0;
  for (const tr of t.tramos) {
    const tope = tr.hasta ?? Infinity, enEste = Math.max(0, Math.min(consumo, tope) - desde);
    if (enEste > 0) lineas.push({ kwh: enEste, precio: tr.precio, importe: enEste * tr.precio });
    if (consumo <= tope) break;
    desde = tope;
  }
  const energia = lineas.reduce((s, l) => s + l.importe, 0);
  const c = (t.cargoFijo || []).find((x) => x.hasta == null || consumo <= x.hasta), cargo = c ? c.monto : 0;
  const it = t.itbis || {}, itbis = it.desdeKwh != null && consumo >= it.desdeKwh ? (energia + cargo) * (it.porcentaje || 0) / 100 : 0;
  return { kwh: consumo, lineas, energia, cargo, itbis, total: energia + cargo + itbis };
}

let publicada = "";
try { publicada = (await readFile(path.join(carpeta, "tarifa-publicada.txt"), "utf8")).trim(); } catch (_) {}
const tipo = pedido !== "auto" ? pedido : publicada !== firmaTarifa ? "precio" : POR_DIA[diaSemana];
console.log(`Hoy ${hoy} toca: ${tipo}`);

// ---------- Elegir contenido sin repetir ----------
const archivoEstado = path.join(carpeta, "estado.json");
const estado = await leerJSON(archivoEstado, {});
estado.usadas = estado.usadas || {};
const azar = (extra = "") => parseInt(createHash("md5").update(hoy + tipo + extra).digest("hex").slice(0, 8), 16);
function elegir(lista, grupo) {
  const usadas = estado.usadas[grupo] || [];
  let libres = lista.filter((x) => !usadas.includes(x.id));
  if (!libres.length) libres = lista.filter((x) => x.id !== usadas[0]); // se agotaron: otra vuelta
  const elegido = libres[azar(grupo) % libres.length];
  estado.usadas[grupo] = [elegido.id, ...usadas.filter((u) => u !== elegido.id)].slice(0, Math.max(1, lista.length - 1));
  return elegido;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const fecha = `${DIAS[diaSemana]} · ${dia} ${MESES[mes - 1]} ${anio}`;
const fmt = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kwh = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const ENLACE = "Calcula tu factura gratis en kiloclarord.com (enlace en la bio) 👆";

/** Cada pieza es una publicación: { nombre, tipo, datos, texto } */
const piezas = [];

if (tipo === "clima") {
  // ---- Tiempo de hoy en Santo Domingo (Open-Meteo, gratis y sin llave) ----
  let clima = null;
  try {
    const j = await bajar("clima.json", "https://api.open-meteo.com/v1/forecast?latitude=18.47&longitude=-69.89" +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=America%2FSanto_Domingo&forecast_days=1");
    const dd = j.daily;
    if (dd && dd.temperature_2m_max?.[0] != null) {
      const codigo = dd.weather_code?.[0] ?? 0;
      const cielo = codigo >= 95 ? "tormenta" : (codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) ? "lluvia" : codigo >= 2 ? "nubes" : "sol";
      const descripcion = { tormenta: "tormentas", lluvia: "lluvia", nubes: "parcialmente nublado", sol: "soleado" }[cielo];
      clima = { lugar: "Santo Domingo", max: dd.temperature_2m_max[0], min: dd.temperature_2m_min[0], lluvia: dd.precipitation_probability_max?.[0] ?? null, cielo, descripcion };
    }
  } catch (e) { console.log("Sin datos del tiempo (se usa un consejo de temporada):", e.message); }

  // ---- Temporada ----
  const navidad = mes === 12 || (mes === 1 && dia <= 6);
  const ciclonica = mes >= 6 && mes <= 11;
  const verano = mes === 7 || mes === 8;
  const temporada = navidad ? "NAVIDAD" : verano ? "VERANO" : ciclonica ? "TEMPORADA CICLÓNICA" : mes === 5 ? "TEMPORADA DE LLUVIAS" : "";

  // ---- Qué grupo de consejos ----
  let grupo;
  if (clima) {
    grupo = clima.cielo === "tormenta" ? "tormenta"
      : clima.cielo === "lluvia" || (clima.lluvia ?? 0) >= 70 ? "lluvia"
      : clima.max >= 33 ? "calorFuerte" : clima.max >= 29 ? "calor" : "fresco";
  }
  let lista, nombreGrupo;
  const r = azar("temporada") % 10;
  if (navidad && r < 5) { lista = TEMPORADAS.navidad; nombreGrupo = "t-navidad"; }
  else if (ciclonica && (grupo === "tormenta" ? r < 5 : r < 1)) { lista = TEMPORADAS.ciclonica; nombreGrupo = "t-ciclonica"; }
  else if (verano && r < 2) { lista = TEMPORADAS.verano; nombreGrupo = "t-verano"; }
  else if (clima) { lista = CLIMA[grupo]; nombreGrupo = "clima-" + grupo; }
  else { lista = CONSEJOS; nombreGrupo = "consejo"; }
  const elegido = elegir(lista, nombreGrupo);
  const conMax = (t) => t.replaceAll("{max}", clima ? String(Math.round(clima.max)) : "30");
  const datos = {
    fecha, clima, temporada, titulo: conMax(elegido.titulo), texto: conMax(elegido.texto),
    etiqueta: "CONSEJO DEL DÍA",
    clase: clima && (clima.cielo === "lluvia" || clima.cielo === "tormenta") ? "azul" : clima && clima.max >= 29 ? "amarilla" : "",
  };
  const iconoTiempo = { sol: "☀️", nubes: "⛅", lluvia: "🌧️", tormenta: "⛈️" }[clima?.cielo] || "💡";
  const texto = (clima ? `${iconoTiempo} Hoy en Santo Domingo: máxima de ${Math.round(clima.max)} °C, mínima de ${Math.round(clima.min)} °C, ${clima.descripcion}.\n\n` : "") +
    `💡 ${datos.titulo}\n\n${datos.texto}\n\n${ENLACE}\n\n${BASE_TAGS} #ClimaRD #ConsejoDelDia`;
  piezas.push({ nombre: `kc-clima-${hoy}`, tipo: "clima", datos, texto });
} else if (tipo === "consejo" || tipo === "truco" || tipo === "recordatorio") {
  const lista = { consejo: CONSEJOS, truco: TRUCOS, recordatorio: RECORDATORIOS }[tipo];
  const datos = { fecha, ...elegir(lista, tipo) };
  const icono = { consejo: "💡", truco: "🛠️", recordatorio: "📟" }[tipo];
  const texto = `${icono} ${datos.titulo}\n\n${datos.texto}\n\n` +
    (tipo === "recordatorio" ? "Anótalo en la app KiloClaro o en kiloclarord.com y te sacamos el estimado de la semana y del mes. 👆" : ENLACE) +
    `\n\n${HASHTAGS}`;
  piezas.push({ nombre: `kc-${tipo}-${hoy}`, tipo, datos, texto });
} else if (tipo === "frase") {
  const datos = { fecha, ...elegir(FRASES, "frase") };
  const texto = `😂 ${datos.texto}\n\nEtiqueta a quien deja el aire prendido 👇\n\n${ENLACE}\n\n${HASHTAGS} #Humor`;
  piezas.push({ nombre: `kc-frase-${hoy}`, tipo, datos, texto });
} else if (tipo === "ejemplo") {
  // Una publicación por distribuidora, cada una con su consumo y su frase
  const n = estado.ejemplo || 0;
  estado.ejemplo = n + 1;
  const consumos = EJEMPLOS_KWH[n % EJEMPLOS_KWH.length];
  for (const dist of EJEMPLOS_DISTRIBUIDORAS) {
    const t = buscar(dist), zona = ZONAS[dist];
    if (!t || !zona) { console.log(`Sin tarifa o zona para ${dist}: se salta`); continue; }
    const f = calcular(consumos[dist], t);
    const frase = zona.frases[n % zona.frases.length];
    const datos = { fecha, distribuidora: dist, zona: zona.zona, frase, factura: f, codigo: t.codigo, vigencia: luz.vigencia };
    const texto = `🧾 ${frase}\n\n⚡ ${dist} · ${zona.zona}\nSi gastas ${kwh(f.kwh)} kWh al mes, tu factura sería de RD$ ${fmt(f.total)}\n\n` +
      f.lineas.map((l) => `▫️ ${kwh(l.kwh)} kWh × RD$ ${fmt(l.precio)} = RD$ ${fmt(l.importe)}`).join("\n") +
      (f.cargo > 0 ? `\n▫️ Cargo fijo: RD$ ${fmt(f.cargo)}` : "") + (f.itbis > 0 ? `\n▫️ ITBIS 18 %: RD$ ${fmt(f.itbis)}` : "") +
      `\n\nTarifa ${t.codigo} residencial, ${luz.vigencia}.\n¿Y la tuya? ${ENLACE}\n\n${BASE_TAGS} ${zona.hashtags}`;
    piezas.push({ nombre: `kc-ejemplo-${dist.toLowerCase()}-${hoy}`, tipo: "ejemplo", datos, texto });
  }
  if (!piezas.length) throw new Error("No hay tarifas para los ejemplos");
} else if (tipo === "precio") {
  const tabla = ["EDESUR", "EDENORTE", "EDEESTE"].map((dist) => {
    const t = buscar(dist);
    if (!t) return { distribuidora: dist, tramos: [], cargoBajo: null, cargoAlto: null };
    return { distribuidora: dist, tramos: t.tramos.map((x) => x.precio), cargoBajo: t.cargoFijo?.[0]?.monto ?? null, cargoAlto: t.cargoFijo?.[t.cargoFijo.length - 1]?.monto ?? null };
  });
  const cepm = buscar("CEPM")?.tramos?.[0]?.precio ?? null;
  const rangos = ["0 a 200", "201 a 300", "301 a 700", "701 o más"];
  const texto = `⚡ Precio del kWh · ${luz.vigencia}\n\n` +
    tabla.map((x) => `🔌 ${x.distribuidora}\n` + x.tramos.map((p, i) => `   ${rangos[i]} kWh: RD$ ${fmt(p)}`).join("\n") +
      (x.cargoAlto != null ? `\n   Cargo fijo: RD$ ${fmt(x.cargoBajo)} (hasta 100 kWh) o RD$ ${fmt(x.cargoAlto)}` : "")).join("\n\n") +
    (cepm != null ? `\n\n🏝️ CEPM (Punta Cana y Bávaro): RD$ ${fmt(cepm)} por kWh` : "") +
    `\n\nTarifa residencial BTS-1. ITBIS 18 % desde 701 kWh. Fuente: SIE.\n${ENLACE}\n\n${HASHTAGS} #TarifaElectrica #SIE`;
  piezas.push({ nombre: `kc-precio-${hoy}`, tipo, datos: { fecha, tabla, cepm, vigencia: luz.vigencia }, texto });
  await salidaGH("firma", firmaTarifa);
}

// ---------- Imágenes: perfil (1080×1350) e historia (1080×1920) ----------
let navegador;
try { navegador = await chromium.launch(process.env.CI ? { channel: "chrome" } : {}); }
catch (_) { navegador = await chromium.launch(); }
for (const pieza of piezas) {
  const base = path.join(carpeta, pieza.nombre);
  for (const [formato, alto, archivo] of [["perfil", 1350, base + ".jpg"], ["historia", 1920, base + "-historia.jpg"]]) {
    const p = await navegador.newPage({ viewport: { width: 1080, height: alto }, deviceScaleFactor: 1 });
    await p.goto("file://" + path.join(AQUI, "kiloclaro-plantilla.html"));
    await p.evaluate(([t, dd, f]) => window.pintar(t, dd, f), [pieza.tipo, pieza.datos, formato]);
    await p.evaluate(() => document.fonts.ready);
    const sobra = await p.evaluate(() => document.body.scrollHeight - window.innerHeight);
    if (sobra > 2) throw new Error(`${pieza.nombre}: el contenido no cabe en la imagen de ${formato} (sobran ${sobra}px). Acorta el texto.`);
    await p.screenshot({ path: archivo, type: "jpeg", quality: 92 });
    await p.close();
  }
  await writeFile(base + ".txt", pieza.texto);
  console.log(base + ".jpg");
}
await navegador.close();

await writeFile(archivoEstado, JSON.stringify(estado, null, 2) + "\n");
await salidaGH("tipo", tipo);
await salidaGH("lista", piezas.map((x) => x.nombre).join(" "));   // nombres sin extensión, separados por espacio
