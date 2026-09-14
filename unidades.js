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

let unidadEditando = null;

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

<tr class="${
  data.activa
    ? ""
    : "unidadInactiva"
}">

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

  console.log(
  "Botones editar listos"
);

  document
  .querySelectorAll(
    ".btnEditarUnidad"
  )
  .forEach(btn => {

    btn.onclick = () => {

      const codigo =
  btn.dataset.codigo;

const docUnidad =
  snapshot.docs.find(
    d =>
      d.data().codigo ===
      codigo
  );

if (!docUnidad)
  return;

      const data =
  docUnidad.data();

      unidadEditando =
  codigo;

      document.getElementById(
  "tituloModalUnidad"
).innerText =
  "✏️ Editar Unidad";

      document.getElementById(
  "codigoUnidad"
).value =
  data.codigo || "";

      document.getElementById(
  "nombreUnidad"
).value =
  data.nombre || "";

      document.getElementById(
  "baseUnidad"
).value =
  data.base || "";

     document.getElementById(
  "capacidadesUnidad"
).value =
  (data.categorias || [])
    .join(", ");
      
      document.getElementById(
  "activaUnidad"
).checked =
  data.activa ?? true;

      document.getElementById(
  "modalUnidad"
).style.display =
  "flex";
      
    };

  });

}

document.getElementById(
  "btnNuevaUnidad"
).onclick = () => {

  unidadEditando = null;

  document.getElementById(
  "activaUnidad"
).checked = true;

  document.getElementById(
  "tituloModalUnidad"
).innerText =
  "🚒 Nueva Unidad";
  

  document.getElementById(
    "codigoUnidad"
  ).value = "";

  document.getElementById(
    "nombreUnidad"
  ).value = "";

  document.getElementById(
    "baseUnidad"
  ).value = "";

  document.getElementById(
    "capacidadesUnidad"
).value = "";

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

 const categorias =

  document
    .getElementById(
      "capacidadesUnidad"
    )
    .value

    .split(",")

    .map(x => x.trim())

    .filter(x => x);

  const activa =
  document.getElementById(
    "activaUnidad"
  ).checked;

   if (

    !codigo ||

    !nombre ||

    !base ||

    categorias.length === 0

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

      activa: activa,

      categorias:
  categorias

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
