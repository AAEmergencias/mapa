// ==========================
// 🗺️ MAPA
// ==========================
var map = L.map('map').setView([-33.45, -70.66], 10);

// Capas base
var mapaNormal = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom: 19 }
);

var mapaSatelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19 }
);

mapaNormal.addTo(map);

L.control.layers({
  "🗺️ Normal": mapaNormal,
  "🛰️ Satélite": mapaSatelite
}).addTo(map);

// ==========================
// 🎨 ICONOS
// ==========================
const iconos = {
  bombero: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/482/482266.png',
    iconSize: [35, 35]
  }),
  ruta: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30]
  }),
  general: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
    iconSize: [28, 28]
  })
};

// ==========================
// 📂 CAPAS
// ==========================
let lugares = [];

let ubicacionSeleccionada = null;
let unidadSeleccionada = null;

// ==========================
// 📥 CARGAR KML (SIN CAPAS)
// ==========================
fetch('mapa.kml')
  .then(res => res.text())
  .then(kmlText => {

    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, "text/xml");

    const geojson = toGeoJSON.kml(kml);

    const layer = L.geoJSON(geojson, {

      pointToLayer: function (feature, latlng) {

        let nombre = feature.properties?.name || "Sin nombre";

        // 👉 marcador directo
        let marker = L.marker(latlng, { icon: iconos.general });

        return marker;
      },

      onEachFeature: function (feature, layer) {

        let nombre = feature.properties?.name || "Sin nombre";

        layer.bindPopup(`<b>${nombre}</b>`);

        let coords = layer.getLatLng
          ? layer.getLatLng()
          : layer.getBounds().getCenter();

        lugares.push({ nombre, coords, layer });
      }

    }).addTo(map);

    map.fitBounds(layer.getBounds());

  });

// ==========================
// 🔎 BUSCADOR
// ==========================
const input = document.getElementById("search");
const resultBox = document.createElement("div");
resultBox.id = "results";
document.body.appendChild(resultBox);

let selectedIndex = -1;

input.addEventListener("input", function () {

  let value = this.value.toLowerCase();
  resultBox.innerHTML = "";
  selectedIndex = -1;

  if (value.length === 0) {
    resultBox.style.display = "none";
    return;
  }

  resultBox.style.display = "block";

  let encontrados = lugares.filter(l =>
    l.nombre.toLowerCase().includes(value)
  );

  encontrados.forEach((l) => {

    let div = document.createElement("div");
    div.className = "result-item";
    div.innerText = l.nombre;

    div.onclick = () => {
      map.setView(l.coords, 16);
      l.layer.openPopup();

      ubicacionSeleccionada = l;

      resultBox.style.display = "none";
    };

    resultBox.appendChild(div); // 👈 FALTABA ESTO
  });

}); // 👈 ESTE ES EL QUE TE FALTABA

// ==========================
// 🚑 UNIDADES
// ==========================
const unidades = [
  { nombre: "UIR-E", base: "Brigada La Ermita" },
  { nombre: "B1", base: " Brigada Los Bronces" },
  { nombre: "UIR-M", base: " Brigada Mina" },
  { nombre: "UIR-S", base: "Brigada Mineroducto" },
  { nombre: "B2", base: "Brigada Las Tortolas" },
  { nombre: "S1", base: "Policlínico Perez Caldera" },
  { nombre: "S2", base: "Policlínico Las Tortolas" },
  { nombre: "S3", base: "SPA 220" }
];

const listaUnidades = document.getElementById("listaUnidades");

unidades.forEach((u, i) => {

  let div = document.createElement("div");
  div.className = "unidad";

  div.innerHTML = `
  🚑 <b>${u.nombre}</b><br>
  <small>Base: ${u.base}</small><br>
  <small>Disponible (6-8)</small>
`;

  div.addEventListener("click", () => {
  unidadSeleccionada = u.nombre; // 🔥 IMPORTANTE
  abrirModalEstados();
});
  
  listaUnidades.appendChild(div);

  // 🔥 asignar coordenada (usa los puntos del mapa)
  if (lugares[i]) {
    unidadesCoords[u] = lugares[i].coords;
  }
});

// ==========================
// 📍 COORDENADAS DE UNIDADES
// ==========================
let unidadesCoords = {};

// ==========================
// 📏 DISTANCIA ENTRE PUNTOS
// ==========================
function distancia(a, b) {
  let dx = a.lat - b.lat;
  let dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

// ==========================
// 🚑 UNIDAD MÁS CERCANA
// ==========================
function unidadMasCercana(destino) {

  let mejor = null;
  let minDist = Infinity;

  unidades.forEach(u => {

    let coords = unidadesCoords[u];
    if (!coords) return;

    let d = distancia(coords, destino);

    if (d < minDist) {
      minDist = d;
      mejor = u;
    }
  });

  return mejor;
}


// ==========================
// 🚒 ESTADOS
// ==========================
const estados = {
  "6-3": "En el lugar",
  "6-7": "Situación Controlada",
  "6-8": "Disponible",
  "6-9": "Se Retira",
  "6-10": "En Base",
  "6-11": "En Panne",
  "6-12": "Sufre Colisión",
  "6-13": "Otros Trámites",
  "6-14": "Servicentro",
  "6-15": "Centro Asistencial",
  "6-18": "Ingresa a Túnel",
  "6-19": "Sale del túnel"
};

const coloresEstado = {
  "6-3": "#ff9800",
  "6-7": "#4CAF50",
  "6-8": "#2196F3",
  "6-9": "#9C27B0",
  "6-10": "#607D8B",
  "6-11": "#f44336",
  "6-12": "#b71c1c",
  "6-13": "#795548",
  "6-14": "#3F51B5",
  "6-15": "#009688",
  "6-18": "#ff5722",
  "6-19": "#8bc34a"
};

// ==========================
// 🔄 ACTUALIZAR UNIDAD
// ==========================
function actualizarEstadoUnidad(nombreUnidad, estado, nuevaBase = null, nota = "") {

  let unidadesHTML = document.querySelectorAll(".unidad");

  unidadesHTML.forEach(div => {

    if (div.innerText.includes(nombreUnidad)) {

      let baseTexto = nuevaBase 
        ? `<small>Base: ${nuevaBase}</small><br>` 
        : "";

      let notaTexto = nota 
        ? `<small>📝 ${nota}</small><br>` 
        : "";

      div.innerHTML = `
        🚑 <b>${nombreUnidad}</b><br>
        ${baseTexto}
        ${notaTexto}
        <small>${estado} - ${estados[estado]}</small>
      `;

      div.style.background = coloresEstado[estado];
    }

  });
}

// ==========================
// 🚒 CREAR INCIDENTE
// ==========================
let incidenteActivoDiv = null;

function crearIncidente(lugar) {

  let estadoActual = "6-3";
  let unidadAsignada = "Sin asignar";

  let div = document.createElement("div");
  div.className = "emergencia-card";
  
  // 🔥 guardar referencia de la emergencia activa
incidenteActivoDiv = div;

  function render() {

    div.style.background = coloresEstado[estadoActual];
    div.innerHTML = "";

    div.innerHTML = `
  <b>${lugar.nombre}</b><br>
  <small>Estado: ${estadoActual} - ${estados[estadoActual]}</small>
`;

    let selectUnidad = document.createElement("select");

    unidades.forEach(u => {
      let op = document.createElement("option");
      op.value = u.nombre;
      op.text = `${u.nombre} - ${u.base}`;
      selectUnidad.appendChild(op);
    });

    selectUnidad.onchange = (e) => {
      unidadAsignada = e.target.value;
      actualizarEstadoUnidad(unidadAsignada, estadoActual);
    };

    div.appendChild(selectUnidad);
  }

  render();

  div.onclick = () => {
    map.setView(lugar.coords, 16);
  };
}

// ==========================
// 🖱️ CLICK EN MAPA
// ==========================
map.on("click", function(e) {
  let punto = {
    nombre: "Incidente manual",
    coords: e.latlng,
    layer: L.marker(e.latlng).addTo(map)
  };
  ubicacionSeleccionada = punto;
});

// ✅ CONTROL CON TECLADO
input.addEventListener("keydown", function(e) {

  let items = document.querySelectorAll(".result-item");

  if (!items.length) return;

  if (e.key === "ArrowDown") {
    selectedIndex++;
    if (selectedIndex >= items.length) selectedIndex = 0;
    e.preventDefault();
  }

  if (e.key === "ArrowUp") {
    selectedIndex--;
    if (selectedIndex < 0) selectedIndex = items.length - 1;
    e.preventDefault();
  }

  if (e.key === "Enter") {
  if (items[selectedIndex]) {

    let seleccionado = lugares.filter(l =>
      l.nombre === items[selectedIndex].innerText
    )[0];

    if (seleccionado) {
      // ❌ antes creaba incidente automático
      // ✅ ahora solo selecciona
      ubicacionSeleccionada = seleccionado;
    }

    items[selectedIndex].click();
  }
}

  // ✅ destacar selección
  items.forEach((el, index) => {
    el.style.background = index === selectedIndex ? "#ddd" : "";
  });

});

const modal = document.getElementById("modalEmergencia");
const overlay = document.getElementById("overlay");

// ABRIR MODAL
setTimeout(() => {

  document.getElementById("btnNuevo").onclick = () => {

    if (!ubicacionSeleccionada) {
      alert("Selecciona una ubicación primero");
      return;
    }

    document.getElementById("ubicacion").value =
      ubicacionSeleccionada?.nombre || "";

    modal.style.display = "block";
    overlay.style.display = "block";

  };

}, 500);

// CERRAR
document.getElementById("cerrar").onclick = () => {
  modal.style.display = "none";
  overlay.style.display = "none";
};

// CREAR EMERGENCIA
document.getElementById("crear").onclick = () => {

  let tipo = document.getElementById("tipo").value;
  let subtipo = document.getElementById("subtipo").value;

  let cercana = unidadMasCercana(ubicacionSeleccionada.coords);

  let nueva = {
    tipo: tipo,
    subtipo: subtipo,
    ubicacion: ubicacionSeleccionada.nombre,
    unidad: cercana || "Sin unidad"
  };

  // ✅ crear paneles
  let panelNegro = crearPanelEmergencia(nueva);
  let panelRojo = crearPanelRojo(nueva, panelNegro);

  // ✅ cerrar modal (IMPORTANTE)
  modal.style.display = "none";
  overlay.style.display = "none";
};

// ==========================
// 🔽 MINIMIZAR PANEL ACTIVO (SEGURO)
// ==========================
const panelActivo = document.getElementById("panelActivo");
const headerPanel = document.getElementById("headerPanel");
const btnMinPanel = document.getElementById("minPanel");

if (btnMinPanel && panelActivo && headerPanel) {

  btnMinPanel.onclick = () => {

    panelActivo.classList.toggle("panel-min");

    if (panelActivo.classList.contains("panel-min")) {
      headerPanel.classList.add("blink");
    } else {
      headerPanel.classList.remove("blink");
    }

  };

}

// ==========================
// 🖱️ PANEL DRAG
// ==========================
let dragging = false;
let offsetX, offsetY;

const header = document.getElementById("headerPanel");

if (header && panelActivo) {
  header.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - panelActivo.offsetLeft;
    offsetY = e.clientY - panelActivo.offsetTop;
  });
}
document.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  panelActivo.style.left = (e.clientX - offsetX) + "px";
  panelActivo.style.top = (e.clientY - offsetY) + "px";
});

document.addEventListener("mouseup", () => {
  dragging = false;
});

// ==========================
// 🔒 OCULTAR PANEL AL INICIO
// ==========================
if (panelActivo) {
  panelActivo.style.display = "none";
}

// ==========================
// 🏠 MODAL BASES (PASO 4)
// ==========================
const bases = [
  "Base Mina",
  "Base 220",
  "Base Los Bronces",
  "Base Perez Caldera",
  "Base Ermita",
  "Base STP",
  "Base Tortolas",
  "Base Poli Tortolas"
];

function abrirModalBases(unidad) {

  let modal = document.createElement("div");
  modal.className = "modal-bases";

  modal.innerHTML = `
    <div class="modal-bases-content">
      <h3>🏠 Seleccionar Base</h3>
      <div class="listaBases"></div>
      <button class="cerrarBases">Cancelar</button>
    </div>
  `;

  const lista = modal.querySelector(".listaBases");

  bases.forEach(base => {
    let item = document.createElement("div");
    item.className = "estado-item";
    item.innerText = base;

item.onclick = () => {

  actualizarEstadoUnidad(unidad, "6-10", base); // 👈 PASAMOS LA BASE

  console.log(unidad + " → " + base);

  modal.remove();
};


    lista.appendChild(item);
  });

  const btnCerrar = modal.querySelector(".cerrarBases");

if (btnCerrar) {
  btnCerrar.onclick = () => {
    modal.remove();
  };
}

  document.body.appendChild(modal);
}

function abrirModalNotas(unidad, estado) {

  let modal = document.createElement("div");
  modal.className = "modal-bases";

  modal.innerHTML = `
    <div class="modal-bases-content">
      <h3>📝 Ingresar Nota</h3>

      <textarea id="notaTexto" placeholder="Ej: En reconocimiento de área..." style="width:100%; height:80px; margin-bottom:10px;"></textarea>

      <button class="guardarNota">Guardar</button>
      <button class="cerrarBases">Cancelar</button>
    </div>
  `;

  const btnGuardar = modal.querySelector(".guardarNota");
  const btnCerrar = modal.querySelector(".cerrarBases");
  const textarea = modal.querySelector("#notaTexto");

  if (btnGuardar) {
    btnGuardar.onclick = () => {

      let nota = textarea.value || "Sin detalle";

      actualizarEstadoUnidad(unidad, estado);

      console.log(unidad + " → NOTA: " + nota);

      modal.remove();
    };
  }

  if (btnCerrar) {
    btnCerrar.onclick = () => {
      modal.remove();
    };
  }

  document.body.appendChild(modal);
}

// ==========================
// 🚑 MODAL DE ESTADOS
// ==========================


function cerrarModalEstados() {
  const modal = document.getElementById("modalEstados");

  if (modal) {
    modal.style.display = "none";
  }
}
function abrirModalEstados() {

  const modal = document.getElementById("modalEstados");
  const lista = document.getElementById("listaEstadosModal");

  lista.innerHTML = "";

  Object.entries(estados).forEach(([clave, texto]) => {

    let item = document.createElement("div");
    item.className = "estado-item";
    item.innerText = `${clave} - ${texto}`;

    item.onclick = () => {

     if (clave === "6-10") {

  cerrarModalEstados();
  abrirModalBases(unidadSeleccionada);

} else if (clave === "6-13") {

  cerrarModalEstados();
  abrirModalNotas(unidadSeleccionada, clave); // 👈 NUEVO

} else {

  actualizarEstadoUnidad(unidadSeleccionada, clave);
  cerrarModalEstados();

}


    };

    lista.appendChild(item);

  });

  // ✅ 🔥 AQUI EL FIX REAL
  const btnCerrar = document.getElementById("cerrarEstados");

  if (typeof cerrarModalEstados === "function") {
  cerrarModalEstados();
}

  modal.style.display = "flex";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarModalEstados();
  }
});

// ==========================
// 🚨 CREAR PANEL EMERGENCIA
// ==========================
function crearPanelEmergencia(data) {

  const contenedor = document.getElementById("contenedorEmergencias");

  if (!contenedor) {
    console.log("❌ No existe contenedorEmergencias en HTML");
    return;
  }

  let panel = document.createElement("div");
  panel.className = "panel-emergencia";

  panel.innerHTML = `
  <div class="panel-tab">
    
    <div class="info">
      🔥 ${data.tipo}<br>
      📍 ${data.ubicacion}<br>
      🚑 ${data.unidad}
    </div>

  </div>
`;

  contenedor.appendChild(panel);

  return panel; // ✅ 🔥 ESTA LÍNEA ES LA CLAVE
}

function crearPanelRojo(data, panelNegro) {

  let panel = document.createElement("div");
  panel.className = "panel-rojo";

panel.innerHTML = `
  <div class="header-rojo">
    🚨 Emergencia Activa
    <div class="acciones">
      <button class="minRojo">–</button>
      <button class="cerrarRojo">X</button>
    </div>
  </div>

  <div class="contenido-rojo">

    <div class="bloque">
      <div class="titulo">Datos generales</div>
      <div><b>Tipo:</b> ${data.tipo}</div>
      <div><b>Ubicación:</b> ${data.ubicacion}</div>
    </div>

    <div class="bloque">
  <div class="titulo">🚑 Unidades asignadas</div>

  <div class="unidades"></div>

  <select class="selectUnidad"></select>
  <button class="btnAgregarUnidad">Agregar Unidad</button>

</div>

    <div class="bloque">
      <div class="titulo">📝 Notas</div>
      <textarea placeholder="Agregar información..."></textarea>
    </div>

    <button class="btnFinalizar">Finalizar Emergencia</button>

  </div>
`;

  // ==========================
// 🔽 LLENAR SELECT (PASO 2)
// ==========================
const select = panel.querySelector(".selectUnidad");

unidades.forEach(u => {
  let op = document.createElement("option");
  op.value = u.nombre;
  op.text = `${u.nombre} - ${u.base}`;
  select.appendChild(op);
});

  // ==========================
// ➕ AGREGAR UNIDAD (PASO 3)
// ==========================
const contenedorUnidades = panel.querySelector(".unidades");

panel.querySelector(".btnAgregarUnidad").onclick = () => {

  let nombreUnidad = select.value;

  let unidadData = unidades.find(u => u.nombre === nombreUnidad);

  let div = document.createElement("div");
  div.className = "unidad-asignada";

  div.innerHTML = `
    🚑 <b>${unidadData.nombre}</b><br>
    <small>${unidadData.base}</small>
  `;

  contenedorUnidades.appendChild(div);

  // 🔥 cambia estado a en servicio
  actualizarEstadoUnidad(unidadData.nombre, "6-3");
};

  // ✅ CERRAR
  panel.querySelector(".cerrarRojo").onclick = () => {
    panel.remove();
    if (panelNegro) panelNegro.remove();
  };

  // ✅ FINALIZAR (cierra ambos)
  panel.querySelector(".btnFinalizar").onclick = () => {
    panel.remove();
    if (panelNegro) panelNegro.remove();
  };

  // ✅ MINIMIZAR + PARPADEO
  const header = panel.querySelector(".header-rojo");
  const btnMin = panel.querySelector(".minRojo");

  btnMin.onclick = () => {
    panel.classList.toggle("minimizado");

    if (panel.classList.contains("minimizado")) {
      header.classList.add("blink");
    } else {
      header.classList.remove("blink");
    }
  };

  // ✅ DRAG (MOVER PANEL)
  let dragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    panel.style.left = (e.clientX - offsetX) + "px";
    panel.style.top = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  document.body.appendChild(panel);

  return panel;
}
