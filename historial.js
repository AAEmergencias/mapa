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

  const snapshot =
    await getDocs(
      collection(
        db,
        "partes"
      )
    );

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
