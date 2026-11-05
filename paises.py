"""Divisas RD · datos de cada país (corre una vez al día con GitHub Actions y deja paises.json en la raíz).
 - Economía (Banco Mundial): inflación, crecimiento, remesas y desempleo de RD, EE. UU., Puerto Rico, Colombia, México, Venezuela,
   Haití, Guatemala, Honduras, Perú, Chile y Argentina.
 - Combustibles de México (datos abiertos de la Comisión Reguladora de Energía): promedio nacional por litro.
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


def main():
    try:
        viejo = json.load(open(ARCHIVO, encoding="utf-8"))
    except Exception:
        viejo = {}
    nuevo = {"economia": viejo.get("economia", {}), "combustibles": viejo.get("combustibles", {}), "dolar": viejo.get("dolar", [])}
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
    nuevo["fuente_dolar"] = "Tasa internacional: currency-api (fawazahmed0). Bancos: promedio de las tasas de los bancos de RD en Divisas RD."
    nuevo["fuente_economia"] = "Banco Mundial (último año con datos de cada país)"
    nuevo["actualizado"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    with open(ARCHIVO, "w", encoding="utf-8") as f:
        json.dump(nuevo, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
