// Crear mapa
var map = L.map('map').setView([-33.45, -70.66], 10);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Array de lugares
var lugares = [];

// ✅ Cargar KML
fetch('mapa.kml')
  .then(res => res.text())
  .then(kmlText => {

    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, "text/xml");

    const geojson = toGeoJSON.kml(kml);

    const layer = L.geoJSON(geojson, {
      onEachFeature: function (feature, layer) {

        let nombre = "Sin nombre";

        if (feature.properties) {
          nombre = feature.properties.name || "Sin nombre";
        }

        layer.bindPopup(`<b>${nombre}</b>`);

        let coords;

        if (layer.getLatLng) {
          coords = layer.getLatLng();
        } else {
          coords = layer.getBounds().getCenter();
        }

        lugares.push({
          nombre,
          coords,
          layer
        });
      }
    }).addTo(map);

    map.fitBounds(layer.getBounds());
  });


// ✅ BUSCADOR CON RESULTADOS

const input = document.getElementById("search");

// Crear caja de resultados
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
      map.setView(l.coords, 15);
      l.layer.openPopup();
      resultBox.style.display = "none";
    };

    resultBox.appendChild(div);
  });

});
