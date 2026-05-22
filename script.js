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
let capas = {};
let capasActivas = {};
let listaCapasDiv = document.getElementById("listaCapas");

let lugares = [];

// ==========================
// 📥 CARGAR KML
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
        let folder = feature.properties?.folder || "Otros";

        if (!capas[folder]) {
          capas[folder] = L.layerGroup().addTo(map);
          capasActivas[folder] = true;

          let div = document.createElement("div");
          div.className = "capa-item capa-activa";
          div.innerHTML = `<span>${folder}</span><span id="count-${folder}">0</span>`;

          div.onclick = () => {
            capasActivas[folder] = !capasActivas[folder];

            if (capasActivas[folder]) {
              map.addLayer(capas[folder]);
              div.classList.add("capa-activa");
              map.fitBounds(capas[folder].getBounds());
            } else {
              map.removeLayer(capas[folder]);
              div.classList.remove("capa-activa");
            }
          };

          listaCapasDiv.appendChild(div);
        }

        let texto = folder.toLowerCase();
        let icono = iconos.general;

        if (texto.includes("compañ") || texto.includes("bombero")) {
          icono = iconos.bombero;
        } else if (texto.includes("ruta") || texto.includes("camino")) {
          icono = iconos.ruta;
        }

        let marker = L.marker(latlng, { icon: icono });

        capas[folder].addLayer(marker);

        let contador = document.getElementById(`count-${folder}`);
        if (contador) {
          contador.innerText = capas[folder].getLayers().length;
        }

        return marker;
      },

      onEachFeature: function (feature, layer) {

        let nombre = feature.properties?.name || "Sin nombre";
        let folder = feature.properties?.folder || "Otros";

        layer.bindPopup(`
          <b>${nombre}</b><br>
          <small>${folder}</small>
        `);

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

  // ✅ SOLO SELECCIONA (NO CREA INCIDENTE)
  let ubicacionSeleccionada = null;

  resultBox.style.display = "none";
};

});

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

unidades.forEach(u => {
  let div = document.createElement("div");
  div.className = "unidad";
  div.innerHTML = `🚑 <b>${u}</b><br><small>Disponible (6-8)</small>`;
  listaUnidades.appendChild(div);
});

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
const panelIncidentes = document.getElementById("listaIncidentes");

function crearIncidente(lugar) {

  let estadoActual = "6-3";
  let unidadAsignada = "Sin asignar";

  let div = document.createElement("div");
  div.className = "incidente";

  function render() {

    div.style.background = coloresEstado[estadoActual];
    div.innerHTML = "";

    div.innerHTML += `<b>${lugar.nombre}</b><br>`;
    div.innerHTML += `<small>${estadoActual} - ${estados[estadoActual]}</small><br>`;

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

  panelIncidentes.prepend(div);
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

 const unidadSelect = document.getElementById("unidadSelect");

unidades.forEach(u => {
  let op = document.createElement("option");
  op.value = u;
  op.text = u;
  unidadSelect.appendChild(op);
});

  document.getElementById("btnDespachar").onclick = () => {

  if (!ubicacionSeleccionada) {
    alert("Selecciona una ubicación primero");
    return;
  }

  let tipo = document.getElementById("tipo").value;
  let subtipo = document.getElementById("subtipo").value;
  let unidad = document.getElementById("unidadSelect").value;

  let incidente = {
    nombre: `${tipo} - ${subtipo}`,
    coords: ubicacionSeleccionada.coords,
    layer: ubicacionSeleccionada.layer
  };

  crearIncidente(incidente);

  actualizarEstadoUnidad(unidad, "6-3");
};

