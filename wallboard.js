import {
  db,
  collection,
  getDocs
} from "./firebase.js";

console.log("📺 Wallboard iniciado");

// ==========================
// RELOJ
// ==========================

function actualizarReloj() {

  const ahora = new Date();

  document.getElementById("reloj").innerHTML =
    ahora.toLocaleString("es-CL");

}

// ==========================
// CARGAR DATOS
// ==========================

async function cargarDatos() {

  try {

    const partesSnapshot =
      await getDocs(collection(db, "partes"));

    const trasladosSnapshot =
      await getDocs(collection(db, "traslados"));

    const estadosSnapshot =
  await getDocs(
    collection(db, "estadoOperacional")
  );

    let partes = [];
    let traslados = [];
    let estadosOperacionales = [];

    partesSnapshot.forEach(doc => {

      partes.push({
        id: doc.id,
        ...doc.data()
      });

    });

    trasladosSnapshot.forEach(doc => {

      traslados.push({
        id: doc.id,
        ...doc.data()
      });

    });

    estadosSnapshot.forEach(doc => {

  estadosOperacionales.push(
    doc.data()
  );

});

    console.log("PARTES:", partes);
    console.log("TRASLADOS:", traslados);
    console.log(
  "ESTADOS OPERACIONALES:",
  estadosOperacionales
);

actualizarPantalla(
  partes,
  traslados,
  estadosOperacionales
);

  }
  catch (error) {

    console.error(
      "❌ Error cargando wallboard:",
      error
    );

  }

}

// ==========================
// ACTUALIZAR PANTALLA
// ==========================

function actualizarPantalla(
  partes,
  traslados,
  estadosOperacionales
) {

  // ==========================
  // ORDENAR PARTES
  // ==========================

  partes.sort((a, b) => {

    const fechaA = new Date(
      a.fecha + " " +
      (a.horaActivacion || "00:00")
    );

    const fechaB = new Date(
      b.fecha + " " +
      (b.horaActivacion || "00:00")
    );

    return fechaB - fechaA;

  });

  // ==========================
  // ORDENAR TRASLADOS
  // ==========================

  traslados.sort((a, b) => {

    const fechaA = new Date(
      (a.fecha || "") +
      " " +
      (a.hora || "00:00")
    );

    const fechaB = new Date(
      (b.fecha || "") +
      " " +
      (b.hora || "00:00")
    );

    return fechaB - fechaA;

  });

  // ==========================
  // EMERGENCIAS ACTIVAS
  // ==========================

  const activasLista =
    partes.filter(p =>
      !p.horaCierre ||
      p.horaCierre.trim() === ""
    );

  const activas =
    activasLista.length;

  // ==========================
  // KPIs
  // ==========================

  document.getElementById(
    "activas"
  ).innerText = activas;

  document.getElementById(
    "total"
  ).innerText = partes.length;

  document.getElementById(
    "traslados"
  ).innerText = traslados.length;

  document.getElementById(
    "cerrados"
  ).innerText = partes.length;

  // ==========================
  // TARJETA ACTIVA ROJA
  // ==========================

  const cardActivas =
    document
      .getElementById("activas")
      .parentElement;

  if (activas > 0) {

    cardActivas.style.border =
      "3px solid #ef4444";

    cardActivas.style.boxShadow =
      "0 0 25px rgba(239,68,68,.8)";

  }
  else {

    cardActivas.style.border =
      "1px solid #10b981";

    cardActivas.style.boxShadow =
      "none";

  }

  // ==========================
  // BANNER
  // ==========================

  const banner =
    document.getElementById(
      "bannerEmergencia"
    );

  if (banner) {

    if (activas > 0) {

      banner.innerHTML =
        "🚨 EMERGENCIA ACTIVA 🚨";

      banner.style.color =
        "#ef4444";

    }
    else {

      banner.innerHTML =
        "✅ SIN EMERGENCIAS ACTIVAS";

      banner.style.color =
        "#10b981";

    }

  }

  // ==========================
  // ÚLTIMA EMERGENCIA
  // ==========================

  if (partes.length > 0) {

    const ultima = partes[0];

    document.getElementById(
      "ultimaEmergencia"
    ).innerHTML = `

      📅 ${ultima.fecha || "-"}<br><br>

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
  // EMERGENCIAS ACTIVAS
  // ==========================

  const divActivas =
    document.getElementById(
      "emergenciasActivas"
    );

  if (divActivas) {

    if (activasLista.length === 0) {

      divActivas.innerHTML =
        "✅ Sin emergencias activas";

    }
    else {

      divActivas.innerHTML =
        activasLista.map(p => `

          🚒 ${p.tipo || "-"}<br>
          📍 ${p.lugar || "-"}<br>
          ⏱️ ${p.horaActivacion || "--"}<br><br>

        `).join("");

    }

  }

  // ==========================
  // ÚLTIMO TRASLADO
  // ==========================

  if (traslados.length > 0) {

    const ultimo =
      traslados[0];

    document.getElementById(
      "ultimoTraslado"
    ).innerHTML = `

      🚑 ${ultimo.unidad || "-"}<br><br>

      🏥 ${ultimo.lugarTraslado || "-"}<br><br>

      📍 ${ultimo.tipoTraslado || "-"}

    `;

  }
  else {

    document.getElementById(
      "ultimoTraslado"
    ).innerHTML =
      "Sin traslados";

  }

  // ==========================
  // TIEMPO SIN EMERGENCIAS
  // ==========================

  if (partes.length > 0) {

    const ultima =
      partes[0];

    const fechaUltima =
      new Date(
        ultima.fecha +
        " " +
        (ultima.horaActivacion || "00:00")
      );

    const ahora =
      new Date();

    const diff =
      ahora - fechaUltima;

    const horas =
      Math.floor(
        diff / 1000 / 60 / 60
      );

    const minutos =
      Math.floor(
        diff / 1000 / 60
      ) % 60;

    document.getElementById(
      "sinEmergencias"
    ).innerHTML = `

      ${horas} h<br>
      ${minutos} min

    `;

  }

  // ==========================
  // BRIGADAS
  // ==========================

const brigadas = [
  "B1",
  "B2",
  "UIR-M",
  "UIR-E",
  "UIR-S"
];

let htmlBrigadas = "";

brigadas.forEach(brigada => {

  const estadoActual =
    estadosOperacionales.find(
      e => e.unidad === brigada
    );

  if (!estadoActual) {

    htmlBrigadas += `
      ${brigada}
      🟢 Disponible<br>
    `;

    return;
  }

  if (
    estadoActual.estado === "6-T" ||
    estadoActual.estado === "6-3" ||
    estadoActual.estado === "6-7"
  ) {

    htmlBrigadas += `
      ${brigada}
      🔴 ${estadoActual.descripcion}
      <br>
    `;

  }

  else if (
    estadoActual.estado === "6-15"
  ) {

    htmlBrigadas += `
      ${brigada}
      🟡 Centro Asistencial
      <br>
    `;

  }

  else {

    htmlBrigadas += `
      ${brigada}
      🟢 Disponible
      <br>
    `;

  }

});

document.getElementById(
  "brigadas"
).innerHTML = htmlBrigadas;

  // ==========================
  // AMBULANCIAS
  // ==========================

const ambulancias = [
  "S1",
  "S2",
  "S3"
];

let htmlAmbulancias = "";

ambulancias.forEach(unidad => {

  const estadoActual =
    estadosOperacionales.find(
      e => e.unidad === unidad
    );

  if (!estadoActual) {

    htmlAmbulancias += `
      ${unidad}
      🟢 Disponible<br>
    `;

    return;

  }

  if (
    estadoActual.estado === "6-T" ||
    estadoActual.estado === "6-3" ||
    estadoActual.estado === "6-7"
  ) {

    htmlAmbulancias += `
      ${unidad}
      🔴 ${estadoActual.descripcion}
      <br>
    `;

  }

  else if (
    estadoActual.estado === "6-15"
  ) {

    htmlAmbulancias += `
      ${unidad}
      🟡 Centro Asistencial
      <br>
    `;

  }

  else {

    htmlAmbulancias += `
      ${unidad}
      🟢 Disponible
      <br>
    `;

  }

});

document.getElementById(
  "ambulancias"
).innerHTML =
  htmlAmbulancias;

  }

// ==========================
// INICIO
// ==========================

actualizarReloj();

cargarDatos();

setInterval(
  actualizarReloj,
  1000
);

setInterval(
  cargarDatos,
  60000
);

// refresco completo cada 10 min
setInterval(() => {

  location.reload();

}, 600000);
