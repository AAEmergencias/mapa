import {
  db,
  collection,
  getDocs
}
from "./firebase.js";

console.log(
  "✅ informe.js cargado"
);

async function cargarInforme() {

  const partesSnap =
    await getDocs(
      collection(
        db,
        "partes"
      )
    );

  const trasladosSnap =
    await getDocs(
      collection(
        db,
        "traslados"
      )
    );

  const totalEmergencias =
    partesSnap.size;

  const totalTraslados =
    trasladosSnap.size;

  const totalPartes =
    partesSnap.size;

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

<section>

<h2>
📊 Resumen Ejecutivo
</h2>

<div class="kpiGrid">

  <div class="kpiCard">

    <span>
      🚨 Emergencias
    </span>

    <b>
      ${totalEmergencias}
    </b>

  </div>

  <div class="kpiCard">

    <span>
      🚑 Traslados
    </span>

    <b>
      ${totalTraslados}
    </b>

  </div>

  <div class="kpiCard">

    <span>
      ✅ Partes
    </span>

    <b>
      ${totalPartes}
    </b>

  </div>

  <div class="kpiCard">

  <span>
    🚒 Con Brigada
  </span>

  <b>
    7
  </b>

</div>

<div class="kpiCard">

  <span>
    🚑 Con Médico
  </span>

  <b>
    3
  </b>

</div>

<div class="kpiCard">

  <span>
    ⚪ Sin Médico
  </span>

  <b>
    5
  </b>

</div>

</div>

<div class="kpiGrid">

  <div class="kpiCard">

    <span>
      🏆 Brigada Top
    </span>

    <b>
      R1 / Mina
    </b>

  </div>

  <div class="kpiCard">

    <span>
      🚑 Ambulancia Top
    </span>

    <b>
      S1 / Pérez
    </b>

  </div>

  <div class="kpiCard">

    <span>
      ⏱ Tiempo Promedio
    </span>

    <b>
      8 min
    </b>

  </div>

</div>

</section>

<section>

<h2>
📈 Gráficos Operacionales
</h2>

</section>

<section>

<h2>
📋 Detalle de Emergencias
</h2>

</section>

<section>

<h2>
✅ Conclusiones Operacionales
</h2>

</section>

`;

}

cargarInforme();
