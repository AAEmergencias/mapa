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

  const partes = [];

partesSnap.forEach(doc => {

  partes.push(
    doc.data()
  );

});

  let porMes = {};

  const MESES = {

  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre"

};

  let porTipo = {};

  let porFaena = {};

  let porEmpresa = {};

  let porUnidad = {};

  partes.forEach(parte => {

  const tipo =
    parte.tipo;

  if (!tipo)
    return;

  porTipo[tipo] =
    (porTipo[tipo] || 0) + 1;

});

  partes.forEach(parte => {

  const faena =
    parte.faena;

  if (!faena)
    return;

  porFaena[faena] =
    (porFaena[faena] || 0) + 1;

});

  partes.forEach(parte => {

  const empresa =
    parte.empresa;

  if (!empresa)
    return;

  porEmpresa[empresa] =
    (porEmpresa[empresa] || 0) + 1;

});

  partes.forEach(parte => {

  if (!parte.vehiculo)
    return;

  parte.vehiculo
    .split(",")

    .forEach(v => {

      const unidad =
        v.trim();

      if (!unidad)
        return;

      porUnidad[unidad] =
        (porUnidad[unidad] || 0) + 1;

    });

});

  console.log(
  "DATOS POR UNIDAD:",
  porUnidad
);

  console.log(
  "DATOS POR EMPRESA:",
  porEmpresa
);

  console.log(
  "PARTES COMPLETAS:",
  partes
);

console.log(
  "POR TIPO:",
  porTipo
);

console.log(
  "TOTAL PARTES:",
  partes.length
);

  partes.forEach(parte => {

  if (!parte.fecha)
    return;

  const mesNumero =
    parte.fecha.split("-")[1];

  const nombreMes =
    MESES[mesNumero] || mesNumero;

  porMes[nombreMes] =
    (porMes[nombreMes] || 0) + 1;

});

  let brigadas = {};

  let ambulancias = {};

  partes.forEach(parte => {

  if (!parte.vehiculo)
    return;

  parte.vehiculo
    .split(",")

    .forEach(v => {

      const unidad =
        v.trim();

      if (
        unidad.startsWith("S")
      ) {

        ambulancias[unidad] =
          (ambulancias[unidad] || 0) + 1;

      }

    });

});

  const ambulanciaTop =

  Object.entries(
    ambulancias
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

  partes.forEach(parte => {

  const brigada =
    parte.brigada;

  if (!brigada)
    return;

  brigadas[brigada] =
    (brigadas[brigada] || 0) + 1;

});


  const brigadaTop =

  Object.entries(
    brigadas
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

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
  ${
    brigadaTop
      ? brigadaTop[0]
      : "-"
  }
</b>


  </div>

  <div class="kpiCard">

    <span>
      🚑 Ambulancia Top
    </span>

    <b>
  ${
    ambulanciaTop
      ? ambulanciaTop[0]
      : "-"
  }
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

<div class="graficosGrid">

  <div class="graficoCard">

    <h3>
      Emergencias por Mes
    </h3>

    <canvas
      id="graficoMesInforme">
    </canvas>

  </div>

  <div class="graficoCard">

    <h3>
      Emergencias por Tipo
    </h3>

    <canvas
      id="graficoTipoInforme">
    </canvas>

  </div>

  <div class="graficoCard">

  <h3>
    Emergencias por Faena
  </h3>

  <canvas
    id="graficoFaenaInforme">
  </canvas>

</div>

<div class="graficoCard">

  <h3>
    Unidades Más Utilizadas
  </h3>

  <canvas
    id="graficoUnidadInforme">
  </canvas>

</div>

<div class="graficoCard">

  <h3>
    Emergencias por Empresa
  </h3>

  <canvas
    id="graficoEmpresaInforme">
  </canvas>

</div>

</div>

</section>

<section>

<h2>
📋 Detalle de Emergencias
</h2>

<table id="tablaEmergencias">

  <thead>

    <tr>

      <th>Fecha</th>

      <th>Tipo</th>

      <th>Faena</th>

      <th>Brigada</th>

    </tr>

  </thead>

 <tbody>

${partes.map(parte => `

<tr>

  <td>
    ${parte.fecha || "-"}
  </td>

  <td>
    ${parte.tipo || "-"}
  </td>

  <td>
    ${parte.faena || "-"}
  </td>

  <td>
    ${parte.brigada || "-"}
  </td>

</tr>

`).join("")}

</tbody>

</table>

</section>

<section>

<h2>
✅ Conclusiones Operacionales
</h2>

<div id="conclusionesTexto">

</div>

</section>

`;

  console.log(
  "DATOS POR MES:",
  porMes
);

// ==========================
// GRAFICO MES
// ==========================

new Chart(

  document.getElementById(
    "graficoMesInforme"
  ),

  {

    type: "bar",

    data: {

      labels:
        Object.keys(
          porMes
        ),

      datasets: [{

        label:
          "Emergencias",

        data:
          Object.values(
            porMes
          ),

        backgroundColor:
          "#005b96"

      }]

    }

  }

);

  console.log(
  "DATOS POR TIPO:",
  porTipo
);

// ==========================
// GRAFICO TIPO
// ==========================

const ctxTipo =
  document.getElementById(
    "graficoTipoInforme"
  );

if (ctxTipo) {

  new Chart(

    ctxTipo,

    {

      type: "pie",

      data: {

        labels:
          Object.keys(
            porTipo
          ),

        datasets: [{

          data:
            Object.values(
              porTipo
            ),

          backgroundColor: [

            "#005b96",
            "#00AEEF",
            "#00A651",
            "#F7941D",
            "#D71920"

          ]

        }]

      }

    }

  );

}

// ==========================
// GRAFICO FAENA
// ==========================

new Chart(

  document.getElementById(
    "graficoFaenaInforme"
  ),

  {

    type: "bar",

    data: {

      labels:
        Object.keys(
          porFaena
        ),

      datasets: [{

        label:
          "Emergencias",

        data:
          Object.values(
            porFaena
          ),

        backgroundColor:
          "#00A651"

      }]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false

    }

  }

);

// ==========================
// GRAFICO UNIDADES
// ==========================

new Chart(

  document.getElementById(
    "graficoUnidadInforme"
  ),

  {

    type: "bar",

    data: {

      labels:
        Object.keys(
          porUnidad
        ),

      datasets: [{

        label:
          "Utilizaciones",

        data:
          Object.values(
            porUnidad
          ),

        backgroundColor:
          "#f59e0b"

      }]

    },

    options: {

      indexAxis: "y",

      responsive: true,

      maintainAspectRatio: false

    }

  }

);

  // ==========================
// GRAFICO EMPRESA
// ==========================

new Chart(

  document.getElementById(
    "graficoEmpresaInforme"
  ),

  {

    type: "bar",

    data: {

      labels:
        Object.keys(
          porEmpresa
        ),

      datasets: [{

        label:
          "Emergencias",

        data:
          Object.values(
            porEmpresa
          ),

        backgroundColor:
          "#8b5cf6"

      }]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      indexAxis: "y"

    }

  }

);

  const tipoTop =

  Object.entries(
    porTipo
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

  const faenaTop =

  Object.entries(
    porFaena
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

 document.getElementById(
  "conclusionesTexto"
).innerHTML = `

<p>

Se registraron
<b>${totalEmergencias}</b>
emergencias durante el período analizado.

</p>

<p>

La brigada con mayor participación fue
<b>
${brigadaTop
  ? brigadaTop[0]
  : "-"
}
</b>.

</p>

<p>

El tipo de emergencia predominante fue
<b>
${tipoTop
  ? tipoTop[0]
  : "-"
}
</b>.

</p>

<p>

La faena con mayor cantidad de eventos fue
<b>
${faenaTop
  ? faenaTop[0]
  : "-"
}
</b>.

</p>

<p>

Se registraron
<b>${totalTraslados}</b>
traslados durante el período.

</p>

`;

  }

cargarInforme();
