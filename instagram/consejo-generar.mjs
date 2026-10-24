// =====================================================================
//  Divisas RD - Publicación de la tarde (3:00 p. m. RD): consejos y frases
//  Uso:  node consejo-generar.mjs            -> lo que toca hoy
//        node consejo-generar.mjs remesas    -> forzar: cambio | remesas | ahorro | dolares | frase
//  Qué toca: domingo frase · lunes cambio · martes remesas · miércoles ahorro
//            jueves dólares · viernes frase · sábado remesas
//  No repite: ig/consejos-estado.json guarda los últimos usados de cada lista.
//  Deja en ig/: consejo-AAAA-MM-DD.jpg, consejo-AAAA-MM-DD-historia.jpg y .txt
// =====================================================================
import { chromium } from "playwright";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import path from "node:path";
import { POR_DIA, ETIQUETAS, LISTAS, HASHTAGS } from "./divisas-consejos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ZONA = "America/Santo_Domingo";
const hoy = process.env.FECHA_PRUEBA || new Date().toLocaleDateString("en-CA", { timeZone: ZONA }); // AAAA-MM-DD
const [anio, mes, dia] = hoy.split("-").map(Number);
const diaSemana = new Date(hoy + "T12:00:00Z").getUTCDay();
const carpeta = process.env.CARPETA_SALIDA || path.join(AQUI, "..", "ig");
await mkdir(carpeta, { recursive: true });

async function salidaGH(clave, valor) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${clave}=${valor}\n`);
}

const pedido = (process.argv[2] || "auto").toLowerCase();
if (pedido !== "auto" && !LISTAS[pedido]) throw new Error(`Tipo desconocido: ${pedido}. Usa: auto, ${Object.keys(LISTAS).join(", ")}`);
const tipo = pedido === "auto" ? POR_DIA[diaSemana] : pedido;
console.log(`Hoy ${hoy} toca: ${tipo}`);

// ---------- Elegir sin repetir ----------
const archivoEstado = path.join(carpeta, "consejos-estado.json");
let estado = {};
try { estado = JSON.parse(await readFile(archivoEstado, "utf8")); } catch (_) {}
estado.usadas = estado.usadas || {};
const lista = LISTAS[tipo];
const usadas = estado.usadas[tipo] || [];
let libres = lista.filter((x) => !usadas.includes(x.id));
if (!libres.length) libres = lista.filter((x) => x.id !== usadas[0]); // se agotaron: otra vuelta, sin repetir el último
const azar = parseInt(createHash("md5").update(hoy + tipo).digest("hex").slice(0, 8), 16);
const elegido = libres[azar % libres.length];
estado.usadas[tipo] = [elegido.id, ...usadas.filter((u) => u !== elegido.id)].slice(0, Math.max(1, lista.length - 1));

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const datos = { ...elegido, etiqueta: ETIQUETAS[tipo], dia: DIAS[diaSemana], fecha: `${dia} de ${MESES[mes - 1]}` };

// ---------- Texto de la publicación ----------
const ENLACE = "La tasa del dólar de hoy, banco por banco, en divisasrd.com (enlace en la bio) 👆";
const icono = { cambio: "💱", remesas: "💸", ahorro: "🐷", dolares: "🛒" }[tipo];
const texto = tipo === "frase"
  ? `😂 ${datos.texto}\n\nEtiqueta a quien se identifica 👇\n\n${ENLACE}\n\n${HASHTAGS} #Humor`
  : `${icono} ${datos.titulo}\n\n${datos.texto}\n\n${ENLACE}\n\n${HASHTAGS} ${tipo === "remesas" ? "#Remesas" : tipo === "cambio" ? "#TasaDelDolar" : ""}`.trimEnd();

// ---------- Imágenes: perfil (1080×1350) e historia (1080×1920) ----------
const base = path.join(carpeta, `consejo-${hoy}`);
let navegador;
try { navegador = await chromium.launch(process.env.CI ? { channel: "chrome" } : {}); }
catch (_) { navegador = await chromium.launch(); }
for (const [formato, alto, archivo] of [["perfil", 1350, base + ".jpg"], ["historia", 1920, base + "-historia.jpg"]]) {
  const p = await navegador.newPage({ viewport: { width: 1080, height: alto }, deviceScaleFactor: 1 });
  await p.goto("file://" + path.join(AQUI, "consejo-plantilla.html"));
  await p.evaluate(([t, d, f]) => window.pintar(t, d, f), [tipo, datos, formato]);
  await p.evaluate(() => document.fonts.ready);
  const sobra = await p.evaluate(() => document.body.scrollHeight - window.innerHeight);
  if (sobra > 2) throw new Error(`El consejo ${elegido.id} no cabe en la imagen de ${formato} (sobran ${sobra}px). Acorta el texto.`);
  await p.screenshot({ path: archivo, type: "jpeg", quality: 92 });
  await p.close();
}
await navegador.close();

await writeFile(base + ".txt", texto);
await writeFile(archivoEstado, JSON.stringify(estado, null, 2) + "\n");
console.log("Consejo:", elegido.id, "-", elegido.titulo || elegido.texto);
await salidaGH("saltar", "false");
await salidaGH("archivo", path.basename(base) + ".jpg");
await salidaGH("historia", path.basename(base) + "-historia.jpg");
console.log(base + ".jpg");
