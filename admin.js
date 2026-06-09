import { db, collection, getDocs } from "./firebase.js";
console.log("✅ admin.js funcionando");

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

  querySnapshot.forEach((doc) => {
  partes.push(doc.data());
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

// ==========================
// 📈 CREAR GRÁFICOS
// ==========================
function crear(id, datos, tipo = "bar", color = "#3b82f6", horizontal = false) {

  let canvas = document.getElementById(id);
  if (!canvas) return;

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
      display: tipo === "pie"
    },

    title: {
      display: true,
      text: id.replace("grafico", "").toUpperCase(),
      color: "#1e40af",
      font: {
        size: 16,
        weight: "bold"
      }
    }
  },

scales: tipo !== "pie" ? {
      x: {
        ticks: {
  color: "#1e293b",
  font: { weight: "bold" }
},
        grid: { display: false }
      },
      y: {
  beginAtZero: true,
  ticks: {
    stepSize: 1,
    precision: 0,
    color: "#64748b"
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
  let porSubtipo = contar(filtrados, "subtipo");
  let porEmpresa = contar(filtrados, "empresa");
let medicoSI = filtrados.filter(p => p.servicioMedico).length;
let medicoNO = filtrados.filter(p => !p.servicioMedico).length;

let porMedico = {
  "Sí asiste": medicoSI,
  "No asiste": medicoNO
};

let porPUE = contar(filtrados, "pue");

  let asistenciaSI = filtrados.filter(p => p.brigada && p.brigada !== "").length;
let asistenciaNO = filtrados.filter(p => !p.brigada || p.brigada === "").length;

  crear("graficoAsistencia", porAsistencia, "pie");

let porAsistencia = {
  "Con Brigada": asistenciaSI,
  "Sin Brigada": asistenciaNO
};

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
crear("graficoMedico", porMedico, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);

let contenedor = document.getElementById("graficosSubtipos");
if (contenedor) contenedor.innerHTML = "";

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

// 🧹 destruir primero
Chart.helpers.each(Chart.instances, function(inst) {
  inst.destroy();
});

// 📊 crear después
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


let contenedor = document.getElementById("graficosSubtipos");
contenedor.innerHTML = "";

Object.keys(tipos).forEach((tipo, i) => {

  let id = "graficoSubtipo_" + i;

  let div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <h4>📂 ${tipo}</h4>
    <canvas id="${id}"></canvas>
  `;

  contenedor.appendChild(div);

  crear(id, tipos[tipo], "bar");
});
  
}

function actualizarMedico() {

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
crear("graficoMedico", porMedico, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);

 let contenedor = document.getElementById("graficosSubtipos");
if (contenedor) contenedor.innerHTML = "";

}

function actualizarTodo() {

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

  document.getElementById("ultimaEmergencia").innerHTML = `
    📅 ${ultima.fecha || "--"} ⏱ ${ultima.horaActivacion || "--"} - ${ultima.horaCierre || "--"}<br>
    📍 ${ultima.lugar || "-"}<br>
    🚒 ${ultima.tipo || "-"}<br>
    📝 ${descripcion}
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
  actualizarMedico();
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

  
// ✅ activar botón correspondiente
actualizarBotones();
mostrarPanelBrigada();
  
}

document.getElementById("adminReset").onclick = () => {

  let clave = prompt("🔐 Ingrese contraseña de administrador");

  if (clave !== "1234") {
    alert("❌ Acceso denegado");
    return;
  }

  let confirmar = confirm("⚠️ ¿Seguro que deseas borrar TODOS los datos?");

  if (!confirmar) return;

  // 🧨 borrar datos
  localStorage.removeItem("partesEmergencia");
  localStorage.removeItem("historialEmergencias");

  alert("✅ Datos eliminados correctamente");

  // 🔄 refrescar todo
  location.reload();
};

window.editarParte = function(index) {

// usar variable global partes
let parteSeleccionado = partes[index];

  // ✅ limpiar emergencia vieja
  localStorage.removeItem("emergenciaSeleccionada");

  // ✅ guardar parte para editar
  localStorage.setItem("parteEditar", JSON.stringify(parteSeleccionado));

  window.open("formulario.html", "_blank");
}

function mostrarPanelBrigada() {

  let panel = document.getElementById("panelBrigada");

  if (vistaActual === "brigada") {
    panel.style.display = "grid"; // 🔥 importante usar grid
  } else {
    panel.style.display = "none";
  }
}
