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

  encontrados.forEach((l, index) => {

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
      items[selectedIndex].click();
    }
  }

  // ✅ destacar selección
  items.forEach((el, index) => {
    el.style.background = index === selectedIndex ? "#ddd" : "";
  });

});



// ==========================
// 🚒 SISTEMA TIEMPO REAL
// ==========================

const panelIncidentes = document.getElementById("listaIncidentes");

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
// 🚑 UNIDADES FIJAS
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

// crear lista en panel
unidades.forEach(u => {

  let div = document.createElement("div");
  div.className = "unidad";

  div.innerHTML = `
    🚑 <b>${u}</b><br>
    <small>Estado: Disponible (6-8)</small>
  `;

  listaUnidades.appendChild(div);
});

function crearIncidente(lugar) {

  let estadoActual = "6-3"; // estado incidente
  let unidadAsignada = "Sin asignar";

  let div = document.createElement("div");
  div.className = "incidente";

  function render() {

    div.style.background = coloresEstado[estadoActual];
    div.innerHTML = "";

    // 🔥 TÍTULO
    let titulo = document.createElement("b");
    titulo.innerText = lugar.nombre;
    div.appendChild(titulo);

    div.appendChild(document.createElement("br"));

    // 🔥 ESTADO INCIDENTE
    let estadoTexto = document.createElement("small");
    estadoTexto.innerText = `${estadoActual} - ${estados[estadoActual]}`;
    div.appendChild(estadoTexto);

    div.appendChild(document.createElement("br"));

    // 🔥 SELECT ESTADO
    let selectEstado = document.createElement("select");

    Object.entries(estados).forEach(([clave, texto]) => {
      let option = document.createElement("option");
      option.value = clave;
      option.text = `${clave} - ${texto}`;
      if (clave === estadoActual) option.selected = true;
      selectEstado.appendChild(option);
    });

    selectEstado.onchange = (e) => {
      estadoActual = e.target.value;
      render();
    };

    div.appendChild(selectEstado);

    div.appendChild(document.createElement("br"));

    // ==========================
    // 🚑 SELECT UNIDAD
    // ==========================
    
function actualizarEstadoUnidad(nombreUnidad, estado) {

  let unidadesHTML = document.querySelectorAll(".unidad");

  unidadesHTML.forEach(div => {

    if (div.innerText.includes(nombreUnidad)) {

      div.innerHTML = `
        🚑 <b>${nombreUnidad}</b><br>
        <small>${estado} - ${estados[estado]}</small>
      `;

      // colorear según estado
      div.style.background = coloresEstado[estado];
    }

  });
}
    
    let selectUnidad = document.createElement("select");

    let optionDefault = document.createElement("option");
    optionDefault.text = "Asignar unidad...";
    optionDefault.disabled = true;
    optionDefault.selected = unidadAsignada === "Sin asignar";
    selectUnidad.appendChild(optionDefault);

    unidades.forEach(u => {
      let op = document.createElement("option");
      op.value = u;
      op.text = u;
      if (u === unidadAsignada) op.selected = true;
      selectUnidad.appendChild(op);
    });

    selectUnidad.onchange = (e) => {
      unidadAsignada = e.target.value;

      // 🔥 actualizar unidad en lista
      actualizarEstadoUnidad(unidadAsignada, estadoActual);

      render();
    };

    div.appendChild(selectUnidad);

    // 🔥 mostrar unidad seleccionada
    let unidadTexto = document.createElement("small");
    unidadTexto.innerText = `Unidad: ${unidadAsignada}`;
    div.appendChild(unidadTexto);
  }

  render();

  // click → ir al mapa
  div.onclick = () => {
    map.setView(lugar.coords, 17);
    lugar.layer.openPopup();
  };

  panelIncidentes.prepend(div);
}
const toggleBtn = document.getElementById("toggleDispatch");
const contenido = document.getElementById("dispatchContent");

let abierto = true;

toggleBtn.onclick = () => {
  abierto = !abierto;

  contenido.style.display = abierto ? "block" : "none";
  toggleBtn.innerText = abierto ? "–" : "+";
};
