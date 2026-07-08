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

 console.log("Leyendo PARTES");

const partesSnapshot =
  await getDocs(collection(db, "partes"));

console.log("✅ PARTES OK");


console.log("Leyendo TRASLADOS");

const trasladosSnapshot =
  await getDocs(collection(db, "traslados"));

console.log("✅ TRASLADOS OK");


console.log("Leyendo ESTADOS");

const estadosSnapshot =
  await getDocs(
    collection(db, "estadoOperacional")
  );

console.log("✅ ESTADOS OK");


console.log("Leyendo EMERGENCIAS");

const emergenciasSnapshot =
  await getDocs(
    collection(
      db,
      "emergenciasActivas"
    )
  );

console.log("✅ EMERGENCIAS OK");
``

    let partes = [];
    let traslados = [];
    let estadosOperacionales = [];
    let emergenciasActivas = [];

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

    emergenciasSnapshot.forEach(doc => {

  emergenciasActivas.push({
    id: doc.id,
    ...doc.data()
  });

});

    console.log("PARTES:", partes);
    console.log("TRASLADOS:", traslados);

    console.log(
  "EMERGENCIAS ACTIVAS:",
  emergenciasActivas
);

actualizarPantalla(
  partes,
  traslados,
  estadosOperacionales,
  emergenciasActivas
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
  estadosOperacionales,
  emergenciasActivas
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

const estadosActivos = [
  "6-T",
  "6-3",
  "6-7",
  "6-15"
];

const emergenciasActivasKPI = [];

estadosOperacionales.forEach(e => {

  if (
    estadosActivos.includes(e.estado)
  ) {

    const clave =
      (e.tipoEmergencia || "") +
      "|" +
      (e.ubicacion || "");

    if (
      !emergenciasActivasKPI.includes(
        clave
      )
    ) {

      emergenciasActivasKPI.push(
        clave
      );

    }

  }

});

const activas =
  emergenciasActivasKPI.length;

const listado =
  document.getElementById(
    "listadoEmergenciasActivas"
  );

if (listado) {

  const emergenciasUnicas = [];

  estadosOperacionales.forEach(e => {

  console.log("EMERGENCIA:", e);

    if (
      ["6-T","6-3","6-7","6-15"]
      .includes(e.estado)
    ) {

      const clave =
  (e.tipoEmergencia || "") +
  "|" +
  (e.ubicacion || "");

      const existe =
        emergenciasUnicas.find(
          x => x.clave === clave
        );

      if (!existe) {

   emergenciasUnicas.push({

  clave,

  tipo:
    e.tipoEmergencia || "Emergencia",

  ubicacion:
    e.ubicacion || "Sin ubicación",

  notas:
    e.notas || "",

  unidades:
    e.unidadesDespachadas || []

});

      }

    }

  });

  if (
    emergenciasUnicas.length === 0
  ) {

    listado.innerHTML =
      "✅ Sin emergencias activas";

  }

  else {

listado.innerHTML =
  emergenciasUnicas.map(e => `

    <div class="cardEmergenciaActiva">

      <div class="tituloEmergencia">
        🚨 ${e.tipo}
      </div>

      <div>
        📍 ${e.ubicacion}
      </div>

     <div class="unidadesUltima">

  ${
    e.unidades.length

      ? e.unidades.map(u => {

          if (u.startsWith("S")) {

            return `
              <span class="tagAmbulancia">
                🚑 ${u}
              </span>
            `;

          }

          return `
            <span class="tagBrigada">
              🚒 ${u}
            </span>
          `;

        }).join("")

      : "Sin unidad"

  }

</div>

      <div>
        📝 ${
          e.notas
            ? e.notas
            : "Sin observaciones"
        }
      </div>

    </div>

  `).join("");

  }

}
  

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

    console.log(
  "ULTIMA PARTE:",
  ultima
);

document.getElementById(
  "ultimaEmergencia"
).innerHTML = `

  <div class="cardUltimaEmergencia">

    <div class="tituloUltima">
      🚒 ${ultima.tipo || "-"}
    </div>

    <div>
      📍 ${ultima.lugar || "-"}
    </div>

<div class="unidadesUltima">

  ${
    ultima.vehiculo
      ? `
      <span class="tagBrigadaHistorica">
  🚒 ${ultima.vehiculo}
</span>
      `
      : ""
  }

  ${
    ultima.ambulancia &&
    ultima.ambulancia !== "No asiste"
      ? `
        <span class="tagAmbulanciaHistorica">
  🚑 ${ultima.ambulancia}
</span>
      `
      : ""
  }

</div>

    <div>
      ⏱️ ${ultima.horaActivacion || "--"}
      ${ultima.horaCierre
        ? " - " + ultima.horaCierre
        : ""
      }
    </div>

    <div>
      📅 ${ultima.fecha || "-"}
    </div>

    <div class="notaUltima">
      📝 ${ultima.descripcion || ""}
    </div>

  </div>

`;

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
    (
      ultima.horaCierre ||
      ultima.horaActivacion ||
      "00:00"
    )
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
      ${brigada} 🟢 Disponible<br>
    `;

    return;

  }

  switch (estadoActual.estado) {

    case "6-T":
      htmlBrigadas += `${brigada} 🟠 En Trayecto<br>`;
      break;

    case "6-3":
      htmlBrigadas += `${brigada} 🔴 En el Lugar<br>`;
      break;

    case "6-7":
      htmlBrigadas += `${brigada} 🟡 Situación Controlada<br>`;
      break;

    case "6-15":
      htmlBrigadas += `${brigada} 🏥 Centro Asistencial<br>`;
      break;

    case "6-9":
      htmlBrigadas += `${brigada} 🔵 Se Retira<br>`;
      break;

    case "6-13":
      htmlBrigadas += `${brigada} 🟣 Otros Trámites<br>`;
      break;

    default:
      htmlBrigadas += `${brigada} 🟢 Disponible<br>`;
      break;

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
      ${unidad} 🟢 Disponible<br>
    `;

    return;

  }

  switch (estadoActual.estado) {

    case "6-T":
      htmlAmbulancias += `${unidad} 🟠 En Trayecto<br>`;
      break;

    case "6-3":
      htmlAmbulancias += `${unidad} 🔴 En el Lugar<br>`;
      break;

    case "6-7":
      htmlAmbulancias += `${unidad} 🟡 Situación Controlada<br>`;
      break;

    case "6-15":
      htmlAmbulancias += `${unidad} 🏥 Centro Asistencial<br>`;
      break;

    case "6-9":
      htmlAmbulancias += `${unidad} 🔵 Se Retira<br>`;
      break;

    case "6-13":
      htmlAmbulancias += `${unidad} 🟣 Otros Trámites<br>`;
      break;

    default:
      htmlAmbulancias += `${unidad} 🟢 Disponible<br>`;
      break;

  }

});

document.getElementById(
  "ambulancias"
).innerHTML = htmlAmbulancias;

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
