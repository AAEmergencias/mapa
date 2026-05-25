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

let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

console.log("📋 Partes:", partes);

let divPartes = document.getElementById("partes");

if (partes.length === 0) {
  divPartes.innerHTML = "Sin partes cerrados";
} else {

  partes.slice().reverse().forEach(p => {

    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      📅 ${p.fecha}<br>
      🚒 ${p.tipo} - ${p.subtipo}<br>
      📍 ${p.lugar}<br>
      👤 ${p.operador}
    `;

    divPartes.appendChild(div);
  });
}
