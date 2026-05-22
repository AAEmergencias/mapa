// ==========================
// 🗺️ CREAR MAPA
// ==========================
var map = L.map('map').setView([-33.45, -70.66], 10);

// 🌍 Mapa normal
var mapaNormal = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom: 19 }
);

// 🛰️ Satelital
var mapaSatelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19 }
);

// Activar mapa base
mapaNormal.addTo(map);

// Control de capas base
L.control.layers({
  "🗺️ Normal": mapaNormal,
  "🛰️ Satélite": mapaSatelite
}).addTo(map);

// ==========================
// 🎨 ICONOS
// ==========================
var iconoBombero = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/482/482266.png',
  iconSize: [35, 35]
});

var iconoRuta = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30]
});

var iconoGeneral = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [28, 28]
});

// ==========================
// 📂 CAPAS (FILTROS)
// ==========================
var capaBomberos = L.layerGroup().addTo(map);
var capaRutas = L.layerGroup().addTo(map);
var capaOtros = L.layerGroup().addTo(map);

// Control visible para activar/desactivar
L.control.layers(null, {
  "🚒 Bomberos": capaBomberos,
  "🛣️ Rutas": capaRutas,
  "📍 Otros": capaOtros
}).addTo(map);

// ==========================
// 🔍 BUSCADOR DATA
// ==========================
var lugares = [];

// ==========================
// 📥 CARGAR KML
// ==========================
fetch('mapa.kml')
  .then(res => res.text())
  .then(kmlText => {

    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, "text/xml");

    const geojson = toGeoJSON.kml(kml);

    // ✅ AQUÍ ESTÁ EL FIX DE LOS ICONOS
    const layer = L.geoJSON(geojson, {

      pointToLayer: function (feature, latlng) {

        let nombre = feature.properties?.name || "";

        let icono = iconoGeneral;
        let capa = capaOtros;

        let texto = nombre.toLowerCase();

        // 🔍 DETECCIÓN (puedes ajustar después)
        if (texto.includes("compañ") || texto.includes("bombero")) {
          icono = iconoBombero;
          capa = capaBomberos;

        } else if (texto.includes("ruta") || texto.includes("camino")) {
          icono = iconoRuta;
          capa = capaRutas;
        }

        let marker = L.marker(latlng, { icon: icono });

        // ✅ IMPORTANTE: AGREGAR A CAPA
        capa.addLayer(marker);

        return marker;
      },

      onEachFeature: function (feature, layer) {

        let nombre = feature.properties?.name || "Sin nombre";

        layer.bindPopup(`<b>${nombre}</b>`);

        let coords;

        if (layer.getLatLng) {
          coords = layer.getLatLng();
        } else if (layer.getBounds) {
          coords = layer.getBounds().getCenter();
        }

        lugares.push({
          nombre,
          coords,
          layer
        });
      }

    });

    // ✅ AGREGAR AL MAPA
    layer.addTo(map);

    // ✅ AJUSTAR VISTA
    map.fitBounds(capaOtros.getBounds());

  });


// ==========================
// 🔎 BUSCADOR PRO
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
