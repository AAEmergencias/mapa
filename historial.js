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

  let html = "";

 let indice = 0;

snapshot.forEach(docSnap => {

    const p =
      docSnap.data();

  partes.push(p);

   html += `
<div class="card">

  <div class="card-header">

    <div>

      <b>📅 ${p.fecha || "-"}</b>

    </div>

  <button
  class="btnVerParte"
  onclick="verParte(${indice})">

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

indice++;
  
  });

  contenedor.innerHTML =
    html;

}

cargar();

window.verParte = function(indice){

  const parte =
    partes[indice];

  console.log(
    "📋 Parte seleccionado:",
    parte
  );

  alert(
    "Próximamente abrirá el parte completo"
  );

};

