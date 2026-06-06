document.addEventListener("DOMContentLoaded", () => {

  let emergencia = JSON.parse(localStorage.getItem("emergenciaSeleccionada"));

  console.log("EMERGENCIA:", emergencia);

  if (emergencia) {

    // ✅ FECHA
    if (emergencia.fecha) {
      document.getElementById("fecha").value = convertirFecha(emergencia.fecha);
    }

    // ✅ HORAS
    document.getElementById("horaActivacion").value = formatearHora(emergencia.horaActivacion);
    document.getElementById("horaCierre").value = formatearHora(emergencia.horaCierre);

    // ✅ TIPO
    document.getElementById("tipo").value = emergencia.tipo || "";
    document.getElementById("subtipo").value = emergencia.subtipo || "";

    // ✅ UBICACIÓN
    document.getElementById("lugar").value = emergencia.ubicacion || "";

    // ✅ RESPUESTA

    const BRIGADAS_NOMBRE = {
  "UIR-M": "BRIGADA MINA",
  "UIR-S": "BRIGADA STP",
  "UIR-E": "BRIGADA ERMITA",
  "B1": "BRIGADA BRONCES",
  "B2": "BRIGADA TORTOLAS"
};

const MEDICOS = {
  "S1": "Pérez Caldera",
  "S2": "Tórtolas",
  "S3": "SPA 220"
};

let ambulancias = [];
let nombresMedicos = [];

let lista = Array.isArray(emergencia.unidades)
  ? emergencia.unidades
  : [emergencia.unidades];

// ✅ detectar internas
lista.forEach(u => {
  if (u.startsWith("S")) {
    ambulancias.push(u);

    if (MEDICOS[u]) {
      nombresMedicos.push(MEDICOS[u]);
    }
  }
});

// ✅ detectar externa ingresada manualmente
let externa = document.getElementById("ambulanciaExterna").value;

if (externa && externa.trim() !== "") {
  ambulancias.push(externa);
  nombresMedicos.push(externa);
}

// ✅ limpiar duplicados
ambulancias = [...new Set(ambulancias)];
nombresMedicos = [...new Set(nombresMedicos)];

let ambSelect = document.getElementById("ambulancia");
let servInput = document.getElementById("servicioMedico");

// ✅ resultado
if (ambulancias.length > 0) {
  ambSelect.value = "Si asiste";
  servInput.value = nombresMedicos.join(", ");
} else {
  ambSelect.value = "No asiste";
  servInput.value = "";
}

let brigadas = [];

// ✅ obtener solo vehículos de brigada (no S1, S2, S3)
if (emergencia.unidades) {

  let lista = Array.isArray(emergencia.unidades)
    ? emergencia.unidades
    : [emergencia.unidades];

  lista.forEach(u => {
    if (!u.startsWith("S") && BRIGADAS_NOMBRE[u]) {
      brigadas.push(BRIGADAS_NOMBRE[u]);
    }
  });
}

// ✅ mostrar nombre real
document.getElementById("brigada").value = brigadas.join(", ");

let vehiculos = [];

// ✅ usar directamente las unidades despachadas
if (emergencia.unidades) {

  if (Array.isArray(emergencia.unidades)) {
    vehiculos = emergencia.unidades;
  } else {
    vehiculos = [emergencia.unidades];
  }
}

// ✅ mostrar TODAS las unidades
document.getElementById("vehiculo").value = vehiculos.join(", ");    

  // ✅ cargar ambulancia desde emergencia
if (emergencia.ambulancia) {
  let ambSelect = document.getElementById("ambulancia");
  ambSelect.value = emergencia.ambulancia;
  ambSelect.dispatchEvent(new Event("change"));
  }
}

  // ==========================
  // 🧠 FUNCIONALIDAD FORMULARIO
  // ==========================

  document.getElementById("formParte").onsubmit = (e) => {
    e.preventDefault();

    let parte = {

      fecha: document.getElementById("fecha").value,
      horaActivacion: document.getElementById("horaActivacion").value,
      horaCierre: document.getElementById("horaCierre").value,

      tipo: document.getElementById("tipo").value,
      subtipo: document.getElementById("subtipo").value,
      descripcion: document.getElementById("descripcion").value,

      lugar: document.getElementById("lugar").value,
      comuna: document.getElementById("comuna").value,
      faena: document.getElementById("faena").value,

      empresa: document.getElementById("empresa").value,
      impacto: document.getElementById("impacto").value,

      brigada: document.getElementById("brigada").value,
      vehiculo: document.getElementById("vehiculo").value,
      ambulancia: document.getElementById("ambulancia").value,

      servicioMedico: document.getElementById("servicioMedico").value,
      ambulanciaExterna: document.getElementById("ambulanciaExterna").value,
      clave: document.getElementById("clave").value,
      existeAtencion: document.getElementById("existeAtencion").value,

      pacientes: document.getElementById("pacientes").value,
      tipoAtencion: document.getElementById("tipoAtencion").value,

      pue: document.getElementById("pue").value,
      descripcionPue: document.getElementById("descPue").value,

      operador: document.getElementById("operador").value
    };

    let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];
    partes.push(parte);

    let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];

    historial.forEach(e => {
      if (e.id === emergencia.id) e.cerrada = true;
    });

    localStorage.setItem("historialEmergencias", JSON.stringify(historial));
    localStorage.setItem("partesEmergencia", JSON.stringify(partes));

    alert("✅ Parte guardado");
    window.close();
  };

  // ==========================
  // 🚑 AMBULANCIA DINÁMICA
  // ==========================

  let amb = document.getElementById("ambulancia");
  let serv = document.getElementById("servicioMedico");
  let otro = document.getElementById("otroServicio");

amb.onchange = () => {

  let val = amb.value;

  if (!val || val === "No asiste") {
    serv.value = "";
    serv.style.display = "none";
    otro.style.display = "none";
    return;
  }

  // ✅ mostrar servicio médico
  serv.style.display = "block";

  // ✅ autocompletar nombre
  if (MEDICOS[val]) {
    serv.value = MEDICOS[val];
  }
};

  serv.onchange = () => {
    if (serv.value === "Otro") {
      otro.style.display = "block";
    } else {
      otro.style.display = "none";
    }
  };

  // ==========================
  // 🔑 CLAVES
  // ==========================

 const claves = {

  "ALFA 1": "PARO CARDIO RESPIRATORIO",
  "ALFA 2": "OBSTRUCCIÓN DE LA VÍA AEREA",
  "ALFA 2 A": "VÍA AÉREA LIBERADA",
  "ALFA 2 B": "VÍA AÉREA NO LIBERADA",
  "ALFA 3": "POLITRAUMATIZADO SEVERO",
  "ALFA 4": "POLITRAUMATIZADO LEVE",
  "ALFA 5": "SHOCK ANAFILÁCTICO",
  "ALFA 6": "SHOCK HIPOVOLÉMICO",
  "ALFA 6 A": "HEMORRAGIA EXANGUINANTE",
  "ALFA 6 B": "HEMORRAGIA CONTENIDA",
  "ALFA 7": "TRAUMATISMO CRÁNEO Y CARA",
  "ALFA 7 A": "TEC",
  "ALFA 7 B": "TRAUMATISMO OCULAR",
  "ALFA 7 C": "TRAUMATISMO MANDIBULAR",
  "ALFA 7 D": "TRAUMATISMO NASAL",
  "ALFA 8": "AFECCIONES ESPINALES",
  "ALFA 8 A": "TRAUMATISMO CERVICAL",
  "ALFA 8 B": "TRAUMATISMO DORSAL",
  "ALFA 8 C": "TRAUMATISMO LUMBAR",
  "ALFA 8 D": "MORBILIDAD ESPINAL",
  "ALFA 9": "AFECCIONES TORÁCICAS",
  "ALFA 9 A": "TÓRAX ABIERTO",
  "ALFA 9 B": "TÓRAX CERRADO",
  "ALFA 9 C": "INFARTO / ARRITMIA",
  "ALFA 9 D": "MORBILIDAD CARDIACA",
  "ALFA 9 E": "MORBILIDAD PULMONAR",
  "ALFA 10": "MIEMBROS SUPERIORES",
  "ALFA 10 A": "FRACTURA EXTREMIDAD SUPERIOR",
  "ALFA 10 B": "ATRAPAMIENTO",
  "ALFA 10 C": "LESIÓN EXTREMIDAD SUPERIOR",
  "ALFA 11": "AFECCIONES ABDOMINALES",
  "ALFA 11 A": "ABD. ABIERTO",
  "ALFA 11 B": "ABD. CERRADO",
  "ALFA 11 C": "MORBILIDAD ABDOMINAL",
  "ALFA 12": "TRAUMATISMO PÉLVICO",
  "ALFA 12 A": "PÉLVICO ABIERTO",
  "ALFA 12 B": "PÉLVICO CERRADO",
  "ALFA 12 C": "LESIONES GENITALES",
  "ALFA 12 D": "MORBILIDAD GINECOLÓGICA",
  "ALFA 13": "MIEMBROS INFERIORES",
  "ALFA 13 A": "FRACTURA EXTREMIDAD INFERIOR",
  "ALFA 13 B": "ATRAPAMIENTO",
  "ALFA 13 C": "LESIÓN EXTREMIDAD INFERIOR",
  "ALFA 14": "QUEMADURAS",
  "ALFA 15": "ALTERACIÓN NEUROLÓGICA",
  "ALFA 15 A": "LIPOTIMIA",
  "ALFA 15 B": "DESMAYO",
  "ALFA 15 C": "CONVULSIONES",
  "ALFA 15 D": "ACV",
  "ALFA 15 E": "MORBILIDAD NEUROLÓGICA",
  "ALFA 16": "SALUD MENTAL",
  "ALFA 16 A": "CRISIS DE PÁNICO",
  "ALFA 16 B": "IDEACIÓN SUICIDA",
  "ALFA 17": "MAL DE MONTAÑA",
  "ALFA 18": "FALLECIMIENTO",
  "N/A": "NO APLICA",
  "OTRO": "OTRO CASO"
};

  let claveSelect = document.getElementById("clave");
  let tipoAtencion = document.getElementById("tipoAtencion");

  Object.keys(claves).forEach(c => {
    let opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    claveSelect.appendChild(opt);
  });

  // 🔥 activar automáticamente
claveSelect.dispatchEvent(new Event("change"));

  claveSelect.addEventListener("change", () => {
  let valor = claveSelect.value;
  tipoAtencion.value = claves[valor] || "";
});

// ✅ activar automático al cargar
claveSelect.dispatchEvent(new Event("change"));

  tipoAtencion.oninput = () => {
    let match = Object.entries(claves).find(
      ([k, v]) => v.toLowerCase().includes(tipoAtencion.value.toLowerCase())
    );

    if (match) claveSelect.value = match[0];
  };

  // ==========================
  // ⚠️ PUE
  // ==========================

  const PUE = {
  "PUE 1": "Accidente, colisión, choque o desbarrancamiento de equipo minero",
  "PUE 2": "Derrame o contaminación a cursos de agua cercanos",
  "PUE 3": "Colapso del botadero San Francisco",
  "PUE 4": "Pérdida de contención de H2S",
  "PUE 5": "Pérdida de contención STP, STR, SAR",
  "PUE 7": "Falla en muro Tranque Pérez Caldera",
  "PUE 8": "Falla en muro Tranque Las Tórtolas",
  "PUE 9": "Colapso geomecánico de bancos",
  "PUE 10": "Incendio Planta San Francisco",
  "PUE 11": "Riesgos naturales con afectación",
  "PUE 12": "Caída de persona desde altura",
  "PUE 13": "Colapso estructural",
  "PUE 14": "Falla Molino SAG",
  "PUE 15": "Paralización por conflictos",
  "PUE 16": "Incendio sistema Overland",
  "PUE 17": "Incendio en vehículos",
  "PUE 18": "Caída de rocas en mina",
  "PUE 19": "Choque vehículo liviano",
  "PUE 20": "Choque vehículo pesado",
  "PUE 21": "Interacción no controlada persona - equipo fijo",
  "PUE 22": "Incendio instalaciones/campamento",
  "PUE 24": "Interacción persona-equipo móvil",
  "PUE 25": "Liberación energía estanques",
  "PUE 26": "Explosión neumático equipo minero",
  "PUE 27": "Electrocución",
  "PUE 29": "Atrapamiento chancado",
  "PUE 30": "Golpes en maniobras de izaje",
  "PUE 31": "Falta de oxígeno (Espacio confinado)",
  "PUE 32": "Accidente con explosivos",
  "PUE 35": "Energía mecánica descontrolada",
  "PUE 37": "Energía hidráulica descontrolada",
  "PUE 41": "Restricción por agua",
  "PUE 43": "Golpe por barra de perforación",
  "PUE 44": "Contaminación Río Blanco",
  "PUE 45": "Infiltración napas",
  "PUE 46": "Accidente aéreo helicóptero",
  "PUE 51": "Exposición sustancias peligrosas",
  "PUE 52": "Flyrock",
  "PUE 58": "Incendio equipo minero",
  "PUE 63": "Incumplimiento ambiental",
  "PUE 66": "Pérdida de producción por agua",
  "PUE 67": "Material particulado sobre límite",
  "PUE 68": "Inmersión en líquidos",
  "N/A": "NO APLICA"
};

 let pueSelect = document.getElementById("pue");
let descPue = document.getElementById("descPue");

// llenar dropdown
Object.keys(PUE).forEach(p => {
  let opt = document.createElement("option");
  opt.value = p;
  opt.textContent = p;
  pueSelect.appendChild(opt);
});

// ✅ UN SOLO evento limpio
pueSelect.addEventListener("change", () => {
  let valor = pueSelect.value;
  console.log("PUE seleccionado:", valor);
  descPue.value = PUE[valor] || "";
});

// ✅ activar al cargar
pueSelect.dispatchEvent(new Event("change"));
  
// ==========================
// 🧠 FUNCIONES
// ==========================

function convertirFecha(fecha) {
  let partes = fecha.includes("/") ? fecha.split("/") : fecha.split("-");
  if (partes.length !== 3) return "";
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

function formatearHora(hora) {
  if (!hora) return "";

  let limpio = hora.replace("p. m.", "PM").replace("a. m.", "AM");

  let fecha = new Date("1970-01-01 " + limpio);

  if (isNaN(fecha)) return "";

  let h = fecha.getHours().toString().padStart(2, "0");
  let m = fecha.getMinutes().toString().padStart(2, "0");

  return `${h}:${m}`;
}

// ✅ cerrar todo el script
});
