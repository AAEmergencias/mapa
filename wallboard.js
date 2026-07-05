import {
  db,
  collection,
  getDocs
} from "./firebase.js";

console.log("📺 Wallboard iniciado");

async function cargarDatos() {

  try {

    const partesSnapshot =
      await getDocs(collection(db, "partes"));

    const trasladosSnapshot =
      await getDocs(collection(db, "traslados"));

    let partes = [];
    let traslados = [];

    partesSnapshot.forEach(doc => {
      partes.push(doc.data());
    });

    trasladosSnapshot.forEach(doc => {
      traslados.push(doc.data());
    });

    actualizarPantalla(partes, traslados);

  }
  catch (error) {

    console.error(
      "❌ Error cargando wallboard:",
      error
    );

  }

}

function actualizarPantalla(partes, traslados) {

  // ==========================
  // ORDENAR PARTES
  // ==========================

  partes.sort((a, b) => {

    let fechaA = new Date(
      a.fecha + " " + (a.horaActivacion || "00:00")
    );

    let fechaB = new Date(
      b.fecha + " " + (b.horaActivacion || "00:00")
    );

    return fechaB - fechaA;

  });

  // ==========================
  // KPIs
  // ==========================

  document.getElementById("total").innerText =
    partes.length;

  document.getElementById("traslados").innerText =
    traslados.length;

  document.getElementById("cerrados").innerText =
    partes.length;

  // Emergencias activas
  let activas = partes.filter(p =>
    !p.horaCierre ||
    p.horaCierre.trim() === ""
  ).length;

  document.getElementById("activas").innerText =
    activas;

  // ==========================
  // ÚLTIMA EMERGENCIA
  // ==========================

  if (partes.length > 0) {

    let ultima = partes[0];

    document.getElementById(
      "ultimaEmergencia"
    ).innerHTML = `

      📅 ${ultima.fecha || "-"}<br>

      ⏱️ ${ultima.horaActivacion || "--"}
      ${ultima.horaCierre
        ? " - " + ultima.horaCierre
        : ""}
      <br><br>

      🚒 ${ultima.tipo || "-"}<br><br>

      📍 ${ultima.lugar || "-"}<br><br>

      📝 ${ultima.descripcion || ""}
    `;

  }

  // ==========================
  // ÚLTIMO TRASLADO
  // ==========================

  if (traslados.length > 0) {

    let ultimo =
      traslados[traslados.length - 1];

    document.getElementById(
      "ultimoTraslado"
    ).innerHTML = `

      🚑 ${ultimo.unidad || "-"}<br><br>

      🏥 ${
        ultimo.lugarTraslado || "-"
      }<br><br>

      📍 ${
        ultimo.tipoTraslado || "-"
      }
    `;

  } else {

    document.getElementById(
      "ultimoTraslado"
    ).innerHTML = "Sin traslados";

  }

  // ==========================
  // TIEMPO SIN EMERGENCIAS
  // ==========================

  if (partes.length > 0) {

    let ultima = partes[0];

    let fechaUltima = new Date(
      ultima.fecha +
      " " +
      (ultima.horaActivacion || "00:00")
    );

    let ahora = new Date();

    let diffMs = ahora - fechaUltima;

    let horas =
      Math.floor(diffMs / 1000 / 60 / 60);

    let minutos =
      Math.floor(diffMs / 1000 / 60) % 60;

    document.getElementById(
      "sinEmergencias"
    ).innerHTML = `

      ${horas} h<br>
      ${minutos} min
    `;

  }

  // ==========================
  // ESTADOS BRIGADAS
  // ==========================

  document.getElementById("brigadas")
    .innerHTML = `

    B1 🟢 Disponible<br>
    B2 🟢 Disponible<br>
    UIR-M 🟢 Disponible<br>
    UIR-E 🟢 Disponible<br>
    UIR-S 🟢 Disponible

  `;

  // ==========================
  // ESTADOS AMBULANCIAS
  // ==========================

  document.getElementById("ambulancias")
    .innerHTML = `

    S1 🟢 Disponible<br>
    S2 🟢 Disponible<br>
    S3 🟢 Disponible

  `;

}

// ==========================
// AUTO REFRESH
// ==========================

cargarDatos();

setInterval(() => {

  cargarDatos();

}, 30000);
