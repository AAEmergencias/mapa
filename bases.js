import {

  auth,
  db,

  onAuthStateChanged,

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

    cargarBases();

  }
);

async function cargarBases() {

  const lista =
    document.getElementById(
      "listaUnidades"
    );

  lista.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(
        db,
        "bases"
      )
    );

  snapshot.forEach(docSnap => {

    const data =
      docSnap.data();

    lista.innerHTML += `

<tr>

  <td>
    ${data.nombre || "-"}
  </td>

  <td>
    ${
      data.ubicacion
        ? data.ubicacion.latitude.toFixed(6)
        : "-"
    }
  </td>

  <td>
    ${
      data.ubicacion
        ? data.ubicacion.longitude.toFixed(6)
        : "-"
    }
  </td>

  <td>
    ✅ Sí
  </td>

<td>

  <button
    class="btnEditarBase"
    data-id="${docSnap.id}"
  >
    ✏️
  </button>

</td>

</tr>

`;

  });

}
