import {

  db,
  auth,

  collection,
  addDoc,
  getDocs,
  getDoc,

  doc,
  setDoc,
  updateDoc,
  deleteDoc,

  onSnapshot,

  onAuthStateChanged,
  signOut,

  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword

}
from "./firebase.js";
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
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
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
  }),

  // 🚒 Carro bomba
  bomberos: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2820/2820482.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  }),

  // 🚑 Ambulancia
  ambulancia: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/996/996785.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  })

};

// ==========================
// 📂 CAPAS
// ==========================
let historialEmergencias = [];
let contadorEmergencias = 1;
let emergenciaActiva = null;
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

    Object.entries(unidadesCoords).forEach(([nombre, coords]) => {

  let icono = nombre.startsWith("S")
    ? iconos.ambulancia
    : iconos.bomberos;

  let marker = L.marker([coords.lat, coords.lng], {
    icon: icono
  })
  .addTo(map)
  .bindPopup("🚑 Unidad: " + nombre);

  // 🔥 guardar marcador
  marcadoresUnidades[nombre] = marker;

});

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


// ✅ PRIMERO CREAS EL OBJETO
let baseActualUnidad = {};
let estadoActualUnidad = {};

unidades.forEach(u => {
  let key = u.nombre.split(" ")[0];
  baseActualUnidad[key] = u.base.trim();
});

const basesCoords = {

  "Brigada La Ermita": { lat: -33.36836139874689, lng: -70.39767004182966 },
  "Brigada Los Bronces": { lat: -33.14653728758808, lng: -70.28561289858193 },
  "Brigada Mina": { lat: -33.159893229696756, lng: -70.29362741286191 },
  "Brigada Mineroducto": { lat: -33.19520696657682, lng: -70.56769606817501 },
  "Brigada Las Tortolas": { lat: -33.145535121031365, lng: -70.69935782523045 },

  "Policlínico Perez Caldera": { lat: -33.19056101322309, lng: -70.3392088172074 },
  "Policlínico Las Tortolas": { lat: -33.145579475013996, lng: -70.69949327677081 },
  "SPA 220": { lat: -33.14678123106413, lng: -70.28585898284963 }

};

const baseMap = {
  "Base Mina": "Brigada Mina",
  "Base 220": "SPA 220",
  "Base Los Bronces": "Brigada Los Bronces",
  "Base Perez Caldera": "Policlínico Perez Caldera",
  "Base Ermita": "Brigada La Ermita",
  "Base STP": "Brigada Mineroducto",
  "Base Tortolas": "Brigada Las Tortolas",
  "Base Poli Tortolas": "Policlínico Las Tortolas"
};

const unidadesCoords = {

  "UIR-E": { lat: -33.36836139874689, lng: -70.39767004182966 },
  "B1": { lat: -33.14653728758808, lng: -70.28561289858193 },
  "UIR-M": { lat: -33.159893229696756, lng: -70.29362741286191 },
  "UIR-S": { lat: -33.19520696657682, lng: -70.56769606817501 },
  "B2": { lat: -33.145535121031365, lng: -70.69935782523045 },

  "S1": { lat: -33.19056101322309, lng: -70.3392088172074 },
  "S2": { lat: -33.145579475013996, lng: -70.69949327677081 },
  "S3": { lat: -33.14678123106413, lng: -70.28585898284963 }

};

const listaUnidades = document.getElementById("listaUnidades");

unidades.forEach((u, i) => {

 let div = document.createElement("div");

div.className = "unidad";

div.dataset.unidad =
  u.nombre.split(" ")[0];

div.innerHTML = `
  🚑 <b>${u.nombre}</b><br>
  <small>⏳ Cargando estado...</small>
`;

  div.addEventListener("click", () => {
  unidadSeleccionada = u.nombre; // 🔥 IMPORTANTE
  abrirModalEstados();
});
  
  listaUnidades.appendChild(div);
  
});

// ==========================
// 📏 DISTANCIA ENTRE PUNTOS
// ==========================
function distancia(a, b) {
  let dx = a.lat - b.lat;
  let dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

let marcadoresUnidades = {};

function moverUnidad(nombreUnidad, origen, destino) {

  let lat = origen.lat;
  let lng = origen.lng;

 let icono = iconos.general;

// 🚑 distinguir por nombre
if (nombreUnidad.includes("S")) {
  icono = iconos.ambulancia;
} else {
  icono = iconos.bomberos;
}

let key = nombreUnidad.split(" ")[0];

let marker = marcadoresUnidades[key];

if (!marker) return;

  marcadoresUnidades[key] = marker;

  let pasos = 60;
  let pasoActual = 0;

  let deltaLat = (destino.lat - origen.lat) / pasos;
  let deltaLng = (destino.lng - origen.lng) / pasos;

  let intervalo = setInterval(() => {

    lat += deltaLat;
    lng += deltaLng;

    marker.setLatLng([lat, lng]);

    pasoActual++;

   if (pasoActual >= pasos) {
  clearInterval(intervalo);

  unidadesCoords[key] = {
    lat: lat,
    lng: lng
  };
}

  }, 150);
}

// ==========================
// 🚑 UNIDAD MÁS CERCANA
// ==========================
function unidadMasCercana(destino) {

  let mejor = null;
  let minDist = Infinity;

  unidades.forEach(u => {

    let key = u.nombre.split(" ")[0];
let coords = unidadesCoords[key];

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
    "Volcamiento vehículos livianos",
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
    "Caída de particulas",
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

  "Sísmico": [
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
    "Crecida de rios",
    "Inundación de instalaciones"
  ],

  "Geológico": [
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

  console.log(
  "🚒 Estado cambiado",
  nombreUnidad,
  estado
);

  // 🔥 guardar hora del estado
if (emergenciaActiva && emergenciaActiva.tiempos[estado] !== undefined) {
  emergenciaActiva.tiempos[estado] = new Date().toLocaleTimeString();
}

  let unidadesHTML = document.querySelectorAll(".unidad");

  unidadesHTML.forEach(div => {

 const key =
  nombreUnidad.split(" ")[0];

if (
  div.dataset.unidad === key
)
    {

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
  
const key =
  nombreUnidad.split(" ")[0];

  estadoActualUnidad[key] =
  estado;

  if (nota) {

  estadoActualUnidad[
    key + "_nota"
  ] = nota;

}

  console.log(
  "🔥 Guardando Firestore:",
  {
    unidad: key,
    estado: estado
  }
);

if (
  estadoActualUnidad[
    key + "_recuperando"
  ]
) {

  delete estadoActualUnidad[
    key + "_recuperando"
  ];

  return;

}

  console.log(
  "🔥 GUARDANDO:",
  {
    unidad: key,
    estado,
    nota
  }
);


setDoc(
  doc(db, "estadoOperacional", key),
  {
    unidad: key,

    estado: estado,

    descripcion: estados[estado],

    tipoEmergencia:
      emergenciaActiva?.tipo || "",

    ubicacion:
      emergenciaActiva?.ubicacion || "",

    notas:
  nota ||
  estadoActualUnidad[key + "_nota"] ||
  "",

    unidadesDespachadas:
      emergenciaActiva?.unidades || [],

    actualizado:
      new Date().toISOString()
  }
);
  
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

  if (
  !tipo ||
  tipo === "Seleccione tipo..."
) {

  alert(
    "⚠️ Debe seleccionar un tipo de emergencia"
  );

  return;
}

if (
  !subtipo ||
  subtipo === "Seleccione subtipo..."
) {

  alert(
    "⚠️ Debe seleccionar un subtipo"
  );

  return;
}

const emergenciaId =
  crypto.randomUUID();

emergenciaActiva = {

  id: emergenciaId,

  tipo: tipo,

  subtipo: subtipo,

  ubicacion:
    ubicacionSeleccionada?.nombre ||
    "Sin ubicación",

  unidades: [],

  tiempos: {
    "6-3": "",
    "6-7": "",
    "6-8": "",
    "6-9": "",
    "6-10": ""
  },

  fecha:
    new Date().toLocaleDateString(),

  notas: ""

};

addDoc(
  collection(
    db,
    "emergenciasActivas"
  ),
  {

    emergenciaId:
      emergenciaId,

    tipo: tipo,

    subtipo: subtipo,

    ubicacion:
      ubicacionSeleccionada?.nombre ||
      "Sin ubicación",

    fecha:
      new Date().toISOString(),

    estado: "activa",

    unidades: [],

    notas: ""

  }
)
.then(docRef => {

  emergenciaActiva.firebaseId =
    docRef.id;

  console.log(
    "✅ Emergencia guardada:",
    docRef.id
  );

});
  
  let cercana = unidadMasCercana(ubicacionSeleccionada.coords);

let nueva = {
  tipo: tipo,
  subtipo: subtipo,
  ubicacion: ubicacionSeleccionada.nombre,
  unidad: cercana || "Sin unidad",

  // ✅ 🔥 GUARDAR TRASLADO
  tipoTraslado: emergenciaActiva?.tipoTraslado || "",
  lugarTraslado: emergenciaActiva?.lugarTraslado || ""
};

  let panelNegro = crearPanelEmergencia(nueva);
  
 let panelRojo =
  crearPanelRojo(
    nueva,
    panelNegro,
    emergenciaActiva
  );

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
    <button class="btn-origen">⬅ Volver a base de origen</button>
    <div class="listaBases"></div>
    <button class="cerrarBases">Cancelar</button>
  </div>
`;

  const lista = modal.querySelector(".listaBases");

  const btnOrigen = modal.querySelector(".btn-origen");

if (btnOrigen) {
  btnOrigen.onclick = () => {

    let key = unidad.split(" ")[0];

    let unidadData = unidades.find(u => u.nombre.startsWith(key));

    if (!unidadData) {
      console.log("❌ No se encontró unidad:", key);
      return;
    }

    let baseOriginal = unidadData.base.trim();
    baseOriginal = baseOriginal.replace(/\s+/g, " ");

    console.log("✅ Volviendo a base:", baseOriginal);

    actualizarEstadoUnidad(unidad, "6-10", baseOriginal);

    let marker = marcadoresUnidades[key];
    if (!marker) {
      console.log("❌ Marker no encontrado");
      return;
    }

    let pos = marker.getLatLng();

    let origen = {
      lat: pos.lat,
      lng: pos.lng
    };

    let destino = basesCoords[baseOriginal];

    if (!destino) {
      console.log("❌ No hay coordenadas para:", baseOriginal);
      return;
    }

    moverUnidad(unidad, origen, destino);

    baseActualUnidad[key] = baseOriginal;

    modal.remove();
  };
}

bases.forEach(base => {

  let item = document.createElement("div");
  item.className = "estado-item";
  item.innerText = base;

  item.onclick = () => {

    let key = unidad.split(" ")[0];

    let baseReal = baseMap[base];

    actualizarEstadoUnidad(unidad, "6-10", baseReal);

    let marker = marcadoresUnidades[key];
    if (!marker) return;

    let pos = marker.getLatLng();

    let origen = {
      lat: pos.lat,
      lng: pos.lng
    };

    let destino = basesCoords[baseReal];

    if (!destino) return;

    moverUnidad(unidad, origen, destino);

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

      console.log(
  "📝 NOTA INGRESADA:",
  nota
);


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

function abrirModalTraslado(unidad) {

  let modal = document.createElement("div");
  modal.className = "modal-bases";

  modal.innerHTML = `
    <div class="modal-bases-content">

      <h3>🚑 Tipo de Traslado</h3>

      <div class="grupo-botones">
        <button class="btn-interno">🏥 Interno</button>
        <button class="btn-externo">🚑 Externo</button>
      </div>

      <button class="volver">⬅ Volver</button>

    </div>
  `;

  const btnInterno = modal.querySelector(".btn-interno");
  const btnExterno = modal.querySelector(".btn-externo");
  const btnVolver = modal.querySelector(".volver");

  if (btnInterno) {
    btnInterno.onclick = () => {
      mostrarOpcionesTraslado(unidad, "interno");
      modal.remove();
    };
  }

  if (btnExterno) {
    btnExterno.onclick = () => {
      mostrarOpcionesTraslado(unidad, "externo");
      modal.remove();
    };
  }

  if (btnVolver) {
    btnVolver.onclick = () => {
      modal.remove();
      abrirModalEstados();
    };
  }

  document.body.appendChild(modal);
}


function mostrarOpcionesTraslado(unidad, tipo) {

  let modal = document.createElement("div");
  modal.className = "modal-bases";

  let lista = (tipo === "interno")
    ? [
        "Policlínico Pérez Caldera",
        "Policlínico Las Tórtolas",
        "SPA 220"
      ]
    : [
        "Mutual de Seguridad CCHC",
        "Clinica Hospital del Profesor",
        "Hospital San José",
        "Instituto Nacional del Cáncer",
        "Hospital Clínico Universidad de Chile",
        "Hospital Roberto del Río",
        "Clínica Dávila",
        "Hospital Psiquiátrico Dr. José Horwitz",
        "Hospital Clínico San Borja Arriarán",
        "Instituto Traumatológico",
        "Hospital San Juan de Dios",
        "Posta Central",
        "Hospital Clínico de la Universidad Católica",
        "Instituto de Seguridad del Trabajo (IST)",
        "Hospital Militar",
        "Hospital Félix Bulnes",
        "Hospital Exequiel González Cortés",
        "Hospital Dr. Lucio Córdova",
        "Hospital El Pino",
        "Hospital Del Salvador",
        "Hospital Luis Calvo Mackenna",
        "Instituto Nacional del Tórax",
        "Hospital Del Trabajador (ACHS)",
        "Clinica Indisa",
        "Clinica Santa María",
        "Insituto Oncológico FALP",
        "Clinica Red Salud",
        "Hospital Luis Tisné",
        "Instituto Rehabilitación Pedro Aguirre Cerda",
        "Hospital Padre Hurtado",
        "Hospital Dra. Eloísa Díaz",
        "Clinica BUPA",
        "Hospital El Carmen",
        "Clinica Red Salud Maipú",
        "Hospital Psiquiátrico El Peral",
        "Hospital Sotero del Río",
        "Hospital de Carabineros",
        "Hospital Clínico de la FACH",
        "Clínica Universidad de los Andes",
        "Clínica Las Condes",
        "Clínica Alemana",
        "Clínica Tabancura",
        "Hospital Nuevo Félix Bulnes",
        "SPA 220",
        "Policlínico Pérez Caldera",
        "Policlínico Tortolas",
        "Rechaza Atención",
        "Otras Derivaciones",
        "N/A"
      ];

modal.innerHTML = `
  <div class="modal-bases-content">

    <h3>🏥 Buscar destino</h3>

    <input id="buscadorTraslado" placeholder="🔍 Escribe hospital o clínica..." />

    <div id="resultadosTraslado"></div>

    <br>

    <button class="volver">⬅ Volver</button>

  </div>
`;

  modal.querySelector(".volver").onclick = () => {
  modal.remove();
  abrirModalTraslado(unidad);
};

  let input = modal.querySelector("#buscadorTraslado");
  let resultados = modal.querySelector("#resultadosTraslado");

  input.addEventListener("input", () => {

    let texto = input.value.toLowerCase();

    resultados.innerHTML = "";

    let filtrados = lista.filter(l =>
      l.toLowerCase().includes(texto)
    );

    filtrados.slice(0, 10).forEach(l => {

      let div = document.createElement("div");
      div.className = "estado-item";
      div.innerText = l;

     div.onclick = async () => {

  // ✅ cambiar estado de la unidad
  actualizarEstadoUnidad(unidad, "6-15", null, l);

  // ✅ guardar en memoria actual (si hay emergencia activa)
  if (emergenciaActiva) {
    emergenciaActiva.tipoTraslado = tipo;
    emergenciaActiva.lugarTraslado = l;
  }

  // ✅ 🔥 GUARDAR EN FIREBASE (CLAVE)
  try {

    console.log("🚑 GUARDANDO TRASLADO");

console.log({
  unidad: unidad,
  tipoTraslado: tipo,
  lugarTraslado: l
});
    
   await addDoc(collection(db, "traslados"), {

  unidad: unidad,
  tipoTraslado: tipo,
  lugarTraslado: l,

  fecha: new Date().toISOString().split("T")[0],
  hora: new Date().toLocaleTimeString()

});

console.log("✅ TRASLADO GUARDADO");

  } catch (error) {

    console.error("❌ Error guardando traslado:", error);

  }

  modal.remove();
};

      resultados.appendChild(div);
    });

  });

  document.body.appendChild(modal);

  // 🔥 enfocar automáticamente
  input.focus();
}


function abrirConfirmacionFinalizar(
  panel,
  panelNegro,
  emergenciaPanel
) {

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

  const btnConfirmar =
    modal.querySelector(".btnConfirmar");

  const btnCancelar =
    modal.querySelector(".cerrarBases");

  if (btnConfirmar) {

    btnConfirmar.onclick = () => {

      if (emergenciaPanel) {

        emergenciaPanel.finalizada = true;

        emergenciaPanel.fecha =
          new Date().toLocaleDateString();

        emergenciaPanel.horaActivacion =
          emergenciaPanel.tiempos?.["6-3"] || "";

        emergenciaPanel.horaCierre =
          emergenciaPanel.tiempos?.["6-7"] || "";

        emergenciaPanel.ubicacion =
          emergenciaPanel.ubicacion || "";

        emergenciaPanel.brigada =
          emergenciaPanel.unidades?.[0] || "";

        emergenciaPanel.vehiculo =
          emergenciaPanel.unidades?.[0] || "";

        console.log(
          "📝 Guardando emergencia:",
          emergenciaPanel
        );

        console.log(
  "EMERGENCIA FINALIZADA:",
  emergenciaPanel
);

        historialEmergencias.push(
          emergenciaPanel
        );

        localStorage.setItem(
          "historialEmergencias",
          JSON.stringify(historialEmergencias)
        );

        if (
          emergenciaPanel.firebaseId
        ) {

          console.log(
            "🗑️ Eliminando:",
            emergenciaPanel.firebaseId
          );

          deleteDoc(
            doc(
              db,
              "emergenciasActivas",
              emergenciaPanel.firebaseId
            )
          )
          .then(() => {

            console.log(
              "✅ Emergencia eliminada"
            );

          })
          .catch(error => {

            console.error(
              "❌ Error eliminando:",
              error
            );

          });

        }

      }

      if (panel) {
        panel.remove();
      }

      if (panelNegro) {
        panelNegro.remove();
      }

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
  abrirModalTraslado(unidadSeleccionada);

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

function crearPanelRojo(
  data,
  panelNegro,
  emergenciaData
) {


 const emergenciaPanel =
  emergenciaData;

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

  <div class="titulo">
    🚑 Unidades asignadas
  </div>

  <div class="unidades">

    <div class="tituloGrupo">
      🚒 UIR
    </div>

    <div
      class="grupoUnidades"
      id="grupoUIR">
    </div>

    <div class="tituloGrupo">
      🚒 Carros Bomba
    </div>

    <div
      class="grupoUnidades"
      id="grupoBomba">
    </div>

    <div class="tituloGrupo">
      🚑 Servicio Médico
    </div>

    <div
      class="grupoUnidades"
      id="grupoMedico">
    </div>

  </div>

</div>

<div class="bloque">

  <div class="titulo">
    📝 Notas
  </div>

  <textarea
    class="campoNotas"
    placeholder="Agregar información..."
  ></textarea>

  <br><br>

  <button class="btnGuardarNota">
    💾 Guardar Nota
  </button>

</div>

    <button class="btnFinalizar">Finalizar Emergencia</button>

  </div>
`;

  // ==========================
// ➕ AGREGAR UNIDAD (PASO 3)
// ==========================
const contenedorUnidades =
  panel.querySelector(".unidades");

 const grupoUIR =
  panel.querySelector(
    "#grupoUIR"
  );

const grupoBomba =
  panel.querySelector(
    "#grupoBomba"
  );

const grupoMedico =
  panel.querySelector(
    "#grupoMedico"
  );

console.log(
  "UIR:",
  grupoUIR
);

console.log(
  "BOMBA:",
  grupoBomba
);

console.log(
  "MEDICO:",
  grupoMedico
);

unidades.forEach(unidad => {

  const codigo =
    unidad.nombre.split(" ")[0];

  let boton =
    document.createElement(
      "button"
    );

  boton.className =
    "btnUnidad";

  boton.textContent =
    codigo;

boton.onclick = () => {

  const seleccionada =
    boton.classList.toggle(
      "unidadSeleccionada"
    );

  if (!emergenciaActiva)
    return;

  if (seleccionada) {

    if (
      !emergenciaActiva.unidades.includes(
        codigo
      )
    ) {

      emergenciaActiva.unidades.push(
        codigo
      );

      const unidadCompleta =
  unidades.find(
    u =>
      u.nombre.startsWith(
        codigo
      )
  );

if (unidadCompleta) {

  actualizarEstadoUnidad(
    unidadCompleta.nombre,
    "6-T"
  );

}

    }

  }

  else {

    emergenciaActiva.unidades =
      emergenciaActiva.unidades.filter(
        u => u !== codigo
      );

  }

  console.log(
    "🚑 Unidades:",
    emergenciaActiva.unidades
  );

  if (panelNegro) {

  panelNegro.querySelector(
    ".info"
  ).innerHTML = `

    🔥 ${data.tipo}<br>
    📍 ${data.ubicacion}<br>
    🚑 ${emergenciaActiva.unidades.join(", ") || "Sin unidades"}

  `;

}

};

  if (
    codigo.startsWith("UIR")
  ) {

    grupoUIR.appendChild(
      boton
    );

  }

  else if (

    codigo.startsWith("B")

  ) {

    grupoBomba.appendChild(
      boton
    );

  }

  else if (

    codigo.startsWith("S")

  ) {

    grupoMedico.appendChild(
      boton
    );

  }

});

const campoNotas =
  panel.querySelector(".campoNotas");

campoNotas.addEventListener("input", () => {

  if (!emergenciaActiva) return;

  emergenciaActiva.notas =
    campoNotas.value;

});

const btnGuardarNota =
  panel.querySelector(".btnGuardarNota");

btnGuardarNota.onclick = () => {

  if (!emergenciaActiva) return;

  emergenciaActiva.notas =
    campoNotas.value;

  if (
    emergenciaActiva.firebaseId
  ) {

    updateDoc(
      doc(
        db,
        "emergenciasActivas",
        emergenciaActiva.firebaseId
      ),
      {
        notas:
          emergenciaActiva.notas
      }
    );

  }

  emergenciaActiva.unidades.forEach(
    unidad => {

      actualizarEstadoUnidad(
        unidad,
        estadoActualUnidad[unidad] || "6-T"
      );

    }
  );

  btnGuardarNota.innerHTML =
    "✅ Guardado";

  setTimeout(() => {

    btnGuardarNota.innerHTML =
      "💾 Guardar Nota";

  }, 2000);

};
  
  let unidadesAsignadas = [];

  /*

panel.querySelector(".btnAgregarUnidad").onclick = () => {

  let nombreUnidad = select.value;
  let unidadData = unidades.find(u => u.nombre === nombreUnidad);
  if (!unidadData) return;

  let key = nombreUnidad.split(" ")[0];

  // ✅ guardar en historial
  if (emergenciaActiva && !emergenciaActiva.unidades.includes(key)) {
    emergenciaActiva.unidades.push(key);
  }

  if (
  emergenciaActiva &&
  emergenciaActiva.firebaseId
) {

  updateDoc(
    doc(
      db,
      "emergenciasActivas",
      emergenciaActiva.firebaseId
    ),
    {
      unidades:
        emergenciaActiva.unidades
    }
  );

}
  

  // ✅ evitar duplicados UI
  if (!unidadesAsignadas.includes(nombreUnidad)) {
    unidadesAsignadas.push(nombreUnidad);
  }

  // ✅ crear visual
  const codigo =
  nombreUnidad.split(" ")[0];

let div =
  document.createElement(
    "div"
  );

div.className =
  "unidad-asignada";

div.textContent =
  codigo;

 if (
  codigo.startsWith("UIR")
) {

  panel.querySelector(
    "#grupoUIR"
  ).appendChild(div);

}

else if (

  codigo.startsWith("B")

) {

  panel.querySelector(
    "#grupoBomba"
  ).appendChild(div);

}

else if (

  codigo.startsWith("S")

) {

  panel.querySelector(
    "#grupoMedico"
  ).appendChild(div);

}

  // ✅ cambiar estado
  actualizarEstadoUnidad(unidadData.nombre, "6-T");

  // ✅ mover unidad
  let origen = unidadesCoords[key];
  let destino = ubicacionSeleccionada.coords;

  if (origen && destino) {
    moverUnidad(unidadData.nombre, origen, destino);
  }

  // ✅ actualizar panel negro
  if (panelNegro) {
    panelNegro.querySelector(".info").innerHTML = `
      🔥 ${data.tipo}<br>
      📍 ${data.ubicacion}<br>
      🚑 ${unidadesAsignadas.join(", ")}
    `;
  }

};

*/


  // ✅ CERRAR
  panel.querySelector(".cerrarRojo").onclick = () => {
    panel.remove();
    if (panelNegro) panelNegro.remove();
  };

  // ✅ FINALIZAR (cierra ambos)
panel.querySelector(".btnFinalizar").onclick = () => {

  abrirConfirmacionFinalizar(
    panel,
    panelNegro,
    emergenciaPanel
  );

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

document.getElementById("irAdmin").onclick = () => {
  window.open("admin.html", "_blank");
};

document.getElementById(
  "verHistorial"
).onclick = () => {

  window.open(
    "historial.html",
    "_blank"
  );

};


document.getElementById("cerrarParte").onclick = () => {

localStorage.removeItem(
  "parteEditar"
);

localStorage.removeItem(
  "parteVer"
);
  
  let historial = JSON.parse(localStorage.getItem("historialEmergencias")) || [];

  // ✅ filtrar solo finalizadas
 let finalizadas = historial.filter(e => e.finalizada && !e.cerrada);

  console.log(
  "📋 Emergencias finalizadas disponibles:",
  finalizadas
);

  // ❌ ninguna
  if (finalizadas.length === 0) {
    alert("❌ No hay emergencias finalizadas para cerrar");
    return;
  }

  // ✅ solo una
  if (finalizadas.length === 1) {
    localStorage.setItem("emergenciaSeleccionada", JSON.stringify(finalizadas[0]));
    window.open("formulario.html", "_blank");
    return;
  }

  console.log(
  "📋 Emergencias finalizadas:",
  finalizadas
);

  // ✅ varias → mostrar selector
  mostrarSelectorEmergencias(finalizadas);
};

function mostrarSelectorEmergencias(lista) {

  let modal = document.createElement("div");

  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";

  let contenido = document.createElement("div");

  contenido.style.background = "#2b2f3a";
  contenido.style.padding = "20px";
  contenido.style.borderRadius = "10px";
  contenido.style.width = "320px";
  contenido.style.color = "white";

  contenido.innerHTML = "<h3>Selecciona emergencia</h3>";

lista.forEach(e => {

  console.log(
  "📂 Emergencia mostrada:",
  e.id,
  e.tipo,
  e.fecha
);

  let item = document.createElement("div");

  item.style.padding = "10px";
  item.style.margin = "5px 0";
  item.style.background = "#3a3f4b";
  item.style.cursor = "pointer";
  item.style.borderRadius = "6px";

item.innerHTML = `
    🚨 ${e.tipo}<br>
    <small>${e.subtipo || ""}</small><br>
    📍 ${e.ubicacion || "Sin ubicación"}<br>
    📅 ${e.fecha}
`;
  
 item.onclick = () => {

  console.log(
    "✅ Abriendo emergencia:",
    e.id,
    e.tipo,
    e.fecha
  );

  localStorage.setItem(
    "emergenciaSeleccionada",
    JSON.stringify(e)
  );

  modal.remove();

   window.open(
"formulario.html",
"_blank"
);

};

  contenido.appendChild(item);

});

// ✅ IMPORTANTE (fuera del forEach)
modal.appendChild(contenido);
document.body.appendChild(modal);

  }

async function recuperarEmergenciasActivas() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "emergenciasActivas"
        )
      );

snapshot.forEach(docSnap => {

  const data =
    docSnap.data();

  if (
  data.tipo === "Seleccione tipo..." ||
  data.subtipo === "Seleccione subtipo..."
) {

  console.warn(
    "⚠️ Emergencia inválida ignorada:",
    docSnap.id
  );

  return;
}

  console.log(
    "🔥 Recuperando:",
    data
  );

  let nueva = {

    firebaseId:
      docSnap.id,

    tipo:
      data.tipo,

    subtipo:
      data.subtipo,

    ubicacion:
      data.ubicacion,

    unidad:
      data.unidades?.join(", ")
      || "Sin unidad"

  };

  let panelNegro =
    crearPanelEmergencia(
      nueva
    );

  let emergenciaRecuperada = {

  id:
    data.emergenciaId,

  firebaseId:
    docSnap.id,

  tipo:
    data.tipo,

  subtipo:
    data.subtipo,

  ubicacion:
    data.ubicacion,

  unidades:
    data.unidades || [],

  notas:
    data.notas || ""

};

let panelRojo =
  crearPanelRojo(
    nueva,
    panelNegro,
    emergenciaRecuperada
  );

 emergenciaActiva = {

  id:
    data.emergenciaId,

  firebaseId:
    docSnap.id,

  tipo:
    data.tipo,

  subtipo:
    data.subtipo,

  ubicacion:
    data.ubicacion,

  unidades:
    data.unidades || [],

  notas:
    data.notas || ""

};


});

  } catch (error) {

    console.error(
      "❌ Error recuperando emergencias:",
      error
    );

  }

}

async function recuperarEstadosOperacionales() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "estadoOperacional"
        )
      );

    snapshot.forEach(docSnap => {

      const data =
        docSnap.data();

      console.log(
        "🚒 Recuperando estado:",
        data
      );

      let unidadCompleta =
        unidades.find(u =>
          u.nombre.startsWith(data.unidad)
        );

      if (!unidadCompleta) return;

      estadoActualUnidad[
  data.unidad + "_recuperando"
] = true;
      
      actualizarEstadoUnidad(
  unidadCompleta.nombre,
  data.estado,
  null,
  data.notas || ""
);

    });

  } catch (error) {

    console.error(
      "❌ Error recuperando estados:",
      error
    );

  }

}

recuperarEstadosOperacionales();
recuperarEmergenciasActivas();

// ==========================
// 👤 USUARIO LOGEADO
// ==========================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    const usuarioDoc =
      await getDoc(
        doc(
          db,
          "usuarios",
          user.email
        )
      );

    if (!usuarioDoc.exists()) {
      return;
    }

    const datos =
      usuarioDoc.data();

    // 👤 Mostrar usuario

    document.getElementById(
      "nombreUsuario"
    ).innerHTML =
      "👤 " + datos.nombre;

    document.getElementById(
      "turnoUsuario"
    ).innerHTML =
      "📟 Turno " +
      (datos.turno || "-");

    document.getElementById(
      "rolUsuario"
    ).innerHTML =
      datos.rol.toUpperCase();

    // 🔐 Control acceso admin

   const btnAdmin =
  document.getElementById(
    "irAdmin"
  );

if (
  datos.rol?.toLowerCase().trim() ===
  "operador"
) {

  btnAdmin.style.display =
    "none";

}
else {

  btnAdmin.style.display =
    "block";

}

  }
);

document
  .getElementById(
    "cerrarSesion"
  )
  .onclick =
async () => {

  await signOut(auth);

  window.location.href =
    "login.html";

};

// ==========================
// 🔑 CAMBIAR CONTRASEÑA
// ==========================

const modalPassword =
  document.getElementById(
    "modalPassword"
  );

document.getElementById(
  "btnCambiarPassword"
).onclick = () => {

  modalPassword.style.display =
    "flex";

};

document.getElementById(
  "cerrarPassword"
).onclick = () => {

  modalPassword.style.display =
    "none";

};

document.getElementById(
  "guardarPassword"
).onclick = async () => {

  const actual =
    document.getElementById(
      "claveActual"
    ).value;

  const nueva =
    document.getElementById(
      "claveNueva"
    ).value;

  const confirmar =
    document.getElementById(
      "claveConfirmar"
    ).value;

  // =====================
  // VALIDACIONES
  // =====================

  if (nueva !== confirmar) {

    alert(
      "❌ Las contraseñas no coinciden"
    );

    return;

  }

  if (nueva.length < 6) {

    alert(
      "❌ La contraseña debe tener al menos 6 caracteres"
    );

    return;

  }

  try {

    const credencial =
      EmailAuthProvider.credential(

        auth.currentUser.email,

        actual

      );

    await reauthenticateWithCredential(

      auth.currentUser,

      credencial

    );

    await updatePassword(

      auth.currentUser,

      nueva

    );

    alert(
      "✅ Contraseña actualizada correctamente"
    );

    modalPassword.style.display =
      "none";

    document.getElementById(
      "claveActual"
    ).value = "";

    document.getElementById(
      "claveNueva"
    ).value = "";

    document.getElementById(
      "claveConfirmar"
    ).value = "";

  }

  catch(error) {

    console.error(error);

    alert(
      "❌ Contraseña actual incorrecta"
    );

  }

};
