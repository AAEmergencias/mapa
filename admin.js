import {

  db,
  auth,

  collection,
  getDocs,
  getDoc,

  doc,

  onAuthStateChanged

} from "./firebase.js";

import {
  deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("✅ admin.js funcionando");

// ==========================
// 🔐 CONTROL DE ACCESO
// ==========================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    const usuarioDoc =
      await getDoc(
        doc(
          db,
          "usuarios",
          user.email
        )
      );

    if (!usuarioDoc.exists()) {

      window.location.href =
        "index.html";

      return;

    }

    const datos =
      usuarioDoc.data();

    if (
      datos.rol !== "admin" &&
      datos.rol !== "superadmin"
    ) {

      alert(
        "⛔ No tienes permisos para acceder al Panel Administrador"
      );

      window.location.href =
        "index.html";

    }

  }
);

const pluginLabels = {
  id: 'labelsTop',
  afterDatasetsDraw(chart) {

    const { ctx } = chart;

    chart.data.datasets.forEach((dataset, i) => {

      const meta = chart.getDatasetMeta(i);

      meta.data.forEach((bar, index) => {

        const value = dataset.data[index];

        ctx.fillStyle = "#1e3a8a";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";

        // ✅ vertical
       if (chart.config.type === "bar" && chart.options.indexAxis !== "y") {

  // ✅ centro vertical de la barra
  let centroY = (bar.y + bar.base) / 2;

  ctx.fillStyle = "#ffffff"; // blanco para que se vea
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(value, bar.x, centroY);
}

        // ✅ horizontal
      if (chart.options.indexAxis === "y") {

  let centroX = (bar.x + bar.base) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(value, centroX, bar.y);
}

      });
    });
  }
};

Chart.register(pluginLabels);

const COLORES = [
  "#3b82f6", // azul
  "#ef4444", // rojo
  "#10b981", // verde
  "#f59e0b", // amarillo
  "#8b5cf6", // morado
  "#06b6d4", // celeste
  "#22c55e", // verde claro
  "#e11d48", // rojo fuerte
  "#f97316", // naranja
  "#6366f1"  // índigo
];

const MESES = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre"
};

const ORDEN_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

// ==========================
// 📦 DATOS
// ==========================
let partes = [];
let vistaActual = "general";

async function cargarPartes() {

  partes = [];

  const querySnapshot = await getDocs(collection(db, "partes"));

querySnapshot.forEach((docSnap) => {

  partes.push({

    id: docSnap.id,

    ...docSnap.data()

  });

});

// ✅ ORDENAR POR FECHA + HORA (ÚLTIMA ARRIBA)
partes.sort((a, b) => {

  let fechaA = new Date(a.fecha + " " + (a.horaActivacion || "00:00"));
  let fechaB = new Date(b.fecha + " " + (b.horaActivacion || "00:00"));

  return fechaB - fechaA; // 🔥 más reciente primero
});
  
actualizarTodo();
}


// ==========================
// ✅ FILTRO REAL (IMPORTANTE)
// ==========================
const BRIGADAS_VALIDAS = ["B1", "UIR-M", "UIR-E", "B2", "UIR-S"];

function esReal(p) {
  return p.brigada && p.ambulancia === "Si asiste";
}

let partesReales = partes.filter(esReal);

// ✅ FILTRO SOLO BRIGADAS REALES
let soloBrigada = partesReales.filter(p =>
  BRIGADAS_VALIDAS.includes(p.brigada)
);

console.log("📋 Partes:", partes);

// ==========================
// 📊 KPIs
// ==========================
let totalGeneral = partes.filter(p =>
  p.brigada || p.servicioMedico
);

document.getElementById("total").innerText = totalGeneral.length;
let emergenciasCompletas = partes.filter(p =>
  p.brigada && p.servicioMedico
);

document.getElementById("totalCompletas").innerText = emergenciasCompletas.length;

document.getElementById("totalPartes").innerText = partes.length;

// ==========================
// 🎛 FILTROS
// ==========================
let mesFiltro = document.getElementById("filtroMes").value;
let anioFiltro = document.getElementById("filtroAnio").value;

// ==========================
// 📊 GENERAR DATOS
// ==========================
function contar(data, campo) {
  let res = {};
  data.forEach(p => {
    if (!p[campo]) return;
    res[p[campo]] = (res[p[campo]] || 0) + 1;
  });
  return res;
}

function calcularHorarios(data) {

  let resultado = {

    madrugada: 0,

    manana: 0,

    tarde: 0,

    noche: 0

  };

  data.forEach(p => {

    if (!p.horaActivacion)
      return;

    const hora =
      parseInt(
        p.horaActivacion.split(":")[0]
      );

    if (hora >= 0 && hora <= 5) {

      resultado.madrugada++;

    }
    else if (hora >= 6 && hora <= 11) {

      resultado.manana++;

    }
    else if (hora >= 12 && hora <= 17) {

      resultado.tarde++;

    }
    else {

      resultado.noche++;

    }

  });

  return resultado;

}

function actualizarResumenes(data) {

  const horarios =
    calcularHorarios(data);

  const horarioTop =
  Object.entries(horarios)
    .sort((a,b) => b[1] - a[1])[0];

  const ICONOS_HORARIO = {

  madrugada: "🌙",

  manana: "☀️",

  tarde: "🌤️",

  noche: "🌃"

};

const NOMBRES_HORARIO = {

  madrugada: "Madrugada",

  manana: "Mañana",

  tarde: "Tarde",

  noche: "Noche"

};

  const porTipo =
    contar(data, "tipo");

  // ==========================
  // HORARIOS
  // ==========================

  const divHorarios =
    document.getElementById(
      "resumenHorarios"
    );

  if (divHorarios) {

    divHorarios.innerHTML = `

    <div class="itemResumenTop">

  <span>

    ⏰ Horario más frecuente

  </span>

  <b>

    ${
      ICONOS_HORARIO[
        horarioTop[0]
      ]
    }

    ${
      NOMBRES_HORARIO[
        horarioTop[0]
      ]
    }

    (${horarioTop[1]})

  </b>

</div>

      <div class="itemResumen">

        <span>
          🌙 Madrugada
          <small>
            00:00 - 05:59
          </small>
        </span>

        <b>${horarios.madrugada}</b>

      </div>

      <div class="itemResumen">

        <span>
          ☀️ Mañana
          <small>
            06:00 - 11:59
          </small>
        </span>

        <b>${horarios.manana}</b>

      </div>

      <div class="itemResumen">

        <span>
          🌤️ Tarde
          <small>
            12:00 - 17:59
          </small>
        </span>

        <b>${horarios.tarde}</b>

      </div>

      <div class="itemResumen">

        <span>
          🌃 Noche
          <small>
            18:00 - 23:59
          </small>
        </span>

        <b>${horarios.noche}</b>

      </div>

    `;

  }

  // ==========================
  // TIPOS
  // ==========================

  const ICONOS_TIPO = {

    "Incendio": "🔥",
    "Vehicular": "🚗",
    "Rescate": "🧗",
    "Medico": "🏥",
    "Hazmat": "☣️",
    "Simulacros": "🎯",
    "Sísmico": "🌎",
    "Meteorologico": "🌧️",
    "Geológico": "⛰️",
    "Ambiental": "🌱",
    "Otros": "📦"

  };

      const tipoTop =
  Object.entries(porTipo)
    .sort((a,b) => b[1] - a[1])[0];

  const divTipos =
    document.getElementById(
      "resumenTipos"
    );

  if (divTipos) {

let htmlTipos = `

<div class="itemResumenTop">

  <span>

    🏆 Tipo más frecuente

  </span>

  <b>

    ${
      ICONOS_TIPO[
        tipoTop[0]
      ] || "🚨"
    }

    ${tipoTop[0]}

    (${tipoTop[1]})

  </b>

</div>

`;

    Object.entries(porTipo)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tipo, cantidad]) => {

        htmlTipos += `

        <div class="itemResumen">

          <span>

            ${
              ICONOS_TIPO[tipo]
              || "🚨"
            }

            ${tipo}

          </span>

          <b>${cantidad}</b>

        </div>

        `;

      });

    divTipos.innerHTML =
      htmlTipos;

  }

}

// ==========================
// 📈 CREAR GRÁFICOS
// ==========================
function crear(id, datos, tipo = "bar", color = "#3b82f6", horizontal = false) {

let canvas = document.getElementById(id);

if (!canvas) {
  console.log("❌ Canvas no encontrado:", id);
  return;
}

canvas.style.background = "#1f2937"; // ✅ fondo oscuro

  let parent = canvas.parentElement;

  // ✅ eliminar mensaje viejo
  let msg = parent.querySelector(".sin-datos");
  if (msg) msg.remove();

  // 🔥 si no hay datos
  if (Object.keys(datos).length === 0) {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let nuevoMsg = document.createElement("div");
    nuevoMsg.className = "sin-datos";
    nuevoMsg.innerText = "⚠️ Sin datos disponibles";
    nuevoMsg.style.textAlign = "center";
    nuevoMsg.style.color = "#fbbf24";
    nuevoMsg.style.marginTop = "20px";

    parent.appendChild(nuevoMsg);
    return;
  }

  new Chart(canvas, {
  type: tipo,
  data: {
    labels: Object.keys(datos),
    datasets: [{
      data: Object.values(datos),
      backgroundColor: Object.keys(datos).map((_, i) => COLORES[i % COLORES.length]),
      borderRadius: 6,
      borderColor: "#ffffff",
      borderWidth: tipo === "pie" ? 2 : 0,
      hoverOffset: 8
      }]
    },
options: {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: horizontal ? "y" : "x",

  plugins: {
    legend: {
      display: tipo === "pie",
      labels: { color: "#ffffff" }
    },
    title: {
      display: true,
      text: id.replace("grafico", "").toUpperCase(),
      color: "#ffffff",
      font: {
        size: 16,
        weight: "bold"
      }
    }
  },
 
  // ✅ AQUÍ VA scales (dentro de options)
  scales: tipo !== "pie" ? {
    x: {
      ticks: {
        color: "#ffffff",
        font: { weight: "bold" }
      },
      grid: {
        color: "rgba(255,255,255,0.08)"
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
        color: "#ffffff"
      },
      grid: {
        color: "rgba(255,255,255,0.08)"
        }
      }
    } : {}
  }
});
}
  
// ==========================
// 🔘 BOTONES
// ==========================
window.verGeneral = function() {
  vistaActual = "general";
cargarPartes();
}

window.verBrigada = function() {
  vistaActual = "brigada";
 cargarPartes();
}

window.verMedico = function() {
  vistaActual = "medico";
  cargarPartes();
}

function actualizarBotones() {

  // quitar clase activa a todos
  document.getElementById("btnGeneral").classList.remove("activo");
  document.getElementById("btnBrigada").classList.remove("activo");
  document.getElementById("btnMedico").classList.remove("activo");

  // activar el actual
  if (vistaActual === "general") {
    document.getElementById("btnGeneral").classList.add("activo");
  }
  else if (vistaActual === "brigada") {
    document.getElementById("btnBrigada").classList.add("activo");
  }
  else if (vistaActual === "medico") {
    document.getElementById("btnMedico").classList.add("activo");
  }
}

// ==========================
// 🔄 ACTUALIZAR
// ==========================
function actualizarDashboard() {

  let mesFiltro = document.getElementById("filtroMes").value;
  let anioFiltro = document.getElementById("filtroAnio").value;

let filtrados = partes.filter(p => {

  // ✅ SOLO emergencias completas
  if (!(p.brigada && p.servicioMedico)) return false;

  if (!p.fecha) return false;

  let f = p.fecha.split("-");
  let anio = f[0];
  let mes = f[1];

  if (mesFiltro && mes !== mesFiltro) return false;
  if (anioFiltro && anio !== anioFiltro) return false;

  return true;
});

  actualizarResumenes(
  filtrados
);

  // recalcular datos
let porMes = {};
filtrados.forEach(p => {

  let m = p.fecha.split("-")[1];

  let nombreMes = MESES[m] || m;

  porMes[nombreMes] = (porMes[nombreMes] || 0) + 1;
});

  let porMesOrdenado = {};

ORDEN_MESES.forEach(mes => {
  if (porMes[mes]) {
    porMesOrdenado[mes] = porMes[mes];
  }
});
  
  let porFaena = contar(filtrados, "faena");
  let porTipo = contar(filtrados, "tipo");

  const horarios =
  calcularHorarios(
    filtrados
  );
  
  let porSubtipo = contar(filtrados, "subtipo");
  let porEmpresa = contar(filtrados, "empresa");
  
// ✅ NUEVO: ambulancias
let porAmbulancia = contar(filtrados, "ambulancia");

// ordenar
porAmbulancia = Object.fromEntries(
  Object.entries(porAmbulancia).sort((a, b) => b[1] - a[1])
);

// ✅ claves alfa
let porClave = contar(filtrados, "clave");

// ordenar
porClave = Object.fromEntries(
  Object.entries(porClave).sort((a, b) => b[1] - a[1])
);

let porPUE = contar(filtrados, "pue");
// ✅ NUEVO: contar brigadas en CONSAGRADO
let porBrigada = contar(filtrados, "brigada");

// ✅ ordenar (opcional pero recomendado)
porBrigada = Object.fromEntries(
  Object.entries(porBrigada).sort((a, b) => b[1] - a[1])
);


// 🧹 limpiar primero
Chart.helpers.each(Chart.instances, function(inst) {
  inst.destroy();
});

// 📊 crear después
// ✅ ORDENAR MESES

ORDEN_MESES.forEach(mes => {
  if (porMes[mes]) {
    porMesOrdenado[mes] = porMes[mes];
  }
});

crear("graficoMes", porMesOrdenado);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");
crear("graficoMedico", porAmbulancia, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);
crear("graficoAsistencia", porBrigada, "bar");

let contenedor = document.getElementById("graficosSubtipos");
if (contenedor) contenedor.innerHTML = "";

 // ❌ ELIMINAR gráficos dinámicos en CONSAGRADO
document.querySelectorAll(".grafico-dinamico").forEach(el => el.remove()); 

}

document.getElementById("filtroMes").onchange = actualizarDashboard;
document.getElementById("filtroAnio").onchange = actualizarDashboard;

cargarPartes();

// ✅ BOTÓN ACTUALIZAR (SIN RECARGA)
document.getElementById("actualizar").onclick = async () => {

  let btn = document.getElementById("actualizar");

  btn.innerText = "⏳ Cargando...";

  await cargarPartes();

  btn.innerText = "🔄 Actualizar";
};

// ==========================
// 📋 TOGGLE PARTES
// ==========================
window.toggleHistorial = function() {
  let d = document.getElementById("historial");

  d.style.display = d.style.display === "none" ? "block" : "none";
};

window.togglePartes = function() {
  let d = document.getElementById("partes");

  d.style.display = d.style.display === "none" ? "block" : "none";
};

function actualizarBrigada() {

  let mesFiltro = document.getElementById("filtroMes").value;
  let anioFiltro = document.getElementById("filtroAnio").value;

let filtrados = partes.filter(p => {

 // ✅ SOLO con brigada
if (!p.brigada || p.brigada.trim() === "") return false;

  if (!p.fecha) return false;

  let f = p.fecha.split("-");
  let anio = f[0];
  let mes = f[1];

  if (mesFiltro && mes !== mesFiltro) return false;
  if (anioFiltro && anio !== anioFiltro) return false;

  return true;
});

  actualizarResumenes(
  filtrados
);

let porMes = {};
filtrados.forEach(p => {

  let m = p.fecha.split("-")[1];

  let nombreMes = MESES[m] || m;

  porMes[nombreMes] = (porMes[nombreMes] || 0) + 1;
});

let porMesOrdenado = {};

ORDEN_MESES.forEach(mes => {
  if (porMes[mes]) {
    porMesOrdenado[mes] = porMes[mes];
  }
});

  let porFaena = contar(filtrados, "faena");
  let porTipo = contar(filtrados, "tipo");
  let porSubtipo = contar(filtrados, "subtipo");
  let porEmpresa = contar(filtrados, "empresa");
  let medicoSI = filtrados.filter(p => p.servicioMedico).length;
let medicoNO = filtrados.filter(p => !p.servicioMedico).length;

let porMedico = {
  "Sí asiste": medicoSI,
  "No asiste": medicoNO
};

let porPUE = contar(filtrados, "pue");

// ✅ NUEVO: contar por brigada reales
let porBrigada = contar(filtrados, "brigada");

// ✅ ordenar de mayor a menor (opcional pero recomendado)
porBrigada = Object.fromEntries(
  Object.entries(porBrigada).sort((a, b) => b[1] - a[1])
);

// 🧹 destruir primero
Chart.helpers.each(Chart.instances, function(inst) {
  inst.destroy();
});

// ✅ crear TODOS después
crear("graficoAsistencia", porBrigada, "bar");
crear("graficoMes", porMesOrdenado);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");
crear("graficoMedico", porMedico, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);

  let tipos = {};

filtrados.forEach(p => {
  if (!p.tipo || !p.subtipo) return;

  if (!tipos[p.tipo]) {
    tipos[p.tipo] = {};
  }

  tipos[p.tipo][p.subtipo] =
    (tipos[p.tipo][p.subtipo] || 0) + 1;
});

let contenedor = document.querySelector(".gridGraficos"); // 🔥 CLAVE

  // 🔥 eliminar TODOS los gráficos dinámicos anteriores
document.querySelectorAll(".grafico-dinamico").forEach(el => el.remove());

Object.keys(tipos).forEach((tipo, i) => {

  let id = "graficoSubtipo_" + i;

  let div = document.createElement("div");
div.className = "card grafico-dinamico";

  div.innerHTML = `
    <h4>📂 ${tipo}</h4>
    <canvas id="${id}"></canvas>
  `;

  contenedor.appendChild(div); // 🔥 AHORA VA DIRECTO AL GRID

  crear(id, tipos[tipo], "bar");
});

  }
  

async function actualizarMedico() {

  let mesFiltro = document.getElementById("filtroMes").value;
  let anioFiltro = document.getElementById("filtroAnio").value;

let filtrados = partes.filter(p => {

  // ✅ SOLO con servicio médico
  if (!p.servicioMedico || p.servicioMedico.trim() === "") return false;

  if (!p.fecha) return false;

  let f = p.fecha.split("-");
  let anio = f[0];
  let mes = f[1];

  if (mesFiltro && mes !== mesFiltro) return false;
  if (anioFiltro && anio !== anioFiltro) return false;

  return true;
});

  actualizarResumenes(
  filtrados
);

let porMes = {};
filtrados.forEach(p => {

  let m = p.fecha.split("-")[1];

  let nombreMes = MESES[m] || m;

  porMes[nombreMes] = (porMes[nombreMes] || 0) + 1;
});

  let porMesOrdenado = {};

ORDEN_MESES.forEach(mes => {
  if (porMes[mes]) {
    porMesOrdenado[mes] = porMes[mes];
  }
});

  let porFaena = contar(filtrados, "faena");
  let porTipo = contar(filtrados, "tipo");
  let porSubtipo = contar(filtrados, "subtipo");
  let porEmpresa = contar(filtrados, "empresa");
  
 // ✅ 1. Ambulancias reales
let porAmbulancia = contar(filtrados, "ambulancia");

porAmbulancia = Object.fromEntries(
  Object.entries(porAmbulancia).sort((a, b) => b[1] - a[1])
);

// ✅ 2. Claves médicas
let porClave = contar(filtrados, "clave");

porClave = Object.fromEntries(
  Object.entries(porClave).sort((a, b) => b[1] - a[1])
);

const snapshotTraslados = await getDocs(
  collection(db, "traslados")
);

let traslados = [];

snapshotTraslados.forEach(doc => {
  traslados.push(doc.data());
});

let porTraslado = {
  Interno: 0,
  Externo: 0
};

traslados.forEach(t => {

  const tipo = (t.tipoTraslado || "").toLowerCase();

  if (tipo === "interno") {
    porTraslado.Interno++;
  }

  if (tipo === "externo") {
    porTraslado.Externo++;
  }

});

  console.log("TRASLADOS FIREBASE:", traslados);
console.log("DATA GRAFICO:", porTraslado);

let porCentro = {};

// ✅ SOLO DERIVACIONES EXTERNAS
traslados.forEach(t => {

  const tipo = (t.tipoTraslado || "").toLowerCase();

  if (tipo !== "externo") return;

  let centro = t.lugarTraslado || "Sin dato";

  porCentro[centro] =
    (porCentro[centro] || 0) + 1;

});

 porCentro = Object.fromEntries(
  Object.entries(porCentro)
    .sort((a, b) => b[1] - a[1])
);

  console.log("CENTROS:", porCentro);

  let porMesTraslado = {};

  traslados.forEach(t => {

  if (!t.fecha) return;

  let mesNumero =
    t.fecha.split("-")[1];

  let nombreMes =
    MESES[mesNumero] || mesNumero;

  porMesTraslado[nombreMes] =
    (porMesTraslado[nombreMes] || 0) + 1;

});

  let porMesTrasladoOrdenado = {};

ORDEN_MESES.forEach(mes => {

  if (porMesTraslado[mes]) {

    porMesTrasladoOrdenado[mes] =
      porMesTraslado[mes];

  }

});

  console.log(
  "TRASLADOS POR MES:",
  porMesTrasladoOrdenado
);

  let porAmbulanciaTraslado = {};

// SOLO EXTERNOS
traslados.forEach(t => {

  const tipo = (t.tipoTraslado || "").toLowerCase();

  if (tipo !== "externo") return;

  const unidad = t.unidad || "Sin unidad";

  porAmbulanciaTraslado[unidad] =
    (porAmbulanciaTraslado[unidad] || 0) + 1;

});

  porAmbulanciaTraslado = Object.fromEntries(
  Object.entries(porAmbulanciaTraslado)
    .sort((a, b) => b[1] - a[1])
);

  console.log(
  "AMBULANCIAS TRASLADO:",
  porAmbulanciaTraslado
);
  
let porPUE = contar(filtrados, "pue");

// 🧹 primero destruir
Chart.helpers.each(Chart.instances, function(inst) {
  inst.destroy();
});

// 📊 luego crear TODOS
crear("graficoMes", porMesOrdenado);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");

// ✅ NUEVOS gráficos médicos
crear("graficoMedico", porAmbulancia, "pie");
crear("graficoClaves", porClave, "bar", "#f59e0b", true);
console.log("TRASLADOS FILTRADOS:", traslados);
console.log("DATA GRAFICO:", porTraslado);
crear("graficoTraslados", porTraslado, "pie");

  crear(
  "graficoCentrosTraslado",
  porCentro,
  "bar",
  "#ef4444",
  true
);

  console.log(
  "AMBULANCIAS TRASLADO:",
  porAmbulanciaTraslado
);
  
  crear(
  "graficoAmbulanciasTraslado",
  porAmbulanciaTraslado,
  "bar",
  "#06b6d4",
  true
);

  crear(
  "graficoTrasladosMes",
  porMesTrasladoOrdenado,
  "bar",
  "#10b981"
);
  
crear("graficoPUE", porPUE, "bar", "#10b981", true);

let contenedor = document.getElementById("graficosSubtipos");
if (contenedor) contenedor.innerHTML = "";

  // ❌ ELIMINAR gráficos dinámicos (IMPORTANTE)
document.querySelectorAll(".grafico-dinamico").forEach(el => el.remove());
 
}

async function actualizarTodo() {

  // ✅ recalcular derivados
  partesReales = partes.filter(esReal);
  soloBrigada = partesReales.filter(p =>
    BRIGADAS_VALIDAS.includes(p.brigada)
  );

  // ✅ KPIs
  let totalGeneral = partes.filter(p => p.brigada || p.servicioMedico);
  document.getElementById("total").innerText = totalGeneral.length;

  let emergenciasCompletas = partes.filter(p => p.brigada && p.servicioMedico);
  document.getElementById("totalCompletas").innerText = emergenciasCompletas.length;

  document.getElementById("totalPartes").innerText = partes.length;

  // ✅ ÚLTIMA EMERGENCIA (CORRECTO)
let ultima = partes.length > 0
  ? partes[0]  // ✅ ahora sí es la más reciente
  : null;

if (ultima) {

  let descripcion = ultima.descripcion && ultima.descripcion.trim() !== ""
    ? ultima.descripcion
    : "Sin descripción";

document.getElementById(
  "ultimaEmergencia"
).innerHTML = `

<div class="ultimaLugar">
  📍 ${ultima.lugar || "-"}
</div>

<div class="ultimaTipo">
  🔥 ${ultima.tipo || "-"}
</div>

<div class="ultimaSubtipo">
  📂 ${ultima.subtipo || "-"}
</div>

<div class="ultimaInfo">
  📅 ${ultima.fecha || "-"}
  &nbsp;|&nbsp;
  ⏱ ${ultima.horaActivacion || "--"}
</div>

`;
  let ahora = new Date();
  let fechaUltima = new Date(ultima.fecha + " " + (ultima.horaActivacion || "00:00"));
  let diffMin = (ahora - fechaUltima) / (1000 * 60);

  document.getElementById("ultimaEmergencia").style.color =
    diffMin < 60 ? "#ef4444" : "#10b981";
}

// ✅ actualizar según vista actual
if (vistaActual === "general") {
  actualizarDashboard();
}
else if (vistaActual === "brigada") {
  actualizarBrigada();
}
else if (vistaActual === "medico") {
  await actualizarMedico();
}

  // ==========================
// 📋 PARTES LISTADO
// ==========================
let divPartes = document.getElementById("partes");

divPartes.innerHTML = partes.length === 0
  ? "Sin partes"
  : partes.map((p, index) => `
      📅 ${p.fecha}<br>
      🚒 ${p.tipo}<br>
      📍 ${p.lugar}<br>

      <button onclick="editarParte(${index})">
        ✏️ Editar Parte
      </button>
    `).join("<hr>");


// ==========================
// 📂 HISTORIAL
// ==========================
let divHist = document.getElementById("historial");

divHist.innerHTML = partes.length === 0
  ? "Sin historial"
  : partes.map(p => `
      📅 ${p.fecha}<br>
      🚒 ${p.tipo} - ${p.subtipo}<br>
      📍 ${p.lugar}<br>
      📝 ${p.descripcion || "Sin descripción"}
    `).join("<hr>");

  
actualizarBotones();

// ✅ CONTROL SUBTIPO
const cardSubtipo = document.getElementById("cardSubtipo");

if (cardSubtipo) {
  if (vistaActual === "general") {
    cardSubtipo.style.display = "block"; // ✅ se ve
  } else {
    cardSubtipo.style.display = "none"; // ❌ se oculta
  }
}

  // ✅ CONTROL VISUAL SERVICIO MÉDICO
const cardClaves =
document.getElementById("cardClaves");

const cardTraslados =
document.getElementById("cardTraslados");

const cardCentrosTraslado =
document.getElementById("cardCentrosTraslado");

const cardAmbulanciasTraslado =
document.getElementById("cardAmbulanciasTraslado");

 const cardTrasladosMes =
  document.getElementById("cardTrasladosMes"); 

if (cardClaves && cardTraslados) {

if (vistaActual === "medico") {

  cardClaves.style.display = "block";
  cardTraslados.style.display = "block";

  if (cardCentrosTraslado)
    cardCentrosTraslado.style.display = "block";

  if (cardAmbulanciasTraslado)
    cardAmbulanciasTraslado.style.display = "block";

  if (cardTrasladosMes)
  cardTrasladosMes.style.display = "block";
  
}
  else {

  cardClaves.style.display = "none";
  cardTraslados.style.display = "none";

  if (cardCentrosTraslado)
    cardCentrosTraslado.style.display = "none";

    if (cardAmbulanciasTraslado)
  cardAmbulanciasTraslado.style.display = "none";

    if (cardTrasladosMes)
  cardTrasladosMes.style.display = "none";

}}

  // ✅ CONTROL VISUAL ASISTENCIA BRIGADA
const cardAsistencia = document.getElementById("cardAsistencia");

if (cardAsistencia) {

  if (vistaActual === "medico") {
    cardAsistencia.style.display = "none"; // ❌ ocultar
  } else {
    cardAsistencia.style.display = "block"; // ✅ mostrar
  }

}
  
}

document.getElementById("adminReset").onclick = async () => {

  let clave = prompt("🔐 Ingrese contraseña de administrador");

  if (clave !== "1234") {
    alert("❌ Acceso denegado");
    return;
  }

  let confirmar = confirm("⚠️ ¿Seguro que deseas borrar TODOS los datos?");

  if (!confirmar) return;

  // 🧨 borrar datos
try {

  // PARTES
  const partesSnapshot =
    await getDocs(collection(db, "partes"));

  for (const d of partesSnapshot.docs) {

    await deleteDoc(
      doc(db, "partes", d.id)
    );

  }

  // TRASLADOS
  const trasladosSnapshot =
    await getDocs(collection(db, "traslados"));

  for (const d of trasladosSnapshot.docs) {

    await deleteDoc(
      doc(db, "traslados", d.id)
    );

  }

  // LocalStorage
  localStorage.removeItem("partesEmergencia");
  localStorage.removeItem("historialEmergencias");

  alert("✅ Firestore y LocalStorage eliminados");

  location.reload();

}
catch(error) {

  console.error(error);

  alert("❌ Error eliminando datos");

}
};

window.editarParte = function(index) {

  // ✅ limpiar modo lectura
  localStorage.removeItem(
    "parteVer"
  );

  // ✅ limpiar emergencia activa
  localStorage.removeItem(
    "emergenciaSeleccionada"
  );

  let parteSeleccionado =
    partes[index];

  localStorage.setItem(
    "parteEditar",
    JSON.stringify(
      parteSeleccionado
    )
  );

  window.open(
    "formulario.html",
    "_blank"
  );

}

function mostrarPanelBrigada() {

  const panel = document.getElementById("panelBrigada");
  const subtipo = document.getElementById("graficoSubtipo")?.parentElement;

  // 🔒 PROTECCIÓN
  if (!panel) {
    console.warn("⚠️ panelBrigada NO existe en el HTML");
    return;
  }

  if (vistaActual === "brigada") {

    panel.style.display = "grid";

    if (subtipo) subtipo.style.display = "none";

  } else if (vistaActual === "medico") {

    panel.style.display = "none";

    if (subtipo) subtipo.style.display = "none";

  } else {

    panel.style.display = "none";

    if (subtipo) subtipo.style.display = "block";
  }
}

document.getElementById(
  "generarInforme"
).onclick = generarInformePDF;

async function generarInformePDF() {

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF(
    "p",
    "mm",
    "a4"
  );

  const logo = new Image();

logo.src = "logo.png";

let y = 50;

pdf.addImage(
  logo,
  "PNG",
  75,
  10,
  60,
  25
);

  pdf.setFontSize(22);

  pdf.text(
    "CENTRAL DE EMERGENCIAS",
    20,
    y
  );

  y += 12;

  pdf.setFontSize(14);

  pdf.text(
    "Informe Operacional",
    20,
    y
  );

  y += 8;

pdf.setFontSize(10);

pdf.text(
  "Informe Ejecutivo de Gestion de Emergencias",
  20,
  y
);

  y += 15;

  pdf.setFontSize(10);

  pdf.text(
    "Fecha: " +
    new Date().toLocaleString(),
    20,
    y
  );

  y += 15;

 pdf.text(
  "Total Emergencias: " +
  partes.length,
  20,
  y
);

  y += 10;

pdf.text(
  "Partes Cerrados: " +
  partes.length,
  20,
  y
);

y += 10;

pdf.text(
  "Vista Actual: " +
  vistaActual,
  20,
  y
);

const ultima =
  partes[0];

if (ultima) {

  y += 10;

  pdf.text(
    "Ultima Emergencia: " +
    (ultima.tipo || "-"),
    20,
    y
  );

  y += 8;

  pdf.text(
    "Fecha: " +
    (ultima.fecha || "-"),
    20,
    y
  );

}

// ==========================
// RESUMEN EJECUTIVO
// ==========================

pdf.addPage();

pdf.setFontSize(20);

pdf.text(
  "RESUMEN EJECUTIVO",
  20,
  20
);

let resumenY = 40;

// Emergencias por tipo
let porTipo = {};

partes.forEach(parte => {

  const tipo =
    parte.tipo || "Sin Tipo";

  porTipo[tipo] =
    (porTipo[tipo] || 0) + 1;

});

pdf.setFontSize(12);

pdf.text(
  `Total Emergencias: ${partes.length}`,
  20,
  resumenY
);

  const fechas =
  partes
    .map(p => p.fecha)
    .filter(Boolean)
    .sort();

if (fechas.length > 0) {

  resumenY += 10;

  pdf.text(
    `Periodo Analizado:`,
    20,
    resumenY
  );

  resumenY += 8;

  pdf.text(
    `${fechas[0]} al ${
      fechas[fechas.length - 1]
    }`,
    20,
    resumenY
  );

}

resumenY += 15;

Object.entries(porTipo)
.forEach(([tipo, cantidad]) => {

  pdf.text(
    `${tipo}: ${cantidad}`,
    20,
    resumenY
  );

  resumenY += 8;

});

// Brigadas
const conBrigada =
  partes.filter(
    p => p.brigada
  ).length;

resumenY += 10;

pdf.text(
  `Con Brigada: ${conBrigada}`,
  20,
  resumenY
);

// Servicio Médico
const conMedico =
  partes.filter(
    p =>
      p.ambulancia &&
      p.ambulancia !==
      "No asiste"
  ).length;

resumenY += 10;

pdf.text(
  `Con Servicio Medico: ${conMedico}`,
  20,
  resumenY
);

resumenY += 10;

pdf.text(
  `Sin Servicio Medico: ${
    partes.length -
    conMedico
  }`,
  20,
  resumenY
);

  // ==========================
// BRIGADA MAS UTILIZADA
// ==========================

let brigadas = {};

partes.forEach(parte => {

  const brigada =
    parte.brigada || "Sin Brigada";

  brigadas[brigada] =
    (brigadas[brigada] || 0) + 1;

});

const brigadaTop =
  Object.entries(brigadas)
  .sort((a,b) => b[1] - a[1])[0];

resumenY += 15;

pdf.text(
  `Brigada mas utilizada: ${
    brigadaTop
      ? brigadaTop[0]
      : "-"
  }`,
  20,
  resumenY
);

  // ==========================
// AMBULANCIA MAS UTILIZADA
// ==========================

let ambulancias = {};

partes.forEach(parte => {

  if (
    !parte.ambulancia ||
    parte.ambulancia === "No asiste"
  ) return;

  const ambulancia =
    parte.ambulancia;

  ambulancias[ambulancia] =
    (ambulancias[ambulancia] || 0) + 1;

});

const ambulanciaTop =
  Object.keys(ambulancias).length > 0
    ? Object.entries(ambulancias)
        .sort((a,b) => b[1] - a[1])[0]
    : null;

resumenY += 10;

pdf.text(
  `Ambulancia mas utilizada: ${
    ambulanciaTop
      ? ambulanciaTop[0]
      : "-"
  }`,
  20,
  resumenY
);

  resumenY += 10;

pdf.text(
  `Ultima Emergencia: ${
    ultima?.tipo || "-"
  }`,
  20,
  resumenY
);

  // ==========================
// DURACIONES
// ==========================

let totalMinutos = 0;

let cantidadDuraciones = 0;

let mayorDuracion = 0;

let emergenciaMasLarga = null;

partes.forEach(parte => {

  if (
    !parte.horaActivacion ||
    !parte.horaCierre
  ) return;

  const inicio =
    new Date(
      `2000-01-01 ${parte.horaActivacion}`
    );

  const fin =
    new Date(
      `2000-01-01 ${parte.horaCierre}`
    );

  const diferencia =
    (fin - inicio) /
    1000 /
    60;

  totalMinutos +=
    diferencia;

  cantidadDuraciones++;

  if (
    diferencia >
    mayorDuracion
  ) {

    mayorDuracion =
      diferencia;

    emergenciaMasLarga =
      parte;

  }

});

  const promedioEmergencias =
  cantidadDuraciones > 0

    ? Math.round(
        totalMinutos /
        cantidadDuraciones
      )

    : 0;

  resumenY += 15;

pdf.text(
  `Tiempo Promedio: ${
    promedioEmergencias
  } min`,
  20,
  resumenY
);

  if (
  emergenciaMasLarga
) {

  resumenY += 10;

  pdf.text(
    `Emergencia Mas Larga: ${
      emergenciaMasLarga.tipo
    }`,
    20,
    resumenY
  );

  resumenY += 8;

  pdf.text(
    `Duracion: ${
      Math.round(
        mayorDuracion
      )
    } min`,
    20,
    resumenY
  );

}
  
// ==========================
// 📊 PAGINA 2
// GRAFICO POR MES
// ==========================
const graficos = [

  {
    id: "graficoMes",
    titulo: "Emergencias por Mes"
  },

  {
    id: "graficoTipo",
    titulo: "Emergencias por Tipo"
  },

  {
    id: "graficoFaena",
    titulo: "Emergencias por Faena"
  },

  {
    id: "graficoEmpresa",
    titulo: "Emergencias por Empresa"
  },

  {
    id: "graficoMedico",
    titulo: "Ambulancias"
  }

];

graficos.forEach(grafico => {

  const canvas =
    document.getElementById(
      grafico.id
    );

  if (!canvas) return;

  const imagen =
    canvas.toDataURL(
      "image/png"
    );

  pdf.addPage();

  pdf.setFontSize(18);

  pdf.text(
    grafico.titulo,
    20,
    20
  );

  const anchoCanvas =
    canvas.width;

  const altoCanvas =
    canvas.height;

  const proporcion =
    altoCanvas / anchoCanvas;

  const anchoPDF = 170;

  const altoPDF =
    anchoPDF * proporcion;

  pdf.addImage(
    imagen,
    "PNG",
    20,
    30,
    anchoPDF,
    altoPDF
  );

});

// ==========================
// GUARDAR PDF
// ==========================

pdf.addPage();

pdf.setFontSize(18);

pdf.text(
  "Detalle de Emergencias",
  20,
  20
);

let fila = 35;

partes.forEach(parte => {

  pdf.setFontSize(10);

  pdf.text(
    `Fecha: ${parte.fecha || "-"}`,
    10,
    fila
  );

  fila += 5;

  pdf.text(
    `Tipo: ${parte.tipo || "-"}`,
    10,
    fila
  );

  fila += 5;

  pdf.text(
    `Subtipo: ${parte.subtipo || "-"}`,
    10,
    fila
  );

  fila += 5;

  pdf.text(
    `Ubicacion: ${parte.lugar || "-"}`,
    10,
    fila
  );

  fila += 5;

  pdf.text(
    `Brigada: ${parte.brigada || "-"}`,
    10,
    fila
  );

  fila += 5;

  pdf.text(
    `Servicio Medico: ${parte.ambulancia || "-"}`,
    10,
    fila
  );

fila += 5;

let duracion = "-";

if (
  parte.horaActivacion &&
  parte.horaCierre
) {

  const inicio =
    new Date(
      `2000-01-01 ${parte.horaActivacion}`
    );

  const fin =
    new Date(
      `2000-01-01 ${parte.horaCierre}`
    );

  const diferencia =
    fin - inicio;

  const horas =
    Math.floor(
      diferencia /
      1000 /
      60 /
      60
    );

  const minutos =
    Math.floor(
      diferencia /
      1000 /
      60
    ) % 60;

  duracion =
    `${horas}h ${minutos}min`;

}

pdf.text(
  `Descripcion: ${
    parte.descripcion || "-"
  }`,
  10,
  fila
);

fila += 5;

pdf.text(
  `Duracion: ${duracion}`,
  10,
  fila
);

fila += 10;

  pdf.line(
    10,
    fila,
    190,
    fila
  );

  fila += 10;

  if (fila > 260) {

    pdf.addPage();

    fila = 20;

  }

});

  // ==========================
// CONCLUSIONES
// ==========================

pdf.addPage();

pdf.setFontSize(20);

pdf.text(
  "CONCLUSIONES OPERACIONALES",
  20,
  20
);

let conclusionY = 40;

const tipoMasFrecuente =
  Object.entries(porTipo)
  .sort((a,b) => b[1] - a[1])[0];

pdf.setFontSize(12);

pdf.text(
  `• Se registraron ${partes.length} emergencias durante el periodo analizado.`,
  20,
  conclusionY
);

conclusionY += 15;

pdf.text(
  `• El tipo mas frecuente fue ${tipoMasFrecuente[0]} con ${tipoMasFrecuente[1]} eventos.`,
  20,
  conclusionY
);

conclusionY += 15;

pdf.text(
  `• La brigada con mayor participacion fue ${brigadaTop[0]}.`,
  20,
  conclusionY
);

conclusionY += 15;

pdf.text(
  `• El tiempo promedio de respuesta fue de ${promedioEmergencias} minutos.`,
  20,
  conclusionY
);

conclusionY += 15;

if (emergenciaMasLarga) {

  pdf.text(
    `• La emergencia mas extensa fue ${emergenciaMasLarga.tipo} con ${Math.round(mayorDuracion)} minutos.`,
    20,
    conclusionY
  );

}

  const totalPaginas =
  pdf.getNumberOfPages();

for (
  let i = 1;
  i <= totalPaginas;
  i++
) {

  pdf.setPage(i);

  pdf.setFontSize(8);

  pdf.text(
    `Pagina ${i} de ${totalPaginas}`,
    170,
    290
  );

}
  
const fechaActual =
  new Date()
    .toISOString()
    .split("T")[0];

pdf.save(
  `Informe_Operacional_${fechaActual}.pdf`
);

  }
