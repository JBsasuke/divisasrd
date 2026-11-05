"""Divisas RD · datos de cada país (corre una vez al día con GitHub Actions y deja paises.json en la raíz).
 - Economía (Banco Mundial): inflación, crecimiento, remesas y desempleo de RD, EE. UU., Puerto Rico, Colombia, México, Venezuela,
   Haití, Guatemala, Honduras, Perú, Chile y Argentina.
 - Combustibles de México (datos abiertos de la Comisión Reguladora de Energía): promedio nacional por litro.
   (Los de EE. UU. ya los da el worker; Colombia, Venezuela y Puerto Rico no publican datos que se lean solos.)
Si una fuente falla, se deja lo que ya había en paises.json, así la página nunca se queda vacía."""
import json, statistics, datetime, urllib.request, xml.etree.ElementTree as ET

ARCHIVO = "paises.json"
PAISES = {"do": "DOM", "us": "USA", "pr": "PRI", "co": "COL", "mx": "MEX", "ve": "VEN",
          "ht": "HTI", "gt": "GTM", "hn": "HND", "pe": "PER", "cl": "CHL", "ar": "ARG"}
INDICADORES = {
    "inflacion": "FP.CPI.TOTL.ZG",          # inflación anual (%)
    "crecimiento": "NY.GDP.MKTP.KD.ZG",     # crecimiento del PIB (%)
    "remesas": "BX.TRF.PWKR.DT.GD.ZS",      # remesas recibidas (% del PIB)
    "desempleo": "SL.UEM.TOTL.ZS",          # desempleo (% de la fuerza laboral)
}
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


def main():
    try:
        viejo = json.load(open(ARCHIVO, encoding="utf-8"))
    except Exception:
        viejo = {}
    nuevo = {"economia": viejo.get("economia", {}), "combustibles": viejo.get("combustibles", {})}
    eco = economia()
    for pais, valores in eco.items():
        if valores:
            nuevo["economia"][pais] = {**nuevo["economia"].get(pais, {}), **valores}
    try:
        nuevo["combustibles"]["mx"] = combustibles_mexico()
        print("México:", nuevo["combustibles"]["mx"])
    except Exception as e:
        print("Combustibles de México fallaron (se deja lo anterior):", e)
    nuevo["fuente_economia"] = "Banco Mundial (último año con datos de cada país)"
    nuevo["actualizado"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    with open(ARCHIVO, "w", encoding="utf-8") as f:
        json.dump(nuevo, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
