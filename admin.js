console.log("✅ admin.js funcionando");

// ==========================
// 📦 DATOS
// ==========================
let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];
let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];
let vistaActual = "general";


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

// ✅ OBTENER ÚLTIMA EMERGENCIA
let ultima = partes
  .filter(p => p.fecha)
  .sort((a, b) => {

    let fechaA = new Date(a.fecha + " " + (a.hora || "00:00"));
    let fechaB = new Date(b.fecha + " " + (b.hora || "00:00"));

    return fechaB - fechaA;
  })[0];


if (ultima) {

  // ✅ CREAR DESCRIPCIÓN
  let descripcion = ultima.descripcion && ultima.descripcion.trim() !== ""
    ? ultima.descripcion
    : "Sin descripción";

  // ✅ MOSTRAR DATOS
  document.getElementById("ultimaEmergencia").innerHTML = `
    📅 ${ultima.fecha} ⏱️ ${ultima.hora || "--"}<br>
    📍 ${ultima.lugar || "-"}<br>
    🚒 ${ultima.tipo || "-"}<br>
    📝 ${descripcion}
  `;

  // ✅ ALERTA POR RECENCIA
  let ahora = new Date();
  let fechaUltima = new Date(ultima.fecha + " " + (ultima.hora || "00:00"));
  let diffMin = (ahora - fechaUltima) / (1000 * 60);

  if (diffMin < 60) {
    document.getElementById("ultimaEmergencia").style.color = "#ef4444";
  }

}

console.log("📊 Historial:", historial);
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
// 📋 PARTES LISTADO
// ==========================
let divPartes = document.getElementById("partes");

divPartes.innerHTML = partes.length === 0
  ? "Sin partes"
  : partes.map(p => `
      📅 ${p.fecha}<br>
      🚒 ${p.tipo} - ${p.subtipo}<br>
      📍 ${p.lugar}<br>
      👤 ${p.operador}
    `).join("<hr>");

// ==========================
// 📅 HISTORIAL
// ==========================
let divHist = document.getElementById("historial");

divHist.innerHTML = historial.map(e => `
  #${e.id} - ${e.tipo}<br>
  📍 ${e.ubicacion}<br>
  📅 ${e.fecha}
`).join("<hr>");

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
        backgroundColor: color
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      plugins: {
        legend: { display: tipo === "pie" }
      }
    }
  });
}

// ==========================
// 🔘 BOTONES
// ==========================
function verGeneral() {
  vistaActual = "general";
  actualizarTodo();
}

function verBrigada() {
  vistaActual = "brigada";
  actualizarTodo(); 
}

function verMedico() {
  vistaActual = "medico";
  actualizarTodo(); 
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
    porMes[m] = (porMes[m] || 0) + 1;
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

// 🧹 limpiar primero
Chart.helpers.each(Chart.instances, function(inst) {
  inst.destroy();
});

// 📊 crear después
crear("graficoMes", porMes);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");
crear("graficoMedico", porMedico, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);
}

document.getElementById("filtroMes").onchange = actualizarDashboard;
document.getElementById("filtroAnio").onchange = actualizarDashboard;

actualizarTodo();

// ✅ BOTÓN ACTUALIZAR (SIN RECARGA)
document.getElementById("actualizar").onclick = actualizarTodo;

// ==========================
// 📋 TOGGLE PARTES
// ==========================
function togglePartes() {
  let d = document.getElementById("partes");
  d.style.display = d.style.display === "none" ? "block" : "none";
}

function toggleHistorial() {
  let d = document.getElementById("historial");

  if (d.style.display === "none") {
    d.style.display = "block";
  } else {
    d.style.display = "none";
  }
}


function actualizarBrigada() {

  let mesFiltro = document.getElementById("filtroMes").value;
  let anioFiltro = document.getElementById("filtroAnio").value;

  let filtrados = soloBrigada.filter(p => {

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
    porMes[m] = (porMes[m] || 0) + 1;
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
crear("graficoMes", porMes);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");
crear("graficoMedico", porMedico, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);
}

function actualizarMedico() {

  let mesFiltro = document.getElementById("filtroMes").value;
  let anioFiltro = document.getElementById("filtroAnio").value;

  let soloMedico = partes.filter(p => p.servicioMedico);

  let filtrados = soloMedico.filter(p => {

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
    porMes[m] = (porMes[m] || 0) + 1;
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
crear("graficoMes", porMes);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");
crear("graficoMedico", porMedico, "pie");
crear("graficoPUE", porPUE, "bar", "#10b981", true);

}

function actualizarTodo() {

  // 🔄 recargar datos
  partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

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

  // ✅ ÚLTIMA EMERGENCIA
  let ultima = partes
    .filter(p => p.fecha)
    .sort((a, b) => {
      let fechaA = new Date(a.fecha + " " + (a.hora || "00:00"));
      let fechaB = new Date(b.fecha + " " + (b.hora || "00:00"));
      return fechaB - fechaA;
    })[0];

  if (ultima) {

    let descripcion = ultima.descripcion && ultima.descripcion.trim() !== ""
      ? ultima.descripcion
      : "Sin descripción";

    document.getElementById("ultimaEmergencia").innerHTML = `
      📅 ${ultima.fecha} ⏱️ ${ultima.hora || "--"}<br>
      📍 ${ultima.lugar || "-"}<br>
      🚒 ${ultima.tipo || "-"}<br>
      📝 ${descripcion}
    `;

    let ahora = new Date();
    let fechaUltima = new Date(ultima.fecha + " " + (ultima.hora || "00:00"));
    let diffMin = (ahora - fechaUltima) / (1000 * 60);

    if (diffMin < 60) {
      document.getElementById("ultimaEmergencia").style.color = "#ef4444";
    } else {
      document.getElementById("ultimaEmergencia").style.color = "#10b981";
    }
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

// ✅ activar botón correspondiente
actualizarBotones();

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
