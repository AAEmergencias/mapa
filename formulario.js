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
    document.getElementById("brigada").value = emergencia.brigada || "";
    document.getElementById("vehiculo").value = emergencia.vehiculo || "";
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
    if (amb.value === "No asiste") {
      serv.style.display = "none";
      otro.style.display = "none";
    } else {
      serv.style.display = "block";
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
    "ALFA 10B": "Atrapamiento",
    "ALFA 5": "Fractura",
    "BRAVO 2": "Desmayo",
    "CHARLIE 5": "Paro Cardíaco"
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

  console.log("CLAVE seleccionada:", valor);

  tipoAtencion.value = claves[valor] || "";
});

  tipoAtencion.oninput = () => {
    let match = Object.entries(claves).find(
      ([k, v]) => v.toLowerCase().includes(tipoAtencion.value.toLowerCase())
    );

    if (match) claveSelect.value = match[0];
  };

  // ==========================
  // ⚠️ PUE
  // ==========================

  const pues = {
    "PUE 21": "Interacción no controlada persona - equipo fijo",
    "PUE 12": "Caída a distinto nivel",
    "PUE 5": "Contacto con energía"
  };

  let pueSelect = document.getElementById("pue");
  let descPue = document.getElementById("descPue");

  Object.keys(pues).forEach(p => {
    let opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    pueSelect.appendChild(opt);
  });

  // 🔥 activar automáticamente
pueSelect.dispatchEvent(new Event("change"));

  pueSelect.addEventListener("change", () => {

  let valor = pueSelect.value;

  console.log("PUE seleccionado:", valor);

  descPue.value = pues[valor] || "";
});

});


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
