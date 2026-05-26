console.log("✅ admin.js funcionando");

// ==========================
// 📦 CARGAR HISTORIAL
// ==========================
let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];

console.log("📊 Datos:", historial);

// ==========================
// 📊 KPI TOTAL
// ==========================
document.getElementById("total").innerText = historial.length;

// ==========================
// 📅 ÚLTIMOS 15 DÍAS
// ==========================
let hoy = new Date();

let ultimos15 = historial.filter(e => {

  if (!e.fecha) return false;

  let partes = e.fecha.includes("/")
    ? e.fecha.split("/")
    : e.fecha.split("-");

  if (partes.length !== 3) return false;

  let fecha = new Date(
    parseInt(partes[2]),
    parseInt(partes[1]) - 1,
    parseInt(partes[0])
  );

  let diff = (hoy - fecha) / (1000 * 60 * 60 * 24);

  return diff <= 15;
});


  let porEmpresa = {};

partes.forEach(p => {
  if (!p.empresa) return;
  porEmpresa[p.empresa] = (porEmpresa[p.empresa] || 0) + 1;
});

new Chart(document.getElementById("graficoEmpresa"), {
  type: "bar",
  data: {
    labels: Object.keys(porEmpresa),
    datasets: [{
      label: "Empresas",
      data: Object.values(porEmpresa),
      backgroundColor: "#8b5cf6"
    }]
  }
});

  let porPUE = {};

partes.forEach(p => {
  if (!p.pue) return;
  porPUE[p.pue] = (porPUE[p.pue] || 0) + 1;
});

new Chart(document.getElementById("graficoPUE"), {
  type: "bar",
  data: {
    labels: Object.keys(porPUE),
    datasets: [{
      label: "PUE",
      data: Object.values(porPUE),
      backgroundColor: "#10b981"
    }]
  },
  options: {
    indexAxis: 'y'
  }
});
  

  if (partes.length !== 3) return false;

  let fecha = new Date(
    parseInt(partes[2]),
    parseInt(partes[1]) - 1,
    parseInt(partes[0])
  );

  let diff = (hoy - fecha) / (1000 * 60 * 60 * 24);

// mostrar contador
document.getElementById("ultimosCount").innerText = ultimos15.length;

// ==========================
// 🚑 UNIDADES UTILIZADAS
// ==========================
let unidadesSet = new Set();

historial.forEach(e => {
  if (!e.unidades) return;
  e.unidades.forEach(u => unidadesSet.add(u));
});

document.getElementById("totalUnidades").innerText = unidadesSet.size;

// ==========================
// 📈 GRÁFICO POR TIPO
// ==========================
let conteoTipos = {};

historial.forEach(e => {
  if (!e.tipo) return;
  conteoTipos[e.tipo] = (conteoTipos[e.tipo] || 0) + 1;
});

new Chart(document.getElementById("graficoTipos"), {
  type: "bar",
  data: {
    labels: Object.keys(conteoTipos),
    datasets: [{
      label: "Emergencias",
      data: Object.values(conteoTipos),
      backgroundColor: "#ef4444"
    }]
  }
});

// ==========================
// 📅 RENDER ÚLTIMOS 15
// ==========================
let div15 = document.getElementById("ultimos15");

if (ultimos15.length === 0) {
  div15.innerHTML = "No hay emergencias recientes";
} else {
  ultimos15.slice().reverse().forEach(e => {
    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      #${e.id} - ${e.tipo} (${e.subtipo})<br>
      📍 ${e.ubicacion}<br>
      📅 ${e.fecha}
    `;

    div15.appendChild(div);
  });
}

// ==========================
// 📂 HISTORIAL COMPLETO
// ==========================
let divHist = document.getElementById("historial");

if (historial.length === 0) {
  divHist.innerHTML = "No hay emergencias registradas";
} else {
  historial.slice().reverse().forEach(e => {
    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      #${e.id} - ${e.tipo}<br>
      📍 ${e.ubicacion}<br>
      📅 ${e.fecha}
    `;

    divHist.appendChild(div);
  });
}

document.getElementById("resetBtn").onclick = () => {

  // 🔑 PEDIR CLAVE
  let clave = prompt("Ingrese clave de administrador:");

  if (clave !== "1234") {
    alert("❌ Clave incorrecta");
    return;
  }

  // ⚠️ CONFIRMAR
  let confirmar = confirm("Esto eliminará TODO el historial y dejará el dashboard en 0 ¿Continuar?");
  if (!confirmar) return;

  // 🧹 BORRAR LOCALSTORAGE
  localStorage.removeItem("historialEmergencias");

  // 🧠 LIMPIAR DATOS EN MEMORIA
  historial = [];

  // 📊 RESETEAR KPIs
  document.getElementById("total").innerText = 0;
  document.getElementById("ultimosCount").innerText = 0;
  document.getElementById("totalUnidades").innerText = 0;

  // 📅 LIMPIAR BITÁCORA
  document.getElementById("ultimos15").innerHTML = "Sin datos";

  // 📂 LIMPIAR HISTORIAL
  document.getElementById("historial").innerHTML = "Sin datos";

  // 📈 LIMPIAR GRÁFICO
  if (window.miGrafico) {
    window.miGrafico.destroy();
  }

window.miGrafico = new Chart(document.getElementById("graficoTipos"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Emergencias",
        data: [],
        backgroundColor: "#ef4444"
      }]
    }
  });

  alert("✅ Dashboard reiniciado correctamente");
};

let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

console.log("📋 Partes:", partes);

let divPartes = document.getElementById("partes");

divPartes.innerHTML = "";

if (partes.length === 0) {
  divPartes.innerHTML = "Sin partes cerrados";
} else {

  partes.slice().reverse().forEach(p => {

    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      📅 ${p.fecha || "-"}<br>
      🚒 ${p.tipo || "-"} - ${p.subtipo || "-"}<br>
      📍 ${p.lugar || "-"}<br>
      👤 ${p.operador || "-"}
    `;

    divPartes.appendChild(div);
  });
}

document.getElementById("exportarPartes").onclick = () => {

  let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

  if (partes.length === 0) {
    alert("No hay partes");
    return;
  }

  // ✅ CABECERA COMPLETA
  let csv = "N°;Fecha;Hora activación;Hora levantamiento;Tipo;Subtipo;Descripción del evento;Lugar;Comuna;Faena;Empresa Afectada;Faena / Comunidad;Brigada;Vehículo;Ambulancia;Servicio Médico;Existe atención;Cantidad pacientes;Clave;Tipo atención;PUE;Descripción PUE;Operador\n";

  partes.forEach((p, index) => {

    csv += `${index + 1};`
      + `${p.fecha || ""};`
      + `${p.horaActivacion || ""};`
      + `${p.horaCierre || ""};`
      + `${p.tipo || ""};`
      + `${p.subtipo || ""};`
      + `"${p.descripcion || ""}";`
      + `${p.lugar || ""};`
      + `${p.comuna || ""};`
      + `${p.faena || ""};`
      + `${p.empresa || ""};`
      + `${p.impacto || ""};`
      + `${p.brigada || ""};`
      + `${p.vehiculo || ""};`
      + `${p.ambulancia || ""};`
      + `${p.servicioMedico || ""};`
      + `${p.existeAtencion || ""};`
      + `${p.pacientes || "0"};`
      + `${p.clave || ""};`
      + `${p.tipoAtencion || ""};`
      + `${p.pue || ""};`
      + `"${p.descripcionPue || ""}";`
      + `${p.operador || ""}\n`;

  });

  // ✅ CREAR ARCHIVO
  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "partes_emergencia_completo.csv";

  link.click();
};

document.getElementById("actualizar").onclick = () => {
  location.reload();
};

function togglePartes() {
  let div = document.getElementById("partes");

  if (div.style.display === "none") {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}

document.getElementById("totalPartes").textContent = partes.length;

function esReal(p) {
  return p.brigada && p.ambulancia === "Si asiste";
}
let partesReales = partes.filter(esReal);

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

let porMes = {};

filtrados.forEach(p => {
  let mes = p.fecha.split("-")[1];
  porMes[mes] = (porMes[mes] || 0) + 1;
});

let porFaena = {};

filtrados.forEach(p => {
  porFaena[p.faena] = (porFaena[p.faena] || 0) + 1;
});

let porTipo = {};

filtrados.forEach(p => {
  porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
});

let porSubtipo = {};

filtrados.forEach(p => {
  porSubtipo[p.subtipo] = (porSubtipo[p.subtipo] || 0) + 1;
});

let porEmpresa = {};

filtrados.forEach(p => {
  porEmpresa[p.empresa] = (porEmpresa[p.empresa] || 0) + 1;
});

let porPUE = {};

filtrados.forEach(p => {
  porPUE[p.pue] = (porPUE[p.pue] || 0) + 1;
});


ffiltrados.forEach(p => {

function verBrigada() {

  let datos = {};

  partesReales.forEach(p => {
    if (!p.brigada) return;

    datos[p.brigada] = (datos[p.brigada] || 0) + 1;
  });

  alert(JSON.stringify(datos, null, 2));
}

function verMedico() {

  let datos = {};

  partesReales.forEach(p => {
    if (!p.servicioMedico) return;

    datos[p.servicioMedico] = (datos[p.servicioMedico] || 0) + 1;
  });

  alert(JSON.stringify(datos, null, 2));
}
