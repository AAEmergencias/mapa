let emergencia = JSON.parse(localStorage.getItem("emergenciaSeleccionada"));

if (emergencia) {

  // ✅ FECHA
  if (emergencia.fecha) {
    document.getElementById("fecha").value = convertirFecha(emergencia.fecha);
  }

  // ✅ HORAS
  document.getElementById("horaActivacion").value = formatearHora(emergencia.horaActivacion);
  document.getElementById("horaCierre").value = formatearHora(emergencia.horaCierre);

  // ✅ TIPO / SUBTIPO
  document.getElementById("tipo").value = emergencia.tipo || "";
  document.getElementById("subtipo").value = emergencia.subtipo || "";

  // ✅ UBICACIÓN
  document.getElementById("lugar").value = emergencia.ubicacion || "";

  // ✅ RESPUESTA
  document.getElementById("brigada").value = emergencia.brigada || "";
  document.getElementById("vehiculo").value = emergencia.vehiculo || "";

}

function convertirFecha(fecha) {

  let partes = fecha.includes("/")
    ? fecha.split("/")
    : fecha.split("-");

  if (partes.length !== 3) return "";

  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

function formatearHora(hora) {

  if (!hora) return "";

  return hora.substring(0, 5);
}

function convertirFecha(fecha) {

  let partes = fecha.includes("/")
    ? fecha.split("/")
    : fecha.split("-");

  if (partes.length !== 3) return "";

  // formato HTML → yyyy-mm-dd
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

document.getElementById("lugar").value = emergencia.ubicacion || "";

document.getElementById("vehiculo").value = emergencia.unidades?.join(", ") || "";

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

  // ✅ NUEVOS CAMPOS
  servicioMedico: document.getElementById("servicioMedico").value,
  clave: document.getElementById("clave").value,
  existeAtencion: document.getElementById("existeAtencion").value,

  pacientes: document.getElementById("pacientes").value,
  tipoAtencion: document.getElementById("tipoAtencion").value,

  pue: document.getElementById("pue").value,
  descripcionPue: document.getElementById("descPue").value,

  operador: document.getElementById("operador").value
};

  // ✅ Guardar en localStorage
  let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

  partes.push(parte);

  // 🔐 marcar emergencia como cerrada
let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];

historial.forEach(e => {
  if (e.id === emergencia.id) {
    e.cerrada = true;
  }
});

localStorage.setItem("historialEmergencias", JSON.stringify(historial));

  localStorage.setItem("partesEmergencia", JSON.stringify(partes));

  alert("✅ Parte guardado");
document.getElementById("formParte").reset();
window.close();
};

let amb = document.getElementById("ambulancia");
let serv = document.getElementById("servicioMedico");
let otro = document.getElementById("otroServicio");

// ocultar servicio si no hay ambulancia
amb.onchange = () => {
  if (amb.value === "No asiste") {
    serv.style.display = "none";
    otro.style.display = "none";
  } else {
    serv.style.display = "block";
  }
};

// mostrar campo "otro"
serv.onchange = () => {
  if (serv.value === "Otro") {
    otro.style.display = "block";
  } else {
    otro.style.display = "none";
  }
};

const claves = {
  "ALFA 10B": "Atrapamiento",
  "ALFA 5": "Fractura",
  "BRAVO 2": "Desmayo",
  "CHARLIE 5": "Paro Cardíaco"
};

let claveSelect = document.getElementById("clave");
let tipoAtencion = document.getElementById("tipoAtencion");

// llenar dropdown
Object.keys(claves).forEach(c => {
  let opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  claveSelect.appendChild(opt);
});

// clave → tipo
claveSelect.onchange = () => {
  tipoAtencion.value = claves[claveSelect.value];
};

// texto → clave
tipoAtencion.oninput = () => {
  let match = Object.entries(claves).find(
    ([k, v]) => v.toLowerCase().includes(tipoAtencion.value.toLowerCase())
  );

  if (match) claveSelect.value = match[0];
};

const pues = {const pues "PUE 21": "Interacción no controlada persona - equipo fijo",
  "PUE 12": "Caída a distinto nivel",
  "PUE 5": "Contacto con energía"
};

let pueSelect = document.getElementById("pue");
let descPue = document.getElementById("descPue");

// llenar dropdown
Object.keys(pues).forEach(p => {
  let opt = document.createElement("option");
  opt.value = p;
  opt.textContent = p;
  pueSelect.appendChild(opt);
});

// autocompletar descripción
pueSelect.onchange = () => {
  descPue.value = pues[pueSelect.value];
};

