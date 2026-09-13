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
  "📋 Bitácora Operacional cargada"
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

      datos.rol !== "admin" &&

      datos.rol !== "superadmin"

    ) {

      alert(
        "⛔ Acceso restringido"
      );

      window.location.href =
        "index.html";

      return;

    }

    cargarAuditoria();

  }
);

async function cargarAuditoria() {

  const lista =
    document.getElementById(
      "listaAuditoria"
    );

  lista.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(
        db,
        "auditoriaOperacional"
      )
    );

  const registros = [];

snapshot.forEach(docSnap => {

  registros.push(
    docSnap.data()
  );

});

  registros.sort(

  (a, b) =>

    b.timestamp -
    a.timestamp

);


 registros.forEach(
  data => {
    
      lista.innerHTML += `

<tr>

  <td>
    ${data.fecha || "-"}
  </td>

  <td>
    ${data.hora || "-"}
  </td>

  <td>
    ${data.usuario || "-"}
  </td>

  <td>
    ${data.accion || "-"}
  </td>

  <td>
    ${data.detalle || "-"}

    ${
      data.nota

        ? `<br><small>📝 ${data.nota}</small>`

        : ""

    }

  </td>

</tr>

`;

    }
  );

}

