console.log("✅ historial.js cargado");

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

  console.log("✅ buscando partes...");

  const snapshot =
    await getDocs(
      collection(db, "partes")
    );

  console.log(
    "📋 cantidad documentos:",
    snapshot.size
  );

}

  let html = "";

  snapshot.forEach(doc => {

    const p = doc.data();

    html += `
      <div class="card">

        <b>📅 ${p.fecha || "-"}</b>
        <br><br>

        🚒 ${p.tipo || "-"}
        <br>

        📂 ${p.subtipo || "-"}
        <br>

        📍 ${p.lugar || "-"}
        <br>

        📝 ${
          p.descripcion ||
          "Sin descripción"
        }

      </div>
    `;

  });

  contenedor.innerHTML =
    html;

}

cargar();
