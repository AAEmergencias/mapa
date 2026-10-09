import {
  db,
  collection,
  getDocs
}
from "./firebase.js";

console.log(
  "✅ informe.js cargado"
);

document.getElementById(
  "informe"
).innerHTML = `

<div class="portada">

  <img
    src="logo.png"
    class="logoInforme"
  >

  <h1>
    CONDOR
  </h1>

  <h2>
    Sistema Integral de Gestión de Emergencias
  </h2>

  <h3>
    Informe Ejecutivo Operacional
  </h3>

  <div class="infoPortada">

    <p>
      Fecha Emisión:
      ${new Date().toLocaleString()}
    </p>

    <p>
      Generado por:
      CONDOR
    </p>

  </div>

</div>

`;
