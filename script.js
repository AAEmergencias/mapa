// Crear mapa centrado en Chile
var map = L.map('map').setView([-33.45, -70.66], 10);

// Capa base liviana (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);


// Variable para guardar puntos
var lugares = [];

// Cargar KML desde tu repo
var kmlLayer = omnivore.kml('doc.kml')
  .on('ready', function() {

    map.fitBounds(kmlLayer.getBounds());

    kmlLayer.eachLayer(function(layer) {
      
      if (layer.feature && layer.feature.properties) {

        let nombre = layer.feature.properties.name || "Sin nombre";
        let coords = layer.getLatLng();

        lugares.push({
          nombre: nombre,
          coords: coords,
          layer: layer
        });

        layer.bindPopup(`<b>${nombre}</b>`);
      }

    });

  })
  .addTo(map);


// 🔍 Buscador
document.getElementById("search").addEventListener("input", function() {

  var texto = this.value.toLowerCase();

  lugares.forEach(lugar => {

    if (lugar.nombre.toLowerCase().includes(texto)) {
      lugar.layer.addTo(map);

      if (texto.length > 2) {
        map.setView(lugar.coords, 15);
        lugar.layer.openPopup();
      }

    } else {
      map.removeLayer(lugar.layer);
    }

  });

});
