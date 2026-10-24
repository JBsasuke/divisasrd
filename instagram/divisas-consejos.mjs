// =====================================================================
//  Divisas RD - Consejos de la tarde para Instagram (@divisas_rd)
//  Cada lista se usa en orden aleatorio sin repetir hasta agotarla.
//  Para agregar más, copia una línea, cámbiale el id y el texto. ¡Así de fácil!
//  (Sin emojis dentro de "titulo" ni "texto": en la imagen no se ven bien.)
//  Qué toca cada día (hora de RD, 3:00 p. m.):
//    domingo frase · lunes cambio · martes remesas · miércoles ahorro
//    jueves dólares · viernes frase · sábado remesas
// =====================================================================

export const POR_DIA = ["frase", "cambio", "remesas", "ahorro", "dolares", "frase", "remesas"]; // domingo = 0

export const ETIQUETAS = {
  cambio: "CONSEJO PARA CAMBIAR",
  remesas: "TRUCO DE REMESAS",
  ahorro: "CONSEJO DE AHORRO",
  dolares: "DÓLARES Y COMPRAS",
  frase: "FRASE DEL DÍA",
};

// ---------- Para cambiar dólares ----------
export const CAMBIO = [
  { id: "cb01", titulo: "Compara antes de cambiar", texto: "Entre el que más paga y el que menos puede haber uno o dos pesos por dólar. Con 500 dólares, eso es una compra del colmado." },
  { id: "cb02", titulo: "Compra y venta no son lo mismo", texto: "La compra es lo que te dan por tu dólar. La venta es lo que te cobran si tú quieres dólares. Mira siempre la que te toca." },
  { id: "cb03", titulo: "Cambia en sitios autorizados", texto: "Bancos, asociaciones y agentes de cambio autorizados por el Banco Central. En la calle te pueden dar billetes falsos o una tasa peor." },
  { id: "cb04", titulo: "Pide el recibo siempre", texto: "Un recibo con la tasa y el monto te protege si hay un error. Revísalo antes de irte de la ventanilla." },
  { id: "cb05", titulo: "Cuenta el dinero en la ventanilla", texto: "Cuenta los pesos delante del cajero, sin apuro. Después de que te vas, un reclamo es mucho más difícil." },
  { id: "cb06", titulo: "Billetes en buen estado", texto: "Algunos sitios no aceptan dólares rotos, manchados o muy viejos, o te pagan menos por ellos. Cuídalos como si fueran tuyos... porque lo son." },
  { id: "cb07", titulo: "No cambies todo de un golpe", texto: "Si no necesitas todos los pesos hoy, puedes cambiar una parte y guardar el resto en una cuenta en dólares." },
  { id: "cb08", titulo: "La tasa de mercado es la guía", texto: "La tasa de mercado es una referencia. Los bancos y las casas de cambio compran un poco por debajo y venden un poco por encima." },
  { id: "cb09", titulo: "Ojo con las tasas muy buenas", texto: "Si alguien te ofrece mucho más que todos los demás, desconfía. Lo que parece regalo a veces sale caro." },
  { id: "cb10", titulo: "Mira la tasa el mismo día", texto: "La tasa cambia de un día a otro. Revísala en divisasrd.com antes de salir para no llevarte sorpresas." },
  { id: "cb11", titulo: "Cuenta en dólares en tu banco", texto: "Si recibes dólares seguido, una cuenta en dólares te deja guardarlos y cambiarlos cuando te convenga." },
  { id: "cb12", titulo: "Cambiar en el aeropuerto sale caro", texto: "Las casas de cambio del aeropuerto suelen pagar menos. Cambia solo lo necesario para el taxi y lo demás en la ciudad." },
  { id: "cb13", titulo: "Los centavos también cuentan", texto: "Medio peso por dólar parece poco. En mil dólares son quinientos pesos. Siempre vale la pena comparar." },
  { id: "cb14", titulo: "Pregunta si hay comisión", texto: "Algunos sitios cobran un cargo aparte del cambio. Pregunta cuánto te llega en la mano al final, no solo la tasa." },
];

// ---------- Remesas ----------
export const REMESAS = [
  { id: "rm01", titulo: "Compara remesadoras", texto: "Cada remesadora tiene su tasa y su comisión. Lo que importa es cuántos pesos llegan al final, no solo lo barato del envío." },
  { id: "rm02", titulo: "Mandar más de una vez sale caro", texto: "Cada envío paga su comisión. Si se puede, es mejor mandar una vez al mes que cuatro envíos pequeños." },
  { id: "rm03", titulo: "Depósito a cuenta o en efectivo", texto: "Muchas remesadoras dan una tasa distinta si se deposita en una cuenta o si se retira en efectivo. Pregunta las dos." },
  { id: "rm04", titulo: "Recibir en dólares o en pesos", texto: "En RD muchas remesas se pueden cobrar en pesos o en dólares. Si las cobras en dólares, puedes buscar tú la mejor tasa para cambiarlos." },
  { id: "rm05", titulo: "Guarda el número de envío", texto: "El código o número de envío es lo que te piden para cobrar. Guárdalo y no se lo des a nadie que no sea la persona que va a cobrar." },
  { id: "rm06", titulo: "Lleva tu cédula vigente", texto: "Para cobrar una remesa te piden la cédula o el pasaporte. Si está vencida te pueden poner problemas." },
  { id: "rm07", titulo: "Cuidado con las estafas", texto: "Nadie que te quiera ayudar te va a pedir que le mandes dinero para recibir un premio o un préstamo. Si suena raro, es raro." },
  { id: "rm08", titulo: "El nombre tiene que estar igualito", texto: "El nombre de quien cobra debe ser el mismo de la cédula. Una letra mal escrita puede atrasar el cobro." },
  { id: "rm09", titulo: "Mira la tasa del día del envío", texto: "La tasa que cuenta es la del momento en que se manda. Si allá revisan antes de mandar, aquí llegan más pesos." },
  { id: "rm10", titulo: "Las apps también cuentan", texto: "Algunas remesadoras dan mejor precio si el envío se hace desde su app o su página. Vale la pena comparar." },
  { id: "rm11", titulo: "Pregunta el total que llega", texto: "Antes de mandar, pide el número final en pesos. Es la forma más fácil de comparar una remesadora con otra." },
  { id: "rm12", titulo: "Ten un plan para la remesa", texto: "Antes de cobrarla, decide qué parte va para gastos, qué parte para deudas y qué parte para ahorrar. Así rinde más." },
];

// ---------- Ahorro ----------
export const AHORRO = [
  { id: "ah01", titulo: "Págate a ti primero", texto: "Cuando cobres, aparta algo para el ahorro antes de gastar. Aunque sea poquito, lo importante es la costumbre." },
  { id: "ah02", titulo: "Anota en qué se va el dinero", texto: "Una semana anotando cada gasto te enseña dónde se escapan los cheles. Lo que se mide, se puede bajar." },
  { id: "ah03", titulo: "Un fondo para emergencias", texto: "Tener guardado lo de uno a tres meses de gastos te salva cuando se daña la nevera o se para el trabajo." },
  { id: "ah04", titulo: "Las tarjetas no son dinero extra", texto: "Lo que pasas con la tarjeta hay que pagarlo. Si solo pagas el mínimo, los intereses se comen tu sueldo." },
  { id: "ah05", titulo: "Compara antes de comprar", texto: "El mismo producto puede costar distinto en dos tiendas de la misma calle. Dos minutos mirando ahorran mucho." },
  { id: "ah06", titulo: "Cuidado con los préstamos rápidos", texto: "Lo que es fácil de sacar a veces es caro de pagar. Pregunta siempre cuánto vas a devolver en total." },
  { id: "ah07", titulo: "El san también es ahorro", texto: "Un san con gente de confianza obliga a guardar cada semana. Escoge bien con quién lo haces." },
  { id: "ah08", titulo: "Compra al por mayor lo que siempre usas", texto: "Arroz, aceite y productos de limpieza suelen salir más baratos en cantidad. Solo si de verdad los vas a usar." },
  { id: "ah09", titulo: "Los gastos hormiga", texto: "Un refresco aquí, una picadera allá. Lo pequeño de cada día, sumado en un mes, es mucho dinero." },
  { id: "ah10", titulo: "Pon una meta con fecha", texto: "Ahorrar para algo concreto, como la inscripción del colegio o un viaje, hace más fácil no tocar ese dinero." },
  { id: "ah11", titulo: "Revisa tus suscripciones", texto: "Plataformas, apps y planes que ya no usas siguen cobrando cada mes. Cancela lo que no te hace falta." },
  { id: "ah12", titulo: "Ahorra lo que te sobró", texto: "Si te sobró algo a fin de mes, no lo gastes por gastarlo. Pásalo al ahorro y empieza el mes con ventaja." },
];

// ---------- Dólares, viajes y compras en línea ----------
export const DOLARES = [
  { id: "dl01", titulo: "Compras en línea en dólares", texto: "Cuando compras en una tienda de afuera, el banco cambia los pesos a dólares con su tasa. Mira cuánto te cobraron en el estado de cuenta." },
  { id: "dl02", titulo: "El envío también se paga", texto: "Lo barato de una compra afuera puede salir caro con el envío, el courier y los impuestos. Suma todo antes de comprar." },
  { id: "dl03", titulo: "Viajando, paga en la moneda local", texto: "Si el datáfono te pregunta si pagas en pesos o en la moneda del país, escoge la del país. Así no te cambian con una tasa peor." },
  { id: "dl04", titulo: "Avisa a tu banco antes de viajar", texto: "Algunos bancos bloquean la tarjeta si ven compras afuera sin aviso. Una llamada antes del viaje te evita el mal rato." },
  { id: "dl05", titulo: "Lleva un poco de efectivo", texto: "Para el viaje, lleva algo de efectivo por si una tarjeta falla, pero no todo. Lo demás, mejor en la tarjeta." },
  { id: "dl06", titulo: "Las tarjetas cobran por compras afuera", texto: "Muchas tarjetas cobran un porcentaje extra por cada compra en otra moneda. Pregunta a tu banco cuánto es." },
  { id: "dl07", titulo: "Mira el euro también", texto: "Si te mandan dinero de España o Italia, la tasa que te importa es la del euro. En divisasrd.com están las dos." },
  { id: "dl08", titulo: "Los precios en dólares en RD", texto: "Si algo aquí te lo venden en dólares, pregunta a qué tasa te lo cobran en pesos. A veces conviene pagar en una u otra moneda." },
  { id: "dl09", titulo: "Cuidado con las páginas falsas", texto: "Antes de pagar en una tienda en línea, revisa que la dirección sea la correcta y que la página sea segura. Si es demasiado barato, desconfía." },
  { id: "dl10", titulo: "Guarda los comprobantes", texto: "De cada compra afuera, guarda el correo de confirmación. Si no llega o llega dañado, lo vas a necesitar para reclamar." },
];

// ---------- Frases con humor ----------
export const FRASES = [
  { id: "fr01", texto: "Ahorrar es fácil. Lo difícil es que el dinero llegue hasta el día de ahorrar." },
  { id: "fr02", texto: "Mi sueldo y yo tenemos una relación a distancia: él se va antes de que yo llegue." },
  { id: "fr03", texto: "Yo no gasto mucho. Lo que pasa es que todo está caro... y yo compro de todo." },
  { id: "fr04", texto: "El dólar sube y baja. Mi cuenta solo baja." },
  { id: "fr05", texto: "Quincena: ese día bonito en el que eres rico por exactamente cuatro horas." },
  { id: "fr06", texto: "Comparar la tasa antes de cambiar no es tacañería. Es inteligencia financiera con sabor dominicano." },
  { id: "fr07", texto: "La remesa llegó. Ahora llega la familia completa a preguntar cómo estás." },
  { id: "fr08", texto: "Mi plan de ahorro: guardar los pesos en un pantalón y olvidarme de cuál." },
  { id: "fr09", texto: "El dinero no da la felicidad, pero pagar la luz a tiempo da una paz bien bonita." },
  { id: "fr10", texto: "Dicen que el tiempo es oro. Por eso el lunes se siente tan caro." },
  { id: "fr11", texto: "Yo no tengo gastos hormiga. Tengo gastos elefante disfrazados de hormiga." },
  { id: "fr12", texto: "Mi cartera y la nevera a fin de mes: las dos abren y no hay nada." },
  { id: "fr13", texto: "El que compara la tasa duerme tranquilo. El que no, duerme pensando en lo que perdió." },
  { id: "fr14", texto: "Cuando dicen que el dólar bajó, mi tío de Nueva York lo siente en el alma." },
];

export const LISTAS = { cambio: CAMBIO, remesas: REMESAS, ahorro: AHORRO, dolares: DOLARES, frase: FRASES };

export const HASHTAGS = "#DivisasRD #DolarHoy #Ahorro #FinanzasPersonales #RepublicaDominicana #RD #Dominicanos";
