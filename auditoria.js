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

let auditoriaCompleta = [];

let filtroActual =
  "Todas las acciones";

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

  auditoriaCompleta = registros;


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

  <td
  class="accion"

  data-accion="${data.accion || ""}"

>

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

document.getElementById(
  "buscadorAuditoria"
).addEventListener(
  "input",
  (e) => {

    const texto =
      e.target.value
        .toLowerCase();

    const lista =
      document.getElementById(
        "listaAuditoria"
      );

    lista.innerHTML = "";

    auditoriaCompleta
      .filter(item => {

        return JSON.stringify(item)
          .toLowerCase()
          .includes(texto);

      })
      .forEach(data => {

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

      });

  }
);

document.querySelectorAll(
  ".filtroBtn"
).forEach(boton => {

  boton.addEventListener(
    "click",
    () => {

      document
  .querySelectorAll(
    ".filtroBtn"
  )
  .forEach(btn => {

    btn.classList.remove(
      "filtroActivo"
    );

  });

boton.classList.add(
  "filtroActivo"
);

      const filtro =
        boton.dataset.filtro;

      filtroActual =
  filtro === "todos"
    ? "Todas las acciones"
    : filtro;

      const lista =
        document.getElementById(
          "listaAuditoria"
        );

      lista.innerHTML = "";

      const registrosFiltrados =

        filtro === "todos"

          ? auditoriaCompleta

          : auditoriaCompleta.filter(
              item =>
                item.accion === filtro
            );

      registrosFiltrados.forEach(
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

  <td
    class="accion"
    data-accion="${data.accion || ""}"
  >
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
  );

});

document.getElementById(
  "btnImprimirAuditoria"
).addEventListener(
  "click",
  () => {

    document.getElementById(
      "fechaImpresion"
    ).innerHTML =

      "Emitido: " +

      new Date()
        .toLocaleString();

    document.getElementById(
      "filtroImpresion"
    ).innerHTML =

      "Filtro aplicado: " +

      filtroActual;

    window.print();

  }
);
