import {

  auth,
  db,

  onAuthStateChanged,

  doc,
  getDoc,

  collection,
  getDocs

}
from "./firebase.js";

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    cargarUnidades();

  }
);

async function cargarUnidades() {

  const lista =
    document.getElementById(
      "listaUnidades"
    );

  lista.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(
        db,
        "unidades"
      )
    );

    snapshot.forEach(
    docSnap => {

      const data =
        docSnap.data();

            lista.innerHTML += `

<tr>

  <td>
    ${data.codigo || "-"}
  </td>

  <td>
    ${data.nombre || "-"}
  </td>

  <td>
    ${data.base || "-"}
  </td>

  <td>
    ${(data.categorias || []).join(", ")}
  </td>

  <td>
    ${
      data.activa
        ? "✅ Sí"
        : "❌ No"
    }
  </td>

</tr>

`;

    }
  );

}

document.getElementById(
  "btnNuevaUnidad"
).onclick = () => {

  document.getElementById(
    "modalUnidad"
  ).style.display = "flex";

};

document.getElementById(
  "cerrarModalUnidad"
).onclick = () => {

  document.getElementById(
    "modalUnidad"
  ).style.display = "none";

};
