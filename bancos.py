"""Divisas RD - tasas de los bancos que no dejan que Cloudflare lea su página (Banreservas)
o que InfoDolar ya no trae. Se corre en GitHub cada 2 horas y deja bancos.json en la web;
el servidor de tasas lo usa cuando no puede leer el banco directo."""
import json, re, urllib.request
from datetime import datetime, timezone

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0 Safari/537.36")
CABECERAS = {"User-Agent": UA, "Accept-Language": "es-DO,es;q=0.9,en;q=0.8",
             "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"}

def bajar(url, extra=None):
    with urllib.request.urlopen(urllib.request.Request(url, headers={**CABECERAS, **(extra or {})}), timeout=40) as r:
        return r.read().decode("utf-8", "replace")

def numero(t):
    m = re.search(r"(\d{2,3}[.,]\d{1,4})", t or "")
    if not m:
        return None
    n = float(m.group(1).replace(",", "."))
    return round(n, 2) if 30 < n < 200 else None

def banreservas():
    html = bajar("https://www.banreservas.com/")
    def celda(clase):
        m = re.search(r'class=["\'][^"\']*' + clase + r'[^"\']*["\'][^>]*>([\s\S]*?)</', html, re.I)
        return numero(re.sub(r"<[^>]+>", " ", m.group(1))) if m else None
    compra, venta = celda("tasacambio-compraUS"), celda("tasacambio-ventaUS")
    if compra is None and venta is None:
        raise RuntimeError("no se encontraron las tasas en la página")
    return {"nombre": "Banreservas", "tipo": "banco", "compra": compra, "venta": venta, "fuente": "banreservas.com"}

def popular():
    url = "https://popularenlinea.com/_api/web/lists/getbytitle('Rates')/items?$filter=ItemID%20eq%20%271%27"
    d = json.loads(bajar(url, {"Accept": "application/json;odata=nometadata"}))["value"][0]
    compra, venta = numero(str(d.get("DollarBuyRate"))), numero(str(d.get("DollarSellRate")))
    if compra is None and venta is None:
        raise RuntimeError("sin tasas")
    return {"nombre": "Banco Popular", "tipo": "banco", "compra": compra, "venta": venta, "fuente": "popularenlinea.com"}

def main():
    try:
        viejo = json.load(open("bancos.json", encoding="utf-8"))
    except Exception:
        viejo = {"entidades": []}
    antes = {e["nombre"]: e for e in viejo.get("entidades", [])}
    ahora = datetime.now(timezone.utc).isoformat(timespec="seconds")
    salida, errores = [], []
    for leer in (banreservas, popular):
        try:
            e = leer()
            previo = antes.get(e["nombre"])
            # la fecha solo cambia cuando el banco cambia la tasa (así no se sube la web cada 2 horas)
            if previo and previo.get("compra") == e["compra"] and previo.get("venta") == e["venta"]:
                e["desde"] = previo.get("desde", ahora)
            else:
                e["desde"] = ahora
            salida.append(e)
            print(f"{e['nombre']}: compra {e['compra']} · venta {e['venta']}")
        except Exception as err:
            errores.append(f"{leer.__name__}: {err}")
            print(f"ERROR {leer.__name__}: {err}")
            if leer.__name__ == "banreservas" and "Banreservas" in antes:
                salida.append(antes["Banreservas"])  # se queda la última tasa buena
            if leer.__name__ == "popular" and "Banco Popular" in antes:
                salida.append(antes["Banco Popular"])
    json.dump({"entidades": salida, "errores": errores}, open("bancos.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    if not salida:
        raise SystemExit("No se pudo leer ningún banco")

if __name__ == "__main__":
    main()
