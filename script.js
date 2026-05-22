var map = L.map('map').setView([-33.45, -70.66], 10);

// mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

var lugares = [];

// ✅ CARGAR KML REAL
fetch('Central Emergencias OFICIAL NO BORRAR.kml')
  .then(res => res.text())
  .then(kmlText => {

    // parsear XML
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, "text/xml");

    // convertir a GeoJSON
    const geojson = toGeoJSON.kml(kml);

    // dibujar en mapa
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
        } else if (layer.getBounds) {
          coords = layer.getBounds().getCenter();
        }

        if (coords) {
          lugares.push({
            nombre: nombre,
            coords: coords,
            layer: layer
          });
        }
      }

    }).addTo(map);

    map.fitBounds(layer.getBounds());

  });


// 🔍 BUSCADOR
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
      map.setView(l.coords, 15);
      l.layer.openPopup();
      resultBox.style.display = "none";
    };

    resultBox.appendChild(div);
  });

});
``
