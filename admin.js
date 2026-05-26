console.log("✅ admin.js funcionando");

// ==========================
// 📦 DATOS
// ==========================
let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];
let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

console.log("📊 Historial:", historial);
console.log("📋 Partes:", partes);

// ==========================
// 📊 KPIs
// ==========================
document.getElementById("total").innerText = historial.length;
document.getElementById("totalPartes").innerText = partes.length;

// ==========================
// 📅 ÚLTIMOS 15 DÍAS
// ==========================
let hoy = new Date();

let ultimos15 = historial.filter(e => {

  if (!e.fecha) return false;

  let p = e.fecha.includes("/") ? e.fecha.split("/") : e.fecha.split("-");

  if (p.length !== 3) return false;

  let fecha = new Date(p[2], p[1] - 1, p[0]);
  let diff = (hoy - fecha) / (1000 * 60 * 60 * 24);

  return diff <= 15;
});

document.getElementById("ultimosCount").innerText = ultimos15.length;

// ==========================
// 🚑 UNIDADES
// ==========================
let unidades = new Set();

historial.forEach(e => {
  if (!e.unidades) return;
  e.unidades.forEach(u => unidades.add(u));
});

document.getElementById("totalUnidades").innerText = unidades.size;

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
// ✅ FILTRO REAL (IMPORTANTE)
// ==========================
function esReal(p) {
  return p.brigada && p.ambulancia === "Si asiste";
}

let partesReales = partes.filter(esReal);

// ==========================
// 🎛 FILTROS
// ==========================
let mesFiltro = document.getElementById("filtroMes").value;
let anioFiltro = document.getElementById("filtroAnio").value;

let filtrados = partesReales.filter(p => {

  if (!p.fecha) return false;

  let f = p.fecha.split("-");
  let anio = f[0];
  let mes = f[1];

  if (mesFiltro && mes !== mesFiltro) return false;
  if (anioFiltro && anio !== anioFiltro) return false;

  return true;
});

// ✅ LOG correcto (fuera del filter)
console.log("FILTRADOS:", filtrados);

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

let porMes = {};
filtrados.forEach(p => {
  let m = p.fecha.split("-")[1];
  porMes[m] = (porMes[m] || 0) + 1;
});

let porFaena = contar(filtrados, "faena");
let porTipo = contar(filtrados, "tipo");
let porSubtipo = contar(filtrados, "subtipo");
let porEmpresa = contar(filtrados, "empresa");
let porPUE = contar(filtrados, "pue");

// ==========================
// 📈 CREAR GRÁFICOS
// ==========================
function crear(id, datos, tipo = "bar", color = "#3b82f6", horizontal = false) {

  let canvas = document.getElementById(id);
  if (!canvas) return;

  // 🔥 si no hay datos → no dibuja
  if (Object.keys(datos).length === 0) {
    console.warn("⚠️ sin datos para:", id);
    return;
  }

  new Chart(canvas, {
    type,
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

crear("graficoMes", porMes);
crear("graficoFaena", porFaena, "pie");
crear("graficoTipo", porTipo, "bar", "#ef4444");
crear("graficoSubtipo", porSubtipo, "bar", "#f59e0b");
crear("graficoEmpresa", porEmpresa, "bar", "#8b5cf6");
crear("graficoPUE", porPUE, "bar", "#10b981", true);

// ==========================
// 🔘 BOTONES
// ==========================
function verBrigada() {

  let datos = contar(partesReales, "brigada");
  alert(JSON.stringify(datos, null, 2));
}

function verMedico() {

  let datos = contar(partesReales, "servicioMedico");
  alert(JSON.stringify(datos, null, 2));
}

// ==========================
// 🔄 ACTUALIZAR
// ==========================
document.getElementById("actualizar").onclick = () => location.reload();

document.getElementById("filtroMes").onchange = () => location.reload();
document.getElementById("filtroAnio").onchange = () => location.reload();

// ==========================
// 📋 TOGGLE PARTES
// ==========================
function togglePartes() {
  let d = document.getElementById("partes");
  d.style.display = d.style.display === "none" ? "block" : "none";
}
