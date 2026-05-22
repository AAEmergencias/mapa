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
  "Brigada La Ermita G21-G245",
  "Brigada Los Bronces (Planta)",
  "Brigada Mina LB",
  "Brigada Mineroducto",
  "Brigada Las Tortolas",
  "Sala Primeros Auxilios Perez Caldera",
  "Policlinico 220",
  "Policlinico Las Tortolas"
];

const listaUnidades = document.getElementById("listaUnidades");

unidades.forEach((u, i) => {

  let div = document.createElement("div");
  div.className = "unidad";

  div.innerHTML = `🚑 <b>${u}</b><br><small>Disponible (6-8)</small>`;

  div.addEventListener("click", () => {
  unidadSeleccionada = u;
  mostrarEstadosLateral();
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
function actualizarEstadoUnidad(nombreUnidad, estado) {

  let unidadesHTML = document.querySelectorAll(".unidad");

  unidadesHTML.forEach(div => {

    if (div.innerText.includes(nombreUnidad)) {

      div.innerHTML = `
        🚑 <b>${nombreUnidad}</b><br>
        <small>${estado} - ${estados[estado]}</small>
      `;

      div.style.background = coloresEstado[estado];
    }

  });
}

// ==========================
// 🚒 CREAR INCIDENTE
// ==========================
const panelEmergencias = document.getElementById("listaEmergencias");
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
      op.value = u;
      op.text = u;
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

  panelEmergencias.prepend(div);
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

  let incidente = {
    nombre: `${tipo} - ${subtipo}`,
    coords: ubicacionSeleccionada.coords,
    layer: ubicacionSeleccionada.layer
  };

  crearIncidente(incidente);

// ✅ MOSTRAR PANEL
panelActivo.style.display = "block";


// 🔥 AUTO-ASIGNACIÓN
let cercana = unidadMasCercana(ubicacionSeleccionada.coords);

// ✅ MOSTRAR EN PANEL ACTIVO
document.getElementById("pTipo").innerText = tipo;
document.getElementById("pSubtipo").innerText = subtipo;
document.getElementById("pUbicacion").innerText = ubicacionSeleccionada.nombre;

if (cercana) {
  document.getElementById("pUnidades").innerText = cercana;
  actualizarEstadoUnidad(cercana, "6-3");
}


  modal.style.display = "none";
  overlay.style.display = "none";
};

// ==========================
// 🔽 MINIMIZAR PANEL ACTIVO
// ==========================
const panelActivo = document.getElementById("panelActivo");
const headerPanel = document.getElementById("headerPanel");

document.getElementById("minPanel").onclick = () => {

  panelActivo.classList.toggle("panel-min");

  // 🔴 PARPADEO
  if (panelActivo.classList.contains("panel-min")) {
    headerPanel.classList.add("blink");
  } else {
    headerPanel.classList.remove("blink");
  }
};

// ==========================
// ✅ FINALIZAR EMERGENCIA
// ==========================
document.getElementById("btnFinalizar").onclick = () => {

  // ✅ eliminar tarjeta del panel
  if (incidenteActivoDiv) {
    incidenteActivoDiv.remove();
    incidenteActivoDiv = null;
  }

  // ✅ limpiar panel activo
  document.getElementById("pTipo").innerText = "";
  document.getElementById("pSubtipo").innerText = "";
  document.getElementById("pUbicacion").innerText = "";
  document.getElementById("pUnidades").innerText = "";
  document.getElementById("pNotas").value = "";

  // ✅ ocultar panel
  panelActivo.style.display = "none";

};
// ==========================
// 🖱️ PANEL DRAG
// ==========================
let dragging = false;
let offsetX, offsetY;

const header = document.getElementById("headerPanel");

header.addEventListener("mousedown", (e) => {
  dragging = true;
  offsetX = e.clientX - panelActivo.offsetLeft;
  offsetY = e.clientY - panelActivo.offsetTop;
});

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
panelActivo.style.display = "none";



function mostrarEstadosLateral() {

  const panel = document.getElementById("panelEstados");

  if (!panel) return;

  panel.innerHTML = `<b>Estado unidad:</b><br>${unidadSeleccionada}<br><br>`;

  Object.entries(estados).forEach(([clave, texto]) => {

    let item = document.createElement("div");
    item.className = "estado-item";
    item.innerText = `${clave} - ${texto}`;

    item.onclick = () => {

      actualizarEstadoUnidad(unidadSeleccionada, clave);

      panel.style.display = "none";
    };

    panel.appendChild(item);
  });

  panel.style.display = "block";
}
