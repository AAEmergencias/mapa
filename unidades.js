import {

  auth,
  db,

  onAuthStateChanged,

  doc,
  getDoc,

  collection,
  getDocs,

  setDoc

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

  <td>

  <button
    class="btnEditarUnidad"
    data-codigo="${data.codigo}"
  >

    ✏️

  </button>

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

document.getElementById(
  "guardarUnidad"
).onclick = async () => {

    const codigo =
    document.getElementById(
      "codigoUnidad"
    ).value.trim();

  const nombre =
    document.getElementById(
      "nombreUnidad"
    ).value.trim();

  const base =
    document.getElementById(
      "baseUnidad"
    ).value.trim();

  const categoria =
    document.getElementById(
      "categoriaUnidad"
    ).value.trim();

    if (

    !codigo ||

    !nombre ||

    !base ||

    !categoria

  ) {

    alert(
      "⚠️ Complete todos los campos"
    );

    return;

  }

    await setDoc(
    doc(
      db,
      "unidades",
      codigo
    ),
    {

      codigo,

      nombre,

      base,

      activa: true,

      categorias: [
        categoria
      ]

    }
  );

    alert(
    "✅ Unidad creada"
  );

    document.getElementById(
    "modalUnidad"
  ).style.display = "none";

    cargarUnidades();

  };
