// ==========================
// 🗺️ MAPA
// ==========================
var map = L.map('map').setView([-33.45, -70.66], 10);

// Base maps
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
// 📂 CAPAS + PANEL
// ==========================
let capas = {};
let capasActivas = {};
let listaCapasDiv = document.getElementById("listaCapas");

// ==========================
// 🔍 DATOS BUSCADOR
// ==========================
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

        // Crear capa si no existe
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

        // Icono según carpeta
        let texto = folder.toLowerCase();
        let icono = iconos.general;

        if (texto.includes("compañ") || texto.includes("bombero")) {
          icono = iconos.bombero;
        } else if (texto.includes("ruta") || texto.includes("camino")) {
          icono = iconos.ruta;
        }

        let marker = L.marker(latlng, { icon: icono });

        capas[folder].addLayer(marker);

        // contador
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

        let coords;

        if (layer.getLatLng) coords = layer.getLatLng();
        else coords = layer.getBounds().getCenter();

        lugares.push({ nombre, coords, layer });
      }

    });

    layer.addTo(map);
    map.fitBounds(layer.getBounds());

  });


// ==========================
// 🔎 BUSCADOR
// ==========================
const input = document.getElementById("search");

const resultBox = document.createElement("div");
resultBox.id = "results";
document.body.appendChild(resultBox);

input.addEventListener("input", function () {

  let value = this.value.toLowerCase();
  resultBox.innerHTML = "";

  if (value.length === 0) {
    resultBox.style.display = "none";
    return;
  }

  resultBox.style.display = "block";

  let encontrados = lugares.filter(l =>
    l.nombre.toLowerCase().includes(value)
  );

  encontrados.forEach(l => {

    let div = document.createElement("div");
    div.className = "result-item";
    div.innerText = l.nombre;

    div.onclick = () => {
      map.setView(l.coords, 16);
      l.layer.openPopup();
      resultBox.style.display = "none";
    };

    resultBox.appendChild(div);
  });

});

// ==========================
// 🚒 SISTEMA DE DESPACHO
// ==========================

const panelIncidentes = document.getElementById("listaIncidentes");

function crearIncidente(lugar) {

  let div = document.createElement("div");
  div.className = "incidente";

  div.innerHTML = `
    <b>${lugar.nombre}</b><br>
    <button>Despachar</button>
  `;

  // CLICK EN INCIDENTE
  div.onclick = () => {
    map.setView(lugar.coords, 17);
    lugar.layer.openPopup();
  };

  // BOTÓN DESPACHAR
  let boton = div.querySelector("button");

  boton.onclick = (e) => {
    e.stopPropagation();

    div.classList.add("incidente-atendido");

    // cambiar icono temporal
    if (lugar.layer.setIcon) {
      lugar.layer.setIcon(L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
        iconSize: [35, 35]
      }));
    }
  };

  panelIncidentes.appendChild(div);
}

// ==========================
// 🔥 GENERAR INCIDENTES AUTOMÁTICOS
// ==========================

// Crear algunos incidentes de prueba
setTimeout(() => {

  for (let i = 0; i < Math.min(5, lugares.length); i++) {
    crearIncidente(lugares[i]);
  }

}, 2000);

