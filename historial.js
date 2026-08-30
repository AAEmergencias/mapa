import {
  db,
  collection,
  getDocs
}
from "./firebase.js";

const contenedor =
  document.getElementById(
    "historial"
  );

const buscador =
  document.getElementById(
    "buscador"
  );

const contadorResultados =
  document.getElementById(
    "contadorResultados"
  );

const fechaDesde =
  document.getElementById(
    "fechaDesde"
  );

const fechaHasta =
  document.getElementById(
    "fechaHasta"
  );

const btnFiltrar =
  document.getElementById(
    "btnFiltrar"
  );


let partes = [];

async function cargar() {

  console.log(
    "✅ buscando partes..."
  );

  const snapshot =
    await getDocs(
      collection(
        db,
        "partes"
      )
    );

  console.log(
    "📋 cantidad documentos:",
    snapshot.size
  );

  snapshot.forEach(docSnap => {

  console.log(
    "DOCUMENTO:",
    docSnap.id,
    docSnap.data()
  );

});

 partes = [];

snapshot.forEach(docSnap => {

 const p = {

  id: docSnap.id,

  ...docSnap.data()

};

partes.push(p);

});

  partes.sort((a, b) => {

  const fechaHoraA = new Date(
    `${a.fecha} ${a.horaActivacion || "00:00"}`
  );

  const fechaHoraB = new Date(
    `${b.fecha} ${b.horaActivacion || "00:00"}`
  );

  return fechaHoraB - fechaHoraA;

});

renderizarPartes(partes); 
  
}

function formatearFecha(fecha){

  if (!fecha) return "-";

  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ];

  const partes =
    fecha.split("-");

  if (partes.length !== 3)
    return fecha;

  const anio =
    Number(partes[0]);

  const mes =
    Number(partes[1]) - 1;

  const dia =
    Number(partes[2]);

  const f =
    new Date(
      anio,
      mes,
      dia
    );

  const diaSemana =
    dias[f.getDay()];

  return `${diaSemana} ${partes[2]}/${partes[1]}/${partes[0]}`;

}

function renderizarPartes(lista){

  let html = "";

  lista.forEach((p, indice) => {

    html += `
    <div class="card">

      <div class="card-header">

        <div>
     <b>📅 ${formatearFecha(p.fecha)}</b>
        </div>

     <button
  class="btnVerParte"
  onclick="verPartePorId('${p.id}')">

  👁 Ver Parte

</button>

      </div>

      🚒 ${p.tipo || "-"}
      <br>

      📂 ${p.subtipo || "-"}
      <br>

      📍 ${p.lugar || "-"}
      <br>


🚑 Brigada:
${p.brigada || "-"}

<br>

🏥 Ambulancia:
${p.ambulancia || "-"}

<br>

👨 Operador:
${p.operador || "-"}

<br>

      📝 ${p.descripcion || "Sin descripción"}

    </div>
    `;

  });

contadorResultados.innerHTML =

  `📊 ${lista.length} resultado${
    lista.length === 1
      ? ""
      : "s"
  } encontrado${
    lista.length === 1
      ? ""
      : "s"
  }`;
  
  contenedor.innerHTML =
    html;

}

cargar();

window.verParte = function(indice){

  const parte =
    partes[indice];

  // ✅ limpiar cualquier modo anterior

  localStorage.removeItem(
    "parteEditar"
  );

  localStorage.removeItem(
    "emergenciaSeleccionada"
  );

  localStorage.removeItem(
    "parteVer"
  );

  // ✅ guardar modo lectura

  localStorage.setItem(
    "parteVer",
    JSON.stringify(parte)
  );

  window.open(
    "formulario.html",
    "_blank"
  );

};

window.verPartePorId = function(id){

  const parte =
    partes.find(
      p => p.id === id
    );

  if (!parte) return;

  localStorage.removeItem(
    "parteEditar"
  );

  localStorage.removeItem(
    "emergenciaSeleccionada"
  );

  localStorage.removeItem(
    "parteVer"
  );

  localStorage.setItem(
    "parteVer",
    JSON.stringify(parte)
  );

  window.open(
    "formulario.html",
    "_blank"
  );

};

function normalizarTexto(texto){

  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}

buscador.addEventListener(
  "input",
  () => {

    const texto =
      normalizarTexto(
        buscador.value.trim()
      );

    const filtrados =
      partes.filter(p => {

        return (

          normalizarTexto(p.tipo)
            .includes(texto)

          ||

          normalizarTexto(p.subtipo)
            .includes(texto)

          ||

          normalizarTexto(p.lugar)
            .includes(texto)

          ||

          normalizarTexto(p.empresa)
            .includes(texto)

          ||

          normalizarTexto(p.operador)
            .includes(texto)

          ||

          normalizarTexto(p.descripcion)
            .includes(texto)

          ||

          normalizarTexto(p.brigada)
            .includes(texto)

        );

      });

    renderizarPartes(
      filtrados
    );

  }
);

btnFiltrar.addEventListener(
  "click",
  () => {

    const desde =
      fechaDesde.value;

    const hasta =
      fechaHasta.value;

    let filtrados =
      partes.filter(p => {

        if (!p.fecha)
          return false;

        const fecha =
          p.fecha;

        if (
          desde &&
          fecha < desde
        ) {
          return false;
        }

        if (
          hasta &&
          fecha > hasta
        ) {
          return false;
        }

        return true;

      });

    renderizarPartes(
      filtrados
    );

  }
);
