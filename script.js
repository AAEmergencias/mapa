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

// ==========================f
// 🎨 ICONOS
// ==========================
const iconos = {

  // 📍 PIN NORMAL
  general: new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41]
  }),

  // 🔴 EMERGENCIA
  emergencia: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),

  // 🔵 BASE
  base: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
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

  let icono = iconos.general;

  // 🔵 SI ES BASE
  if (nombre.toLowerCase().includes("base")) {
    icono = iconos.base;
  }

  // 🔴 SI ES EMERGENCIA
  if (nombre.toLowerCase().includes("emergencia")) {
    icono = iconos.emergencia;
  }

  let marker = L.marker(latlng, { icon: icono });

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

const titulo = document.getElementById("titulo");

if (titulo) {
  titulo.style.cursor = "pointer"; // 👈 para que se vea clickeable

  titulo.onclick = () => {

  // ✅ volver al mapa inicial
  map.setView([-33.45, -70.66], 10);

  // ✅ cerrar modales abiertos
  cerrarModalEstados();

  document.querySelectorAll(".modal-bases").forEach(m => m.remove());

};
}



// ==========================
// 🚑 UNIDADES
// ==========================
const unidades = [
  { nombre: "UIR-E / Ermita", base: "Brigada La Ermita" },
  { nombre: "B1 / Bronces", base: " Brigada Los Bronces" },
  { nombre: "UIR-M / Mina", base: " Brigada Mina" },
  { nombre: "UIR-S / STP", base: "Brigada Mineroducto" },
  { nombre: "B2 / Tórtolas", base: "Brigada Las Tortolas" },
  { nombre: "S1 / Pérez Caldera", base: "Policlínico Perez Caldera" },
  { nombre: "S2 / Poli Tórtolsa", base: "Policlínico Las Tortolas" },
  { nombre: "S3 / 220", base: "SPA 220" }
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
  "6-T": "En Trayecto",
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
  "6-T": "#FFC107", // amarillo tipo tránsito
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

const subtiposPorTipo = {

  "Incendio": [
    "Amago de incendio equipos mineros",
    "Amago de incendio en vehículos pesados",
    "Amago de incendio en vehículos livianos",
    "Amago de incendio instalaciones industriales",
    "Incendio en equipos mineros",
    "Incendio en vehículos pesado",
    "Incendio en vehículos livianos",
    "Incendio instalaciones",
    "Incendio fuera de las instalaciones",
    "Incendio Forestal",
    "Pastizales y/o Basura"
  ],

  "Vehicular": [
    "Choque equipos mineros",
    "Choque vehículos pesados",
    "Choque vehículos livianos",
    "Choque vehículos pesados fuera de las instalaciones",
    "Choque vehículos livianos fuera de las instalaciones",
    "Desbarrancamiento equipos mineros",
    "Desbarrancamiento vehículos pesados",
    "Desbarrancamiento vehículos livianos",
    "Desbarrancamiento vehículos pesados fuera de las intalaciones",
    "Desbarrancamiento vehículos livianos fuera de las instalaciones",
    "Colisión equipo minero",
    "Colisión vehículos pesados",
    "Colisión vehícculos livianos",
    "Colisión vehículos pesados fuera de las instalaciones",
    "Colisión vehículos livanos fuera de las instalaciones",
    "Volcamiento equipo minero",
    "Volcamiento vehículos pesados",
    "Volcamiento vehículos livianos"
    "Volcamiento vehículos pesados fuera de las instalaciones",
    "Volcamiento vehículos livianos fuera de las instalaciones"
  ],

  "Rescate": [
    "Caída mismo nivel",
    "Caída diferente nivel",
    "Derrumbe",
    "Atrapamiento",
    "Perdida de conciencia",
    "Encerramiento en ascensor",
    "Rescate vertical",
    "Rescate espacio confinados",
    "Atropello",
    "Caída de particulas"
    "Otros no categorizados"
  ],

  "Medico": [
    "Problemas de salud",
    "Fractura",
    "Esguince",
    "Desmayo / Inconciente",
    "Crisis de Pánico / Ansiedad",
    "PCR",
    "Corte",
    "Perdida de memoria",
    "Otros no categorizados"
  ],

  "Hazmat": [
    "Derrame de sustancias peligrosas",
    "Fuga de sustancias peligrosas",
    "Incidente con sustancias peligrosas"
  ],

  "Simulacros": [
    "Simulacro documental/Proceso/Divicional",
    "Incendio",
    "Vehícular",
    "Rescate",
    "Hazmat",
    "Sísmico",
    "Meteorológico",
    "Geológico",
    "Ambiental",
    "Médico"
  ],

  "Sismico": [
    "Sismo leve",
    "Sismo moderado",
    "Terremoto grave"
  ],

  "Meteorologico": [
    "Tormenta eléctrica",
    "Nevadas intensas",
    "Lluvias torrenciales",
    "Ola de calor",
    "Viento blanco",
    "Aluvión",
    "Crecida de rios"
    "Inundación de instalaciones"
  ],

  "Geologico": [
    "Deslizamiento de terreno",
    "Remoción en masa",
    "Falla geotécnica",
    "Caída de rocas",
    "Inestabilidad de taludes"
  ],

  "Ambiental": [
    "Material particulado",
    "Contaminación agua",
    "Afectación flora/fauna"
  ],

  "Otros": [
    "Limpieza de rodados",
    "Activación alarma SPCI",
    "Contacto eléctrico",
    "Desperfecto mecánico Ruta G21-G245",
    "Desperfecto mecánico Ruta STP-OLB",
    "Rescate animal",
    "Olor no determinado",
    "Daño infraestructura",
    "Caída de árbol",
    "Interrupción eléctrica",
    "Otras no categorizadas"
  ]

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
  layer: L.marker(e.latlng, { icon: iconos.emergencia }).addTo(map)
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

  let panelNegro = crearPanelEmergencia(nueva);
  let panelRojo = crearPanelRojo(nueva, panelNegro);

  modal.style.display = "none";
  overlay.style.display = "none";
};

// ✅ ✅ ✅ AQUÍ VA EL PASO 3 🔥🔥🔥
const tipoSelect = document.getElementById("tipo");
const subtipoSelect = document.getElementById("subtipo");

if (tipoSelect && subtipoSelect) {

  tipoSelect.addEventListener("change", () => {

    let tipo = tipoSelect.value;

    subtipoSelect.innerHTML = '<option>Seleccione subtipo...</option>';

    if (subtiposPorTipo[tipo]) {

      subtiposPorTipo[tipo].forEach(sub => {

        let op = document.createElement("option");
        op.value = sub;
        op.text = sub;

        subtipoSelect.appendChild(op);

      });

    }

  });

}

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

      <button class="btn-rojo guardarNota">Guardar</button>
      <button class="cerrarBases">Cancelar</button>
    </div>
  `;

  const btnGuardar = modal.querySelector(".guardarNota");
  const btnCerrar = modal.querySelector(".cerrarBases");
  const textarea = modal.querySelector("#notaTexto");

  if (btnGuardar) {
    btnGuardar.onclick = () => {

      let nota = textarea.value || "Sin detalle";

     actualizarEstadoUnidad(unidad, estado, null, nota);

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

function abrirConfirmacionFinalizar(panel, panelNegro) {

  let modal = document.createElement("div");
  modal.className = "modal-bases";

  modal.innerHTML = `
    <div class="modal-bases-content">
      <h3>⚠️ Confirmar acción</h3>

      <p>¿Seguro que deseas finalizar la emergencia?</p>

      <button class="btnConfirmar">FINALIZAR</button>
      <button class="cerrarBases">CANCELAR</button>
    </div>
  `;

  const btnConfirmar = modal.querySelector(".btnConfirmar");
  const btnCancelar = modal.querySelector(".cerrarBases");

  if (btnConfirmar) {
    btnConfirmar.onclick = () => {

      // ✅ cerrar panel rojo
      if (panel) panel.remove();

      // ✅ cerrar panel negro
      if (panelNegro) panelNegro.remove();

      modal.remove();
    };
  }

  if (btnCancelar) {
    btnCancelar.onclick = () => {
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
  abrirModalNotas(unidadSeleccionada, clave);

} else if (clave === "6-15") {

  cerrarModalEstados();
  abrirModalNotas(unidadSeleccionada, clave); // 👈 MISMA LÓGICA

} else {

  actualizarEstadoUnidad(unidadSeleccionada, clave);
  cerrarModalEstados();

}

    };

    lista.appendChild(item);

  });

  
// ✅ 🔥 ESTE ES EL PASO CLAVE
  const btnCerrar = document.getElementById("cerrarEstados");

  if (btnCerrar) {
    btnCerrar.onclick = () => {
      cerrarModalEstados();
    };
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
  let unidadesAsignadas = [];

panel.querySelector(".btnAgregarUnidad").onclick = () => {

  let nombreUnidad = select.value;

  let unidadData = unidades.find(u => u.nombre === nombreUnidad);

  if (!unidadData) return;

  // ✅ evitar duplicados
  if (!unidadesAsignadas.includes(nombreUnidad)) {
    unidadesAsignadas.push(nombreUnidad);
  }

  let div = document.createElement("div");
  div.className = "unidad-asignada";

  div.innerHTML = `
    🚑 <b>${unidadData.nombre}</b><br>
    <small>${unidadData.base}</small>
  `;

  contenedorUnidades.appendChild(div);

  // ✅ actualizar estado
  actualizarEstadoUnidad(unidadData.nombre, "6-T");

  // 🔥 ✅ ACTUALIZAR PANEL NEGRO
  if (panelNegro) {
    panelNegro.querySelector(".info").innerHTML = `
      🔥 ${data.tipo}<br>
      📍 ${data.ubicacion}<br>
      🚑 ${unidadesAsignadas.join(", ")}
    `;
  }

};

  // ✅ CERRAR
  panel.querySelector(".cerrarRojo").onclick = () => {
    panel.remove();
    if (panelNegro) panelNegro.remove();
  };

  // ✅ FINALIZAR (cierra ambos)
panel.querySelector(".btnFinalizar").onclick = () => {
  abrirConfirmacionFinalizar(panel, panelNegro);
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
