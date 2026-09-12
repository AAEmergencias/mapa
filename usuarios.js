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


console.log(
  "👑 Gestión de Usuarios iniciada"
);

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    const usuarioDoc =
      await getDoc(
        doc(
          db,
          "usuarios",
          user.email
        )
      );

    if (!usuarioDoc.exists()) {

      window.location.href =
        "index.html";

      return;

    }

    const datos =
      usuarioDoc.data();

    if (

      datos.rol
        ?.toLowerCase()
        .trim()

      !==

      "superadmin"

    ) {

      alert(
        "⛔ Acceso restringido"
      );

      window.location.href =
        "index.html";

      return;

    }

    console.log(
      "✅ SuperAdmin autorizado"
    );

    const listaUsuarios =
  document.getElementById(
    "listaUsuarios"
  );

const usuariosSnapshot =
  await getDocs(
    collection(
      db,
      "usuarios"
    )
  );

listaUsuarios.innerHTML = "";

usuariosSnapshot.forEach(
  usuario => {

    const data =
      usuario.data();

    listaUsuarios.innerHTML += `

<tr>

    <td>
        ${data.nombre || "-"}
    </td>

    <td>
        ${usuario.id}
    </td>

    <td>
        ${data.rol || "-"}
    </td>

    <td>
        ${data.turno || "-"}
    </td>

    <td>
        ${
          data.activo
            ? "✅ Activo"
            : "❌ Inactivo"
        }
    </td>

    <td>

    <button
  class="btnAccion btnVer"

  data-nombre="${data.nombre}"

  data-correo="${usuario.id}"

  data-rol="${data.rol}"

  data-turno="${data.turno}"

  data-activo="${data.activo}"

>
  Ver
</button>

</td>

</tr>

`;

  }
);

      }
);
