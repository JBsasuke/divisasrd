// =====================================================================
//  Divisas RD - Frases con humor para las publicaciones de @divisas_rd
//  Cada mañana se mira qué cambió y se elige una frase que vaya con eso.
//  Variables: {dolar} {cambio} {entidad} {compra} {empresa} {pct}
//             {premium} {regular} {dif} {btc}
//  Para añadir frases: escríbelas dentro de la lista que toque, entre comillas y con coma.
// =====================================================================

export const FRASES = {
  // ---------- El dólar subió desde ayer ----------
  dolar_sube: [
    "El dólar amaneció con ganas de subir: RD$ {dolar} (+{cambio}). Si recibes remesa hoy, ¡cógela suave y cámbiala bien! 💸",
    "Subió el dólar {cambio} pesos. El que tiene dólares guardados hoy anda con la camisa por fuera 😎",
    "¡Ay mi madre, el dólar subió! RD$ {dolar}. Buen día para el que recibe, malo para el que paga en dólares 😅",
    "El dólar se tomó un café cargado y subió a RD$ {dolar} ☕📈",
    "Dólar a RD$ {dolar}. Los que esperan remesa: hoy es su día. Los que pagan Netflix: aguanten 🙏",
    "Subidita del dólar (+{cambio}). Llama a tu familia afuera y dile que hoy rinde más 😏",
    "El dólar hoy está más arriba que el precio del aguacate: RD$ {dolar} 🥑",
    "Nuevo día, dólar más caro: RD$ {dolar}. Antes de cambiar, compara aquí abajo quién paga más 👇",
    "El dólar subió {cambio} pesos. La cartera de pesos llorando y la de dólares bailando bachata 💃",
    "Hoy el dólar vino en guagua expresa: RD$ {dolar} 🚌📈",
    "Si te iban a mandar 100 dólares, hoy te llegan unos pesitos más. ¡Avísale al tío de Nueva York! 🗽",
    "El dólar subió y ya hay quien está haciendo cuentas para el colmado 🧮",
  ],

  // ---------- El dólar bajó desde ayer ----------
  dolar_baja: [
    "¡Bajó el dólar! RD$ {dolar} ({cambio}). Si ibas a comprar dólares, hoy te sale más barato 🙌",
    "El dólar se fue de vacaciones y bajó a RD$ {dolar} 🏖️📉",
    "Bajadita del dólar ({cambio}). El que tiene que pagar algo en dólares hoy respira tranquilo 😮‍💨",
    "Dólar a RD$ {dolar}. Hoy el peso amaneció de buen humor 🇩🇴💪",
    "El dólar bajó {cambio}. Buen momento para pagar esa compra en línea que tenías en el carrito 🛒",
    "El dólar hoy anda humilde: RD$ {dolar} 😇",
    "Bajó el dólar. El peso dominicano diciendo: 'Aquí estoy yo también, mi hermano' 😤🇩🇴",
    "Si vas a viajar, hoy los dólares te salen más baratos: RD$ {dolar} ✈️",
    "El dólar se puso a dieta y bajó a RD$ {dolar} 🥗",
    "Dólar en bajada ({cambio}). Si esperas remesa, mejor compara bien dónde cambiar 👇",
  ],

  // ---------- El dólar casi igual ----------
  dolar_igual: [
    "El dólar hoy está más tranquilo que un domingo en el campo: RD$ {dolar} 🐓",
    "Dólar quietecito en RD$ {dolar}. Ni sube ni baja, como el tráfico de la 27 😅",
    "Sin sorpresas: el dólar sigue en RD$ {dolar}. Aprovecha y compara quién paga más 👇",
    "El dólar hoy no quiso problemas: RD$ {dolar} 😌",
    "Dólar estable en RD$ {dolar}. Un día tranquilo para la cartera ☀️",
    "El dólar amaneció igualito que ayer. Hasta el dólar necesita un día libre 😴",
    "RD$ {dolar} y sin moverse. El dólar hoy está en modo 'no me molesten' 🙉",
    "Tasa tranquila hoy: RD$ {dolar}. Ideal para cambiar sin estrés 👌",
  ],

  // ---------- Quién paga más hoy ----------
  mejor_compra: [
    "Hoy el que mejor paga el dólar es {entidad}: RD$ {compra}. No dejes chelitos en la mesa 💰",
    "¿Vas a cambiar dólares? {entidad} está pagando RD$ {compra}, el mejor precio del día ⭐",
    "Tip del día: antes de cambiar, mira. Hoy {entidad} paga RD$ {compra} por dólar 👀",
    "{entidad} hoy se lució: RD$ {compra} por cada dólar 🏆",
    "No cambies en el primer sitio que veas. Hoy el mejor es {entidad}, a RD$ {compra} 😎",
    "Un peso más por dólar también es dinero. Hoy gana {entidad}: RD$ {compra} 🥇",
    "Si te llegaron dólares, {entidad} te da RD$ {compra}. ¡Compara siempre! 📊",
  ],

  // ---------- Bitcoin ----------
  btc_sube: [
    "Bitcoin subió {pct} hoy (US$ {btc}). El primo que habla de cripto en cada fiesta hoy está insoportable 😂",
    "Bitcoin +{pct}. Hoy los cripto-tígueres amanecieron contentos 🐯📈",
    "Bitcoin pegó un brinco de {pct}. Ya hay quien está diciendo 'yo te lo dije' 🙄",
    "Día verde para Bitcoin (+{pct}). Recuerda: lo que sube rápido también baja rápido 🎢",
  ],
  btc_baja: [
    "Bitcoin bajó {pct} hoy. El primo de las criptos hoy no ha escrito en el grupo de la familia 🤫",
    "Bitcoin -{pct}. Hoy los cripto-tígueres están en modo silencio 🔇",
    "Bitcoin se cayó {pct}. Así es esto: una montaña rusa sin cinturón 🎢",
    "Día rojo para Bitcoin (-{pct}). Respira, hidrátate y no vendas por nervios 😅",
  ],

  // ---------- Grandes empresas (en broma, no es consejo) ----------
  empresa_sube: [
    "{empresa} hoy amaneció contenta: +{pct} en la bolsa 📈😄",
    "Las acciones de {empresa} subieron {pct}. Alguien en la oficina de ellos hoy pidió pizza 🍕",
    "{empresa} +{pct}. Hoy los que tienen acciones ahí se tiran la foto con lentes oscuros 😎",
    "{empresa} subió {pct} hoy. El que compró ayer se siente analista de Wall Street 🧐",
    "Día bueno para {empresa}: +{pct}. A ver cuánto le dura la alegría 🎉",
  ],
  empresa_baja: [
    "{empresa} hoy amaneció con la mala: -{pct} en la bolsa 📉😬",
    "Las acciones de {empresa} bajaron {pct}. Hoy en esa oficina no hay pizza 🍕❌",
    "{empresa} -{pct}. El que tiene acciones ahí hoy no quiere hablar de eso 🙊",
    "{empresa} bajó {pct}. Hasta los grandes tienen sus días feos 🌧️",
    "Día flojo para {empresa} (-{pct}). La bolsa sube y baja como el agua del grifo en el barrio 🚰",
  ],

  // ---------- Petróleo y oro ----------
  petroleo_sube: [
    "El petróleo subió {pct} hoy 🛢️. Ojo, que eso después se siente en la bomba ⛽",
    "Petróleo +{pct}. Los que tienen jeepeta de 8 cilindros ya están sudando 😰",
    "Subió el barril de petróleo ({pct}). Mantén el ojo en la gasolina del viernes 👀",
  ],
  petroleo_baja: [
    "El petróleo bajó {pct} hoy 🛢️📉. ¡A cruzar los dedos para que se note en la bomba! 🤞",
    "Petróleo -{pct}. Si sigue así, quizás el viernes haya buena noticia para el tanque ⛽",
    "Bajó el petróleo ({pct}). Tu motor y tu bolsillo te lo agradecen 🚗",
  ],
  oro_sube: [
    "El oro subió {pct} hoy ✨. La abuela con sus cadenitas guardadas ahora es inversionista 👵💛",
    "Oro +{pct}. Esa prenda que tienes en la gaveta hoy vale más 💍",
  ],

  // ---------- Días especiales ----------
  quincena: [
    "¡Llegó la quincena! 💵 Antes de gastarla toda en el colmado, mira a cuánto está el dólar: RD$ {dolar}",
    "Día de cobro 🎉. Recuerda: la quincena llega en guagua y se va en avión ✈️",
    "Quincena en el bolsillo y dólar a RD$ {dolar}. Planifica antes de que se evapore 💨",
    "¡Cayó la quincena! Si vas a cambiar o mandar dinero, compara aquí 👇",
  ],
  lunes: [
    "Lunes otra vez 😩. Por lo menos el dólar está en RD$ {dolar} para empezar la semana informado",
    "Buenos días, lunes. Café, paciencia y la tasa del día: RD$ {dolar} ☕",
    "Arrancó la semana. Que tu semana suba más que el dólar 🙏📈",
  ],
  viernes: [
    "¡Viernes, al fin! 🎉 Hoy a las 7 p. m. salen los precios nuevos de la gasolina. Mientras, el dólar: RD$ {dolar}",
    "Viernes de pana 😎. Dólar a RD$ {dolar} y esta noche te decimos cómo amaneció la gasolina ⛽",
    "Ya es viernes. Revisa la tasa antes del fin de semana, que los bancos descansan: RD$ {dolar}",
  ],
  finde: [
    "Fin de semana 🏖️. Los bancos descansan, pero aquí tienes la tasa: RD$ {dolar}",
    "Sábado/domingo de playa, río o sofá. La tasa sigue aquí: RD$ {dolar} 😎",
    "Hoy toca descansar. Si vas a cambiar en una casa de cambio, mira quién paga más 👇",
  ],

  // ---------- Combustibles (viernes) ----------
  gasolina_baja: [
    "¡Bajó la gasolina! ⛽ Premium a RD$ {premium}. Hoy es el día para darle la vuelta a la isla 🚗🌴",
    "La gasolina bajó {dif} pesos. ¡A llenar ese tanque y pa' la playa! 🏖️",
    "Buenas noticias para el bolsillo: la gasolina bajó. Esta semana el motorcito anda feliz 🏍️💨",
    "Gasolina más barata esta semana ⛽📉. Ya puedes ir a visitar a la abuela al campo sin culpa 👵",
    "Bajó la gasolina. El conchista de la esquina hoy sonríe más 🚕😄",
  ],
  gasolina_sube: [
    "Subió la gasolina ⛽📈 (Premium RD$ {premium}). Esta semana toca caminar un poquito más 🚶",
    "La gasolina subió {dif} pesos. Mejor planifica bien los viajes de esta semana 🗺️",
    "Gasolina más cara 😬. Época de compartir el carro con el compadre 🚗👬",
    "Subió la gasolina. El tanque lleno ahora es un lujo, como el aire acondicionado en agosto 🥵",
  ],
  gasolina_igual: [
    "La gasolina sigue igual esta semana ⛽. Premium RD$ {premium} y Regular RD$ {regular}. Sin sustos 😌",
    "Precios congelados otra semana 🧊⛽. Por lo menos no subió",
    "Gasolina sin cambios. Esta semana el tanque y la cartera firmaron la paz 🤝",
    "Todo igual en la bomba ⛽. Premium RD$ {premium}. Buena semana para rodar tranquilo 🚗",
    "La gasolina no se movió esta semana. Que lo único que suba sea tu ánimo 😄",
  ],
};

// Nota que se añade al texto cuando la frase habla de cripto o de empresas
export const NOTA_INVERSION = "(Es en broma, no es consejo de inversión 😉)";

// ---------- Elegir la frase del día ----------
function semilla(texto) { let h = 2166136261; for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function azar(n) { return () => { n = (n + 0x6d2b79f5) | 0; let t = Math.imul(n ^ (n >>> 15), 1 | n); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const fmt = (n, d = 2) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const nombreCorto = (n) => n.replace(/\s*\(.*\)\s*/, "").replace(/^Banco\s+/, "").replace(" Banco", "").trim();

// candidatos: [{ grupo, peso, vars }]
function elegir(candidatos, usadas, fecha) {
  const r = azar(semilla(fecha));
  const total = candidatos.reduce((s, c) => s + c.peso, 0);
  let x = r() * total, elegido = candidatos[0];
  for (const c of candidatos) { if ((x -= c.peso) <= 0) { elegido = c; break; } }
  const lista = FRASES[elegido.grupo];
  const libres = lista.map((_, i) => i).filter((i) => !usadas.includes(`${elegido.grupo}:${i}`));
  const opciones = libres.length ? libres : lista.map((_, i) => i);
  const i = opciones[Math.floor(r() * opciones.length)];
  const texto = lista[i].replace(/\{(\w+)\}/g, (_, k) => elegido.vars[k] ?? "");
  return { id: `${elegido.grupo}:${i}`, grupo: elegido.grupo, texto };
}

// Frase para la imagen diaria de la tasa
export function fraseTasa({ dop, dopAyer, mejor, mercados, fecha, usadas }) {
  const zona = "America/Santo_Domingo";
  const d = new Date(fecha + "T12:00:00-04:00");
  const dia = Number(d.toLocaleDateString("en-US", { timeZone: zona, day: "numeric" }));
  const semana = d.toLocaleDateString("en-US", { timeZone: zona, weekday: "short" });
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const base = { dolar: fmt(dop) };
  const c = [];

  // Dólar contra ayer
  if (dopAyer) {
    const dif = dop - dopAyer;
    if (dif >= 0.1) c.push({ grupo: "dolar_sube", peso: 8, vars: { ...base, cambio: fmt(dif) } });
    else if (dif <= -0.1) c.push({ grupo: "dolar_baja", peso: 8, vars: { ...base, cambio: fmt(dif) } });
    else c.push({ grupo: "dolar_igual", peso: 3, vars: base });
  } else c.push({ grupo: "dolar_igual", peso: 3, vars: base });

  if (mejor) c.push({ grupo: "mejor_compra", peso: 1, vars: { ...base, entidad: nombreCorto(mejor.nombre), compra: fmt(mejor.compra) } });

  // Quincena y días de la semana
  if (dia === 15 || dia === 30 || (dia === ultimoDia && ultimoDia < 30)) c.push({ grupo: "quincena", peso: 14, vars: base });
  if (semana === "Mon") c.push({ grupo: "lunes", peso: 2, vars: base });
  if (semana === "Fri") c.push({ grupo: "viernes", peso: 2, vars: base });
  if (semana === "Sat" || semana === "Sun") c.push({ grupo: "finde", peso: 2, vars: base });

  // Mercados (cambio del día que da la bolsa)
  const m = (s) => (mercados || []).find((x) => x.simbolo === s && x.cambio != null);
  const btc = m("BTC");
  if (btc && Math.abs(btc.cambio) >= 3)
    c.push({ grupo: btc.cambio > 0 ? "btc_sube" : "btc_baja", peso: 3, vars: { pct: fmt(Math.abs(btc.cambio), 1) + "%", btc: fmt(btc.precio, 0) } });
  const grandes = (mercados || []).filter((x) => x.grupo === "grandes" && x.cambio != null && Math.abs(x.cambio) >= 2)
    .sort((a, b) => Math.abs(b.cambio) - Math.abs(a.cambio));
  if (grandes[0])
    c.push({ grupo: grandes[0].cambio > 0 ? "empresa_sube" : "empresa_baja", peso: 3, vars: { empresa: nombreCorto(grandes[0].nombre), pct: fmt(Math.abs(grandes[0].cambio), 1) + "%" } });
  const wti = m("WTI");
  if (wti && Math.abs(wti.cambio) >= 2)
    c.push({ grupo: wti.cambio > 0 ? "petroleo_sube" : "petroleo_baja", peso: 2, vars: { pct: fmt(Math.abs(wti.cambio), 1) + "%" } });
  const oro = m("ORO");
  if (oro && oro.cambio >= 1.5) c.push({ grupo: "oro_sube", peso: 1, vars: { pct: fmt(oro.cambio, 1) + "%" } });

  // El día de quincena siempre sale una frase de quincena
  const quincena = c.filter((x) => x.grupo === "quincena");
  return elegir(quincena.length ? quincena : c, usadas, fecha);
}

// Frase para la imagen de combustibles del viernes
export function fraseCombustibles({ precios, anteriores, fecha, usadas }) {
  const p = (k) => precios.find((x) => x.clave === k)?.precio;
  const vars = { premium: fmt(p("premium")), regular: fmt(p("regular")) };
  let grupo = "gasolina_igual";
  if (anteriores && anteriores.premium != null && p("premium") != null) {
    const dif = p("premium") - anteriores.premium;
    const difR = p("regular") - (anteriores.regular ?? p("regular"));
    const mayor = Math.abs(dif) >= Math.abs(difR) ? dif : difR;
    if (mayor <= -0.5) grupo = "gasolina_baja";
    else if (mayor >= 0.5) grupo = "gasolina_sube";
    vars.dif = fmt(Math.abs(mayor));
  }
  return elegir([{ grupo, peso: 1, vars }], usadas, fecha);
}
