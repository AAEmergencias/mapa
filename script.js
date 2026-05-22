var map = L.map('map').setView([-33.45, -70.66], 10);

// mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

var lugares = [];

// cargar KML
omnivore.kml('Central Emergencias OFICIAL NO BORRAR.kml')
  .on('ready', function () {

    map.fitBounds(this.getBounds());

    this.eachLayer(function (layer) {

      if (layer.feature && layer.feature.properties) {

        let nombre = layer.feature.properties.name || "Sin nombre";
        let coords = layer.getLatLng();

        layer.bindPopup(`<b>${nombre}</b>`);

        lugares.push({
          nombre,
          coords,
          layer
        });

      }

    });

  })
  .addTo(map);


// 🔍 BUSCADOR CON RESULTADOS
const input = document.getElementById("search");

// crear contenedor de resultados
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
