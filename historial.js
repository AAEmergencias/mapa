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

 partes = [];

snapshot.forEach(docSnap => {

 const p = {

  id: docSnap.id,

  ...docSnap.data()

};

partes.push(p);

});

renderizarPartes(partes); 
  
}

function renderizarPartes(lista){

  let html = "";

  lista.forEach((p, indice) => {

    html += `
    <div class="card">

      <div class="card-header">

        <div>
          <b>📅 ${p.fecha || "-"}</b>
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

      📝 ${p.descripcion || "Sin descripción"}

    </div>
    `;

  });

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

buscador.addEventListener(
  "input",
  () => {

    const texto =
      buscador.value
      .toLowerCase()
      .trim();

    const filtrados =
      partes.filter(p => {

        return (

          (p.tipo || "")
            .toLowerCase()
            .includes(texto)

          ||

          (p.subtipo || "")
            .toLowerCase()
            .includes(texto)

          ||

          (p.lugar || "")
            .toLowerCase()
            .includes(texto)

          ||

          (p.empresa || "")
            .toLowerCase()
            .includes(texto)

          ||

          (p.operador || "")
            .toLowerCase()
            .includes(texto)

          ||

          (p.descripcion || "")
            .toLowerCase()
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
