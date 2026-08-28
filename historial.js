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

  snapshot.forEach(docSnap => {

    const p =
      docSnap.data();

   html += `
<div class="card">

  <div class="card-header">

    <div>

      <b>📅 ${p.fecha || "-"}</b>

    </div>

    <button class="btnVerParte">
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
