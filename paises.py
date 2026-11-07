"""Divisas RD · datos de cada país (corre una vez al día con GitHub Actions y deja paises.json en la raíz).
 - Economía (Banco Mundial): inflación, crecimiento, remesas y desempleo de RD, EE. UU., Puerto Rico, Colombia, México, Venezuela,
   Haití, Guatemala, Honduras, Perú, Chile y Argentina.
 - Combustibles de México (datos abiertos de la Comisión Reguladora de Energía): promedio nacional por litro.
 - Gasolina (para las gráficas): en RD los precios del MICM de cada semana (se guardan desde que corre);
   en EE. UU. el promedio nacional y 9 estados semana por semana (EIA, 2 años) y todos los estados hoy (AAA).
 - Historial del dólar (para la gráfica): la tasa internacional de cada día (últimos 90 días, de currency-api)
   y el promedio de compra y venta de los bancos de RD (del worker; se guarda uno por día desde que empieza a correr).
   (Los de EE. UU. ya los da el worker; Colombia, Venezuela y Puerto Rico no publican datos que se lean solos.)
Si una fuente falla, se deja lo que ya había en paises.json, así la página nunca se queda vacía."""
import json, statistics, datetime, urllib.request, xml.etree.ElementTree as ET
from zoneinfo import ZoneInfo

ARCHIVO = "paises.json"
PAISES = {"do": "DOM", "us": "USA", "pr": "PRI", "co": "COL", "mx": "MEX", "ve": "VEN",
          "ht": "HTI", "gt": "GTM", "hn": "HND", "pe": "PER", "cl": "CHL", "ar": "ARG"}
INDICADORES = {
    "inflacion": "FP.CPI.TOTL.ZG",          # inflación anual (%)
    "crecimiento": "NY.GDP.MKTP.KD.ZG",     # crecimiento del PIB (%)
    "remesas": "BX.TRF.PWKR.DT.GD.ZS",      # remesas recibidas (% del PIB)
    "desempleo": "SL.UEM.TOTL.ZS",          # desempleo (% de la fuerza laboral)
}
TASAS_BANCOS = "https://divisas-rd.juanbatista88.workers.dev/tasas"
DIAS_MERCADO = 90      # días hacia atrás de la tasa internacional
DIAS_GUARDADOS = 400   # el historial no crece para siempre
CABECERA = {"User-Agent": "DivisasRD/1.0 (+https://divisasrd.com)"}


def bajar(url, segundos=90):
    with urllib.request.urlopen(urllib.request.Request(url, headers=CABECERA), timeout=segundos) as r:
        return r.read()


def economia():
    salida = {k: {} for k in PAISES}
    codigos = ";".join(PAISES.values())
    for clave, ind in INDICADORES.items():
        try:
            datos = json.loads(bajar(f"https://api.worldbank.org/v2/country/{codigos}/indicator/{ind}?format=json&mrnev=1&per_page=100"))
            for fila in (datos[1] if len(datos) > 1 and datos[1] else []):
                iso3, valor = fila.get("countryiso3code"), fila.get("value")
                pais = next((k for k, v in PAISES.items() if v == iso3), None)
                if pais and valor is not None:
                    salida[pais][clave] = {"valor": round(float(valor), 2), "anio": fila.get("date")}
            print("Banco Mundial", clave, "ok")
        except Exception as e:
            print("Banco Mundial", clave, "falló:", e)
    return salida


def combustibles_mexico():
    """Mediana nacional de todas las gasolineras (pesos mexicanos por litro)."""
    xml = bajar("https://publicacionexterna.azurewebsites.net/publicaciones/prices", 180)
    precios = {"regular": [], "premium": [], "diesel": []}
    for _, el in ET.iterparse(__import__("io").BytesIO(xml)):
        if el.tag == "gas_price":
            tipo = (el.get("type") or "").lower()
            try:
                v = float(el.text)
            except (TypeError, ValueError):
                continue
            if tipo in precios and 10 < v < 60:
                precios[tipo].append(v)
        el.clear()
    res = {t: round(statistics.median(v), 2) for t, v in precios.items() if len(v) >= 100}
    if not res:
        raise ValueError("no se encontraron precios")
    res["estaciones"] = max(len(v) for v in precios.values())
    res["fuente"] = "Comisión Reguladora de Energía (CRE), precio típico de todas las gasolineras del país"
    res["unidad"] = "litro"
    res["fecha"] = datetime.date.today().isoformat()
    return res


def mercado_del_dia(dia):
    """Tasa internacional de 1 dólar en pesos dominicanos ese día (currency-api, con un respaldo)."""
    for url in (f"https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{dia}/v1/currencies/usd.min.json",
                f"https://{dia}.currency-api.pages.dev/v1/currencies/usd.min.json"):
        try:
            v = float(json.loads(bajar(url, 30))["usd"]["dop"])
            if 30 < v < 200:
                return round(v, 4)
        except Exception:
            pass
    return None


def promedio_bancos():
    """Promedio de compra y de venta de los bancos de RD ahora mismo (del worker de Cloudflare)."""
    d = json.loads(bajar(TASAS_BANCOS, 60))
    bancos = [e for e in d.get("entidades", []) if e.get("tipo") == "banco"]
    compras = [float(e["compra"]) for e in bancos if e.get("compra")]
    ventas = [float(e["venta"]) for e in bancos if e.get("venta")]
    if len(compras) < 3:
        raise ValueError("muy pocos bancos con tasa")
    return round(statistics.mean(compras), 4), (round(statistics.mean(ventas), 4) if len(ventas) >= 3 else None)


def historial_dolar(viejo):
    hoy = datetime.datetime.now(ZoneInfo("America/Santo_Domingo")).date()
    dias = {d["f"]: d for d in viejo if isinstance(d, dict) and d.get("f")}
    nuevos = 0
    for i in range(DIAS_MERCADO, -1, -1):
        dia = (hoy - datetime.timedelta(days=i)).isoformat()
        fila = dias.setdefault(dia, {"f": dia})
        if fila.get("m") is None:
            m = mercado_del_dia(dia)
            if m:
                fila["m"] = m
                nuevos += 1
    print("Dólar internacional: días nuevos", nuevos)
    try:
        compra, venta = promedio_bancos()
        fila = dias.setdefault(hoy.isoformat(), {"f": hoy.isoformat()})
        fila["b"] = compra
        if venta:
            fila["v"] = venta
        print("Bancos hoy: compra", compra, "venta", venta)
    except Exception as e:
        print("Promedio de los bancos falló (hoy queda sin ese dato):", e)
    lista = [d for d in sorted(dias.values(), key=lambda x: x["f"]) if d.get("m") or d.get("b")]
    return lista[-DIAS_GUARDADOS:]


# ---------- Gasolina ----------
EIA_XLS = "https://www.eia.gov/dnav/pet/xls/PET_PRI_GND_DCUS_NUS_W.xls"
AAA = "https://gasprices.aaa.com/state-gas-price-averages/"
COMB_SERVIDOR = TASAS_BANCOS.replace("/tasas", "/combustibles")
ESTADOS_EIA = ["California", "Colorado", "Florida", "Massachusetts", "Minnesota", "New York", "Ohio", "Texas", "Washington"]
ESTADOS_ES = {"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "DC": "Washington D. C.", "FL": "Florida", "GA": "Georgia", "HI": "Hawái",
    "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Luisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Míchigan", "MN": "Minnesota", "MS": "Misisipi",
    "MO": "Misuri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "Nuevo Hampshire", "NJ": "Nueva Jersey",
    "NM": "Nuevo México", "NY": "Nueva York", "NC": "Carolina del Norte", "ND": "Dakota del Norte", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregón", "PA": "Pensilvania", "RI": "Rhode Island", "SC": "Carolina del Sur",
    "SD": "Dakota del Sur", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia",
    "WA": "Washington", "WV": "Virginia Occidental", "WI": "Wisconsin", "WY": "Wyoming"}
NOMBRE_ES = {"U.S.": "Promedio nacional", "New York": "Nueva York", "California": "California", "Colorado": "Colorado",
    "Florida": "Florida", "Massachusetts": "Massachusetts", "Minnesota": "Minnesota", "Ohio": "Ohio", "Texas": "Texas",
    "Washington": "Washington"}


def gasolina_eeuu_semanal():
    """Gasolina regular por semana (EIA): promedio nacional y 9 estados, últimos 2 años."""
    import re, xlrd
    libro = xlrd.open_workbook(file_contents=bajar(EIA_XLS, 120))
    series = {}   # nombre -> {fecha: precio}
    for hoja in libro.sheets():
        if not hoja.name.startswith("Data") or hoja.nrows < 4:
            continue
        cabeza = [str(hoja.cell_value(2, c)) for c in range(hoja.ncols)]
        for c, t in enumerate(cabeza):
            m = re.match(r"Weekly (.+?) Regular All Formulations Retail Gasoline Prices", t)
            if not m or (m.group(1) != "U.S." and m.group(1) not in ESTADOS_EIA):
                continue
            nombre = NOMBRE_ES[m.group(1)]
            for r in range(3, hoja.nrows):
                v, f = hoja.cell_value(r, c), hoja.cell_value(r, 0)
                if v in ("", None) or f in ("", None):
                    continue
                fecha = xlrd.xldate_as_datetime(f, libro.datemode).date().isoformat()
                series.setdefault(nombre, {})[fecha] = round(float(v), 3)
    if "Promedio nacional" not in series:
        raise ValueError("no vino el promedio nacional")
    fechas = sorted(series["Promedio nacional"])[-104:]
    return [{"f": f, **{n: series[n][f] for n in series if f in series[n]}} for f in fechas]


def gasolina_estados_hoy():
    """Todos los estados hoy (AAA): regular, mid, premium y diésel por galón."""
    import re
    html = bajar(AAA, 60).decode("utf-8", "replace")
    salida = {}
    for m in re.finditer(r"state=([A-Z]{2})[^>]*>\s*([^<]+?)\s*</a>(.*?)</tr>", html, re.S):
        cod, resto = m.group(1), m.group(3)
        nums = [float(x) for x in re.findall(r"\$\s*(\d+\.\d+)", resto)][:4]
        if cod in ESTADOS_ES and len(nums) >= 1 and 1 < nums[0] < 15:
            salida[cod] = {"n": ESTADOS_ES[cod], "r": nums[0], "m": nums[1] if len(nums) > 1 else None,
                           "p": nums[2] if len(nums) > 2 else None, "d": nums[3] if len(nums) > 3 else None}
    if len(salida) < 40:
        raise ValueError(f"solo vinieron {len(salida)} estados")
    fecha = re.search(r"Price as of\s*([\d/]+)", html)
    return salida, (fecha.group(1) if fecha else None)


def gasolina_rd(viejo):
    """Precios del MICM de esta semana (del worker), guardados semana por semana."""
    d = json.loads(bajar(COMB_SERVIDOR, 60))
    rd = d.get("rd") or {}
    semana = rd.get("semana")
    precios = {p["clave"]: p["precio"] for p in rd.get("precios", []) if p.get("clave") and p.get("precio") is not None}
    nombres = {p["clave"]: p.get("nombre") for p in rd.get("precios", []) if p.get("clave")}
    lista = [x for x in viejo if isinstance(x, dict)]
    if semana and precios and not any(x.get("semana") == semana for x in lista):
        hoy = datetime.datetime.now(ZoneInfo("America/Santo_Domingo")).date().isoformat()
        lista.append({"semana": semana, "f": hoy, "p": precios})
        print("Combustibles RD: semana nueva", semana)
    return lista[-260:], nombres


def main():
    try:
        viejo = json.load(open(ARCHIVO, encoding="utf-8"))
    except Exception:
        viejo = {}
    nuevo = {"economia": viejo.get("economia", {}), "combustibles": viejo.get("combustibles", {}), "dolar": viejo.get("dolar", []),
             "gasolina": viejo.get("gasolina", {})}
    eco = economia()
    for pais, valores in eco.items():
        if valores:
            nuevo["economia"][pais] = {**nuevo["economia"].get(pais, {}), **valores}
    try:
        nuevo["combustibles"]["mx"] = combustibles_mexico()
        print("México:", nuevo["combustibles"]["mx"])
    except Exception as e:
        print("Combustibles de México fallaron (se deja lo anterior):", e)
    try:
        nuevo["dolar"] = historial_dolar(nuevo["dolar"])
    except Exception as e:
        print("Historial del dólar falló (se deja lo anterior):", e)
    g = nuevo["gasolina"]
    try:
        g["rd"], g["nombres_rd"] = gasolina_rd(g.get("rd", []))
    except Exception as e:
        print("Combustibles RD fallaron (se deja lo anterior):", e)
    try:
        g["us_semanal"] = gasolina_eeuu_semanal()
        print("Gasolina EE. UU.: semanas", len(g["us_semanal"]))
    except Exception as e:
        print("Gasolina EE. UU. por semana falló (se deja lo anterior):", e)
    try:
        g["estados"], g["estados_fecha"] = gasolina_estados_hoy()
        print("Gasolina por estado:", len(g["estados"]))
    except Exception as e:
        print("Gasolina por estado falló (se deja lo anterior):", e)
    g["fuente"] = "RD: MICM (precios oficiales de cada semana). EE. UU.: EIA (promedio semanal) y AAA (promedio de cada estado)."
    nuevo["fuente_dolar"] = "Tasa internacional: currency-api (fawazahmed0). Bancos: promedio de las tasas de los bancos de RD en Divisas RD."
    nuevo["fuente_economia"] = "Banco Mundial (último año con datos de cada país)"
    nuevo["actualizado"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    with open(ARCHIVO, "w", encoding="utf-8") as f:
        json.dump(nuevo, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
