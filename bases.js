import {

  auth,
  db,

  onAuthStateChanged,

  collection,
  getDocs,

  doc,
  setDoc,

  GeoPoint

}
from "./firebase.js";

let baseEditando = null;

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

  document
  .querySelectorAll(
    ".btnEditarBase"
  )
  .forEach(btn => {

    btn.onclick = () => {

  const base = snapshot.docs.find(
    d => d.id === btn.dataset.id
  );

  if (!base)
    return;

  const data =
    base.data();

     baseEditando =
  btn.dataset.id;

      document.getElementById(
  "tituloModalUnidad"
).innerText =
  "🏠 Editar Base";

alert(
  "EDITANDO: " +
  baseEditando
);

console.log(
  "EDITANDO:",
  baseEditando
);

  document.getElementById(
    "nombreBase"
  ).value =
    data.nombre || "";

  document.getElementById(
    "latitudBase"
  ).value =
    data.ubicacion?.latitude || "";

  document.getElementById(
    "longitudBase"
  ).value =
    data.ubicacion?.longitude || "";

  document.getElementById(
    "modalUnidad"
  ).style.display =
    "flex";

};


  });


}
document.getElementById(
  "cerrarModalUnidad"
).onclick = () => {

  document.getElementById(
    "modalUnidad"
  ).style.display =
    "none";

};

document.getElementById(
  "guardarUnidad"
).onclick = async () => {

  const nombre =
    document.getElementById(
      "nombreBase"
    ).value.trim();

  const latitud =
    document.getElementById(
      "latitudBase"
    ).value.trim();

  const longitud =
    document.getElementById(
      "longitudBase"
    ).value.trim();

  const activa =
    document.getElementById(
      "activaUnidad"
    ).checked;

  console.log(
  "BASE EDITANDO:",
  baseEditando
);

await setDoc(

  doc(
    db,
    "bases",
    baseEditando || nombre.replace(/\s/g, "")
  ),

  {
    nombre: nombre,

    activa: activa,

   ubicacion: new GeoPoint(
  Number(latitud),
  Number(longitud)
)

  }

);

alert(
  "✅ Base guardada"
);

  document.getElementById(
  "modalUnidad"
).style.display =
  "none";

await cargarBases();

};
