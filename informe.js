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

<section class="portada">

  <img
    src="logo.png"
    class="logoInforme"
  >

  <h1>CONDOR</h1>

  <h2>
    Sistema Integral de Gestión de Emergencias
  </h2>

  <h3>
    Informe Ejecutivo Operacional
  </h3>

</section>

<section id="resumen">

  <h2>
    📊 Resumen Ejecutivo
  </h2>

</section>

<section id="graficos">

  <h2>
    📈 Gráficos Operacionales
  </h2>

</section>

<section id="tabla">

  <h2>
    📋 Detalle de Emergencias
  </h2>

</section>

<section id="conclusiones">

  <h2>
    ✅ Conclusiones Operacionales
  </h2>

</section>

`;
