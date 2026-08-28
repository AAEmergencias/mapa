import {
  db,
  collection,
  addDoc,
  updateDoc,
  doc
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

let parteEditar = JSON.parse(localStorage.getItem("parteEditar"));

  let parteVer = JSON.parse(
  localStorage.getItem(
    "parteVer"
  )
);

  let emergencia =
  JSON.parse(
    localStorage.getItem(
      "emergenciaSeleccionada"
    )
  );

  if (emergencia) {

  parteVer = null;

}


console.log(
  "PARTE EDITAR:",
  parteEditar
);

if (parteEditar || parteVer) {

  const datos =
    parteEditar || parteVer;

  // ✅ llenar campos básicos
  document.getElementById("fecha").value = datos.fecha || "";
  document.getElementById("horaActivacion").value = datos.horaActivacion || "";
  document.getElementById("horaCierre").value = datos.horaCierre || "";

  document.getElementById("tipo").value = datos.tipo || "";
  document.getElementById("subtipo").value = datos.subtipo || "";
  document.getElementById("descripcion").value = datos.descripcion || "";

  document.getElementById("lugar").value = datos.lugar || "";
  document.getElementById("comuna").value = datos.comuna || "";
  document.getElementById("faena").value = datos.faena || "";

  document.getElementById("empresa").value = datos.empresa || "";
  document.getElementById("impacto").value = datos.impacto || "";

  document.getElementById("brigada").value = datos.brigada || "";
  document.getElementById("vehiculo").value = datos.vehiculo || "";

  document.getElementById("ambulancia").value = datos.ambulancia || "";
  document.getElementById("servicioMedico").value = datos.servicioMedico || "";
  document.getElementById("ambulanciaExterna").value = datos.ambulanciaExterna || "";

  document.getElementById("clave").value = datos.clave || "";
  document.getElementById("tipoAtencion").value = datos.tipoAtencion || "";

  document.getElementById("pue").value = datos.pue || "";
  document.getElementById("descPue").value = datos.descripcionPue || "";

  document.getElementById("operador").value = datos.operador || "";

  if (parteVer) {

  document
    .querySelectorAll(
      "input, select, textarea"
    )
    .forEach(campo => {

      campo.disabled = true;

    });

}

}

  let emergencia = JSON.parse(localStorage.getItem("emergenciaSeleccionada"));

  const subtiposPorTipo = {

  "Incendio": [
    "Amago de incendio equipos mineros",
    "Amago de incendio en vehículos pesados",
    "Amago de incendio en vehículos livianos",
    "Amago de incendio instalaciones industriales",
    "Incendio en equipos mineros",
    "Incendio en vehículos pesado",
    "Incendio en vehículos livianos",
    "Incendio instalaciones",
    "Incendio fuera de las instalaciones",
    "Incendio Forestal",
    "Pastizales y/o Basura"
  ],

  "Vehicular": [
    "Choque equipos mineros",
    "Choque vehículos pesados",
    "Choque vehículos livianos",
    "Choque vehículos pesados fuera de las instalaciones",
    "Choque vehículos livianos fuera de las instalaciones",
    "Desbarrancamiento equipos mineros",
    "Desbarrancamiento vehículos pesados",
    "Desbarrancamiento vehículos livianos",
    "Desbarrancamiento vehículos pesados fuera de las intalaciones",
    "Desbarrancamiento vehículos livianos fuera de las instalaciones",
    "Colisión equipo minero",
    "Colisión vehículos pesados",
    "Colisión vehícculos livianos",
    "Colisión vehículos pesados fuera de las instalaciones",
    "Colisión vehículos livanos fuera de las instalaciones",
    "Volcamiento equipo minero",
    "Volcamiento vehículos pesados",
    "Volcamiento vehículos livianos",
    "Volcamiento vehículos pesados fuera de las instalaciones",
    "Volcamiento vehículos livianos fuera de las instalaciones"
  ],

  "Rescate": [
    "Caída mismo nivel",
    "Caída diferente nivel",
    "Derrumbe",
    "Atrapamiento",
    "Perdida de conciencia",
    "Encerramiento en ascensor",
    "Rescate vertical",
    "Rescate espacio confinados",
    "Atropello",
    "Caída de particulas",
    "Otros no categorizados"
  ],

  "Medico": [
    "Problemas de salud",
    "Fractura",
    "Esguince",
    "Desmayo / Inconciente",
    "Crisis de Pánico / Ansiedad",
    "PCR",
    "Corte",
    "Perdida de memoria",
    "Otros no categorizados"
  ],

  "Hazmat": [
    "Derrame de sustancias peligrosas",
    "Fuga de sustancias peligrosas",
    "Incidente con sustancias peligrosas"
  ],

  "Simulacros": [
    "Simulacro documental/Proceso/Divicional",
    "Incendio",
    "Vehícular",
    "Rescate",
    "Hazmat",
    "Sísmico",
    "Meteorológico",
    "Geológico",
    "Ambiental",
    "Médico"
  ],

  "Sísmico": [
    "Sismo leve",
    "Sismo moderado",
    "Terremoto grave"
  ],

  "Meteorologico": [
    "Tormenta eléctrica",
    "Nevadas intensas",
    "Lluvias torrenciales",
    "Ola de calor",
    "Viento blanco",
    "Aluvión",
    "Crecida de rios",
    "Inundación de instalaciones"
  ],

  "Geológico": [
    "Deslizamiento de terreno",
    "Remoción en masa",
    "Falla geotécnica",
    "Caída de rocas",
    "Inestabilidad de taludes"
  ],

  "Ambiental": [
    "Material particulado",
    "Contaminación agua",
    "Afectación flora/fauna"
  ],

  "Otros": [
    "Limpieza de rodados",
    "Activación alarma SPCI",
    "Contacto eléctrico",
    "Desperfecto mecánico Ruta G21-G245",
    "Desperfecto mecánico Ruta STP-OLB",
    "Rescate animal",
    "Olor no determinado",
    "Daño infraestructura",
    "Caída de árbol",
    "Interrupción eléctrica",
    "Otras no categorizadas"
  ]

};


const tipoSelect =
  document.getElementById("tipo");

const subtipoSelect =
  document.getElementById("subtipo");

  Object.keys(subtiposPorTipo)
.forEach(tipo => {

  let op =
    document.createElement("option");

  op.value = tipo;
  op.textContent = tipo;

  tipoSelect.appendChild(op);

});

  tipoSelect.addEventListener(
  "change",
  () => {

    subtipoSelect.innerHTML = "";

    const lista =
      subtiposPorTipo[
        tipoSelect.value
      ] || [];

    lista.forEach(sub => {

      let op =
        document.createElement("option");

      op.value = sub;
      op.textContent = sub;

      subtipoSelect.appendChild(op);

    });

  }
);

  console.log("EMERGENCIA:", emergencia);

if (!parteEditar && emergencia) {

  // ✅ FECHA
  if (emergencia.fecha) {
    document.getElementById("fecha").value = convertirFecha(emergencia.fecha);
  }

  // ✅ HORAS
  document.getElementById("horaActivacion").value = formatearHora(emergencia.horaActivacion);
  document.getElementById("horaCierre").value = formatearHora(emergencia.horaCierre);

  // ✅ TIPO
  document.getElementById("tipo").value =
  emergencia.tipo || "";

// Cargar lista de subtipos
document.getElementById("tipo")
  .dispatchEvent(
    new Event("change")
  );

document.getElementById("subtipo").value =
  emergencia.subtipo || "";
  
  // ✅ NOTAS DE LA EMERGENCIA
document.getElementById("descripcion").value =
  emergencia.notas || "";

  // ✅ UBICACIÓN
  document.getElementById("lugar").value = emergencia.ubicacion || "";

  // ✅ RESPUESTA (TODO DENTRO DEL IF)

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

  lista.forEach(u => {
    if (u.startsWith("S")) {
      ambulancias.push(u);
      if (MEDICOS[u]) nombresMedicos.push(MEDICOS[u]);
    }
  });

  ambulancias = [...new Set(ambulancias)];
  nombresMedicos = [...new Set(nombresMedicos)];

  let ambSelect = document.getElementById("ambulancia");
  let servInput = document.getElementById("servicioMedico");

  if (ambulancias.length > 0) {
    ambSelect.value = "Si asiste";
    servInput.value = nombresMedicos.join(", ");
  } else {
    ambSelect.value = "No asiste";
    servInput.value = "";
  }

  let brigadas = [];

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

  document.getElementById("brigada").value = brigadas.join(", ");

  let vehiculos = Array.isArray(emergencia.unidades)
    ? emergencia.unidades
    : [emergencia.unidades];

  document.getElementById("vehiculo").value = vehiculos.join(", ");

  if (emergencia.ambulancia) {
    let ambSelect = document.getElementById("ambulancia");
    ambSelect.value = emergencia.ambulancia;
    ambSelect.dispatchEvent(new Event("change"));
  }
}

  // ==========================
  // 🧠 FUNCIONALIDAD FORMULARIO
  // ==========================

  if (parteVer) {

  const btnGuardar =
    document.querySelector(
      'button[type="submit"]'
    );

  if (btnGuardar) {

    btnGuardar.style.display =
      "none";

  }

}
  
document.getElementById("formParte").onsubmit = async (e) => {
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

      existeTraslado:
  document.getElementById("existeTraslado").value,

tipoTraslado:
  document.getElementById("tipoTraslado").value,

centroDestino:
  document.getElementById("centroDestino").value,

empresaAfectada:
  document.getElementById("empresaAfectada").value,

nombrePaciente:
  document.getElementById("nombrePaciente").value,

edadPaciente:
  document.getElementById("edadPaciente").value,

antiguedadLaboral:
  document.getElementById("antiguedadLaboral").value,

      pue: document.getElementById("pue").value,
      descripcionPue: document.getElementById("descPue").value,

      operador: document.getElementById("operador").value
    };

    let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];
    let editando = JSON.parse(localStorage.getItem("parteEditar"));

if (editando) {

  let index = partes.findIndex(p =>
    p.fecha === editando.fecha &&
    p.horaActivacion === editando.horaActivacion
  );

  if (index !== -1) {
    partes[index] = parte;
  }

  localStorage.removeItem("parteEditar");

} else {

  partes.push(parte);

}

if (editando && editando.id) {

  await updateDoc(
    doc(
      db,
      "partes",
      editando.id
    ),
    parte
  );

  console.log(
    "✅ Parte actualizado"
  );

} else {

  await addDoc(
    collection(db, "partes"),
    parte
  );

  console.log(
    "✅ Parte nuevo creado"
  );

}

    let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];

if (!editando && emergencia) {
  historial.forEach(e => {
    if (e.id === emergencia.id) e.cerrada = true;
  });
}

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
