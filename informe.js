import {
  db,
  collection,
  getDocs
}
from "./firebase.js";

console.log(
  "✅ informe.js cargado"
);

async function cargarInforme(
  partesExternas = null
) {

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

  let partes = [];

partesSnap.forEach(doc => {

  partes.push(
    doc.data()
  );

});

  const partesOriginales =

  [...partes];

  if (partesExternas) {

  partes =
    partesExternas;

}

  const aniosDisponibles =
  [...new Set(

    partesOriginales

      .map(
        p => p.fecha?.split("-")[0]
      )

      .filter(Boolean)

  )]

  .sort();

  console.log(
  "AÑOS DISPONIBLES:",
  aniosDisponibles
);

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

  let porSubtipo = {};

  let porFaena = {};

  let porEmpresa = {};

  let porUnidad = {};

  let porPUE = {};

  let porHorario = {

  Madrugada: 0,

  Mañana: 0,

  Tarde: 0,

  Noche: 0

};

  partes.forEach(parte => {

  const tipo =
    parte.tipo;

  if (!tipo)
    return;

  porTipo[tipo] =
    (porTipo[tipo] || 0) + 1;

});

  partes.forEach(parte => {

  const subtipo =
    parte.subtipo;

  if (!subtipo)
    return;

  porSubtipo[subtipo] =
    (porSubtipo[subtipo] || 0) + 1;

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

  partes.forEach(parte => {

  const pue =
    parte.pue;

  if (!pue)
    return;

  porPUE[pue] =
    (porPUE[pue] || 0) + 1;

});
  

  partes.forEach(parte => {

  if (!parte.horaActivacion)
    return;

  const hora =
    parseInt(
      parte.horaActivacion.split(":")[0]
    );

  if (hora >= 0 && hora <= 5) {

    porHorario.Madrugada++;

  }

  else if (hora <= 11) {

    porHorario.Mañana++;

  }

  else if (hora <= 17) {

    porHorario.Tarde++;

  }

  else {

    porHorario.Noche++;

  }

});

  console.log(
  "DATOS POR UNIDAD:",
  porUnidad
);

  console.log(
  "DATOS POR HORARIO:",
  porHorario
);

  console.log(
  "DATOS POR EMPRESA:",
  porEmpresa
);

  console.log(
  "DATOS POR PUE:",
  porPUE
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
  "POR SUBTIPO:",
  porSubtipo
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

  const conBrigada =
  partes.filter(
    p => p.brigada
  ).length;

  const porcentajeBrigada =

  Math.round(
    (conBrigada /
    totalEmergencias) * 100
  );

const conMedico =
  partes.filter(
    p => p.servicioMedico
  ).length; 

  const porcentajeMedico =

  Math.round(
    (conMedico /
    totalEmergencias) * 100
  );

const sinMedico =
  totalEmergencias -
  conMedico;

  const porcentajeSinMedico =

  Math.round(
    (sinMedico /
    totalEmergencias) * 100
  );

  let totalMinutos = 0;

let cantidadDuraciones = 0;

  partes.forEach(parte => {

  if (
    !parte.horaActivacion ||
    !parte.horaCierre
  ) return;

  const inicio =
    new Date(
      `2000-01-01 ${parte.horaActivacion}`
    );

  const fin =
    new Date(
      `2000-01-01 ${parte.horaCierre}`
    );

  const diferencia =
    (fin - inicio) /
    1000 /
    60;

  totalMinutos += diferencia;

  cantidadDuraciones++;

});

const promedioEmergencias =

  cantidadDuraciones > 0

    ? Math.round(
        totalMinutos /
        cantidadDuraciones
      )

    : 0;


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

  const faenaTop =

  Object.entries(
    porFaena
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

const horarioTop =

  Object.entries(
    porHorario
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

  const tipoTop =

  Object.entries(
    porTipo
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

  const empresaTop =

  Object.entries(
    porEmpresa
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

  const pueTop =

  Object.entries(
    porPUE
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];

  const subtipoTop =

  Object.entries(
    porSubtipo
  )

  .sort(
    (a,b) => b[1] - a[1]
  )[0];


  document.getElementById(
    "informe"
  ).innerHTML = `

 <div class="barraAcciones">

  <select id="filtroAnio">

    <option value="">
      Todos los años
    </option>

  </select>

  <select id="filtroMes">

    <option value="">
      Todos los meses
    </option>

    <option value="01">Enero</option>
    <option value="02">Febrero</option>
    <option value="03">Marzo</option>
    <option value="04">Abril</option>
    <option value="05">Mayo</option>
    <option value="06">Junio</option>
    <option value="07">Julio</option>
    <option value="08">Agosto</option>
    <option value="09">Septiembre</option>
    <option value="10">Octubre</option>
    <option value="11">Noviembre</option>
    <option value="12">Diciembre</option>

  </select>

  <button id="btnFiltrar">

    🔍 Filtrar

  </button>

  <button id="btnImprimir">

    🖨 Imprimir Informe

  </button>

  <button id="btnPPT">

    📊 Descargar PPTX

  </button>

</div>

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

  <p class="ultimaActualizacion">

  Última actualización:

  ${new Date().toLocaleString()}

</p>

</section>

<section>

<h2>
📊 Resumen Ejecutivo
</h2>

<div id="periodoSeleccionado">

  📅 Mostrando:

  ${textoPeriodo}

</div>

<h3 class="grupoTitulo">

📌 Indicadores Generales

</h3>

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

  </div>

   <h3 class="grupoTitulo">

🚒 Participación Operacional

</h3>

<div class="kpiGrid">

  <div class="kpiCard">

 <span>
  🚒 Con Brigada
</span>

<b>
  ${conBrigada}
</b>

<small>
  ${porcentajeBrigada}%
</small>

</div>

<div class="kpiCard">

  <span>
  🚑 Con Médico
</span>

<b>
  ${conMedico}
</b>

<small>
  ${porcentajeMedico}%
</small>

</div>

<div class="kpiCard">

  <span>
  ⚪ Sin Médico
</span>

<b>
  ${sinMedico}
</b>

<small>
  ${porcentajeSinMedico}%
</small>

</div>

</div>

<h3 class="grupoTitulo">

🏆 Indicadores Destacados

</h3>

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

<small>

  ${
    brigadaTop
      ? brigadaTop[1]
      : 0
  }

  activaciones

</small>

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

<small>

  ${
    ambulancias[
      ambulanciaTop?.[0]
    ] || 0
  }

  activaciones

</small>

  </div>

  <div class="kpiCard">

    <span>
      ⏱ Tiempo Promedio
    </span>

   <b>
  ${promedioEmergencias} min
</b>

<small>

  promedio atención

</small>



  </div>

<div class="kpiCard">

  <span>
    🏭 Faena Top
  </span>

  <b>
    ${
      faenaTop
        ? faenaTop[0]
        : "-"
    }
  </b>

  <small>

  ${
    faenaTop
      ? faenaTop[1]
      : 0
  }

  eventos

</small>

</div>

</div>

<div class="hallazgosRapidos">

  <h4>

    📍 Lectura Ejecutiva Rápida

  </h4>

 <div class="hallazgoBox">

  <div class="hallazgoHeader">

    <b>
      🕒 Horario más frecuente
    </b>

    <span>

      ${
        horarioTop
          ? horarioTop[0]
          : "-"
      }

      (${horarioTop
        ? horarioTop[1]
        : 0})

    </span>

  </div>

  <div class="hallazgoFila">

    <div>

      🌙 Madrugada

      <small>
        00:00 - 05:59
      </small>

    </div>

    <strong>
      ${porHorario.Madrugada}
    </strong>

  </div>

  <div class="hallazgoFila">

    <div>

      ☀️ Mañana

      <small>
        06:00 - 11:59
      </small>

    </div>

    <strong>
      ${porHorario.Mañana}
    </strong>

  </div>

  <div class="hallazgoFila">

    <div>

      🌤️ Tarde

      <small>
        12:00 - 17:59
      </small>

    </div>

    <strong>
      ${porHorario.Tarde}
    </strong>

  </div>

  <div class="hallazgoFila">

    <div>

      🌃 Noche

      <small>
        18:00 - 23:59
      </small>

    </div>

    <strong>
      ${porHorario.Noche}
    </strong>

  </div>

</div>

<div class="hallazgoBox">

  <div class="hallazgoHeader">

    <b>
      🚨 Tipo más frecuente
    </b>

    <span>

      ${
        tipoTop
          ? tipoTop[0]
          : "-"
      }

      (${tipoTop
        ? tipoTop[1]
        : 0})

    </span>

  </div>

${Object.entries(porTipo)

  .sort(
    (a,b) => b[1] - a[1]
  )

  .map(([tipo, valor]) => {

    const icono = {

  "Incendio": "🔥",

  "Vehicular": "🚗",

  "Rescate": "🧗",

  "Medico": "🏥",

  "Médico": "🏥",

  "Hazmat": "☣️",

  "Simulacros": "🎯",

  "Sísmico": "🌎",

  "Sismico": "🌎",

  "Meteorologico": "🌧️",

  "Meteorológico": "🌧️",

  "Geológico": "⛰️",

  "Geologico": "⛰️",

  "Ambiental": "🌱",

  "Otros": "📦"

}[tipo] || "🚨";

    return `

      <div class="hallazgoFila">

        <div>

          ${icono} ${tipo}

        </div>

        <strong>

          ${valor}

        </strong>

      </div>

    `;

 

  })

  .join("")}

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

<div class="graficoCard">

  <h3>
    Subcategorización de Emergencias
  </h3>

  <canvas
    id="graficoSubtipoInforme">
  </canvas>

</div>

<div class="graficoCard">

  <h3>
    Emergencias por Horario
  </h3>

  <canvas
    id="graficoHorarioInforme">
  </canvas>

</div>

<div class="graficoCard">

  <h3>
    PUE Relacionado
  </h3>

  <canvas
    id="graficoPUEInforme">
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

      <th>Subtipo</th>

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
  ${parte.subtipo || "-"}
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

     const filtroAnio =
  document.getElementById(
    "filtroAnio"
  );

    console.log(
  "SELECT ENCONTRADO:",
  filtroAnio
);
    
    aniosDisponibles
  .forEach(anio => {

    filtroAnio.innerHTML += `

      <option value="${anio}">

        ${anio}

      </option>

    `;

  });

    console.log(
  "HTML DEL SELECT:",
  filtroAnio.innerHTML
);

    document.getElementById(
  "btnFiltrar"
).onclick = () => {

  const anioSeleccionado =

    document.getElementById(
      "filtroAnio"
    ).value;

      const mesSeleccionado =

  document.getElementById(
    "filtroMes"
  ).value;

      let textoPeriodo =
  "Todos los registros disponibles";

      const nombreMes = {

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

}[mesSeleccionado];

      if (
  anioSeleccionado &&
  mesSeleccionado
) {

  textoPeriodo =

    `${nombreMes} ${anioSeleccionado}`;

}
else if (
  anioSeleccionado
) {

  textoPeriodo =

    `Todos los meses de ${anioSeleccionado}`;

}
else if (
  mesSeleccionado
) {

  textoPeriodo =

    `${nombreMes} de todos los años`;

}

      console.log(
  "PERIODO:",
  textoPeriodo
);

const partesFiltradas =

  partesOriginales.filter(parte => {

    if (!parte.fecha)
      return false;

    const anioParte =
      parte.fecha.split("-")[0];

    const mesParte =

  parte.fecha
    .split("-")[1]
    .padStart(2, "0");

    console.log(
  "MES PARTE:",
  mesParte
);

    const cumpleAnio =

      !anioSeleccionado ||

      anioParte ===
      anioSeleccionado;

    const cumpleMes =

      !mesSeleccionado ||

      mesParte ===
      mesSeleccionado;

    return (
      cumpleAnio &&
      cumpleMes
    );

  });

cargarInforme(
  partesFiltradas
);

};


  Chart.register(
  ChartDataLabels
);

// ==========================
// GRAFICO MES
// ==========================

  Chart.getChart(
  "graficoMesInforme"
)?.destroy();

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

    },

    options: {

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 16

      },

      anchor: "center",

      align: "center"

    }

  }

}

  }

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

      },

      options: {

        plugins: {

          datalabels: {

            color: "#ffffff",

            textStrokeColor: "#000000",

            textStrokeWidth: 2,

            font: {

              weight: "bold",

              size: 14

            }

          }

        }

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

  maintainAspectRatio: false,

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 16

      }

    }

  }

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

  maintainAspectRatio: false,

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 16

      }

    }

  }

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

  indexAxis: "y",

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 16

      }

    }

  }

}

  }

);

// ==========================
// GRAFICO SUBTIPO
// ==========================

new Chart(

  document.getElementById(
    "graficoSubtipoInforme"
  ),

  {

    type: "bar",

    data: {

      labels:

        Object.keys(
          porSubtipo
        ).map(nombre => {

          if (
            nombre.length > 30
          ) {

            const mitad =
              Math.floor(
                nombre.length / 2
              );

            const espacio =
              nombre.indexOf(
                " ",
                mitad
              );

            if (espacio > 0) {

              return [

                nombre.substring(
                  0,
                  espacio
                ),

                nombre.substring(
                  espacio + 1
                )

              ];

            }

          }

          return nombre;

        }),

      datasets: [{

        label:
          "Emergencias",

        data:
          Object.values(
            porSubtipo
          ),

        backgroundColor:
          "#14b8a6"

      }]

    },

  options: {

  indexAxis: "y",

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 14

      }

    }

  }

}

  }

);

  // ==========================
// GRAFICO HORARIO
// ==========================

new Chart(

  document.getElementById(
    "graficoHorarioInforme"
  ),

  {

    type: "bar",

    data: {

      labels:
        Object.keys(
          porHorario
        ),

      datasets: [{

        label:
          "Emergencias",

        data:
          Object.values(
            porHorario
          ),

        backgroundColor:
          "#ef4444"

      }]

    },

   options: {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 16

      }

    }

  }

}

  }

);

  // ==========================
// GRAFICO PUE
// ==========================

new Chart(

  document.getElementById(
    "graficoPUEInforme"
  ),

  {

    type: "bar",

    data: {

      labels:
        Object.keys(
          porPUE
        ),

      datasets: [{

        label:
          "Eventos",

        data:
          Object.values(
            porPUE
          ),

        backgroundColor:
          "#dc2626"

      }]

    },

  options: {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    datalabels: {

      color: "#ffffff",

      textStrokeColor: "#000000",

      textStrokeWidth: 2,

      font: {

        weight: "bold",

        size: 16

      }

    }

  }

}

  }

);

document.getElementById(
  "conclusionesTexto"
).innerHTML = `

<p>

Durante el período analizado se registraron
<b>${totalEmergencias}</b>
emergencias operacionales y
<b>${totalTraslados}</b>
traslados.

</p>

<p>

La actividad operacional se concentró principalmente en
<b>
${faenaTop
  ? faenaTop[0]
  : "-"
}
</b>,
constituyéndose como la faena con mayor número de eventos.

</p>

<p>

La empresa con mayor participación operacional fue
<b>
${empresaTop
  ? empresaTop[0]
  : "-"
}
</b>.

</p>

<p>

La categoría predominante correspondió a
<b>
${tipoTop
  ? tipoTop[0]
  : "-"
}
</b>.

</p>

<p>

El subtipo predominante correspondió a
<b>
${subtipoTop
  ? subtipoTop[0]
  : "-"
}
</b>.

</p>

<p>

El horario con mayor frecuencia de activaciones fue
<b>
${horarioTop
  ? horarioTop[0]
  : "-"
}
</b>.

</p>

<p>

El PUE predominante fue
<b>
${pueTop
  ? pueTop[0]
  : "-"
}
</b>.

</p>

<p>

La brigada con mayor participación fue
<b>
${brigadaTop
  ? brigadaTop[0]
  : "-"
}
</b>,
mientras que la ambulancia con mayor utilización fue
<b>
${ambulanciaTop
  ? ambulanciaTop[0]
  : "-"
}
</b>.

</p>

<p>

El tiempo promedio de atención registrado fue de
<b>${promedioEmergencias} minutos</b>.

</p>

`;

  document.getElementById(
  "btnImprimir"
).onclick = () => {

  window.print();

};

document.getElementById(
  "btnPPT"
).onclick = () => {

  const pptx =
    new PptxGenJS();

  function agregarLogo(slide) {

 function agregarPie(slide, numero) {

  slide.addText(

    "CONDOR | Informe Ejecutivo Operacional",

    {

      x: 0.3,

      y: 7.0,

      w: 6,

      h: 0.2,

      fontSize: 9,

      color: "666666"

    }

  );

  slide.addText(

    `${numero} / 13`,

    {

      x: 11.5,

      y: 7.0,

      w: 1,

      h: 0.2,

      fontSize: 9,

      color: "666666",

      align: "right"

    }

  );

}


  slide.addImage({

    path: "logo.png",

    x: 0.2,

    y: 0.1,

    w: 0.7,

    h: 0.35

  });

}

  function agregarPie(slide, numero) {

  slide.addText(

    "CONDOR | Informe Ejecutivo Operacional",

    {

      x: 0.3,

      y: 7.0,

      w: 6,

      h: 0.2,

      fontSize: 9,

      color: "666666"

    }

  );

  slide.addText(

    `${numero} / 13`,

    {

      x: 11.3,

      y: 7.0,

      w: 0.8,

      h: 0.2,

      fontSize: 9,

      color: "666666",

      align: "right"

    }

  );

}

  pptx.layout =
    "LAYOUT_WIDE";

  const graficoMesPNG =

    document
      .getElementById(
        "graficoMesInforme"
      )

      .toDataURL(
        "image/png"
      );

  const graficoTipoPNG =
  document
    .getElementById(
      "graficoTipoInforme"
    )
    .toDataURL(
      "image/png"
    );

const graficoFaenaPNG =
  document
    .getElementById(
      "graficoFaenaInforme"
    )
    .toDataURL(
      "image/png"
    );

const graficoUnidadPNG =
  document
    .getElementById(
      "graficoUnidadInforme"
    )
    .toDataURL(
      "image/png"
    );

const graficoEmpresaPNG =
  document
    .getElementById(
      "graficoEmpresaInforme"
    )
    .toDataURL(
      "image/png"
    );

const graficoHorarioPNG =
  document
    .getElementById(
      "graficoHorarioInforme"
    )
    .toDataURL(
      "image/png"
    );

const graficoSubtipoPNG =
  document
    .getElementById(
      "graficoSubtipoInforme"
    )
    .toDataURL(
      "image/png"
    );

const graficoPUEPNG =
  document
    .getElementById(
      "graficoPUEInforme"
    )
    .toDataURL(
      "image/png"
    );

  const slide =
    pptx.addSlide();

  slide.addText(

    "CONDOR",

    {

      x: 1,

     y: 1.4,

      w: 10,

      h: 0.5,

      fontSize: 24,

      bold: true,

      align: "center",

      color: "005b96"

    }

  );

  slide.addText(

    "Informe Ejecutivo Operacional",

    {

      x: 1,

      y: 2,

      w: 10,

      h: 0.5,

      fontSize: 18,

      align: "center"

    }

  );

  slide.addText(

  "Sistema Integral de Gestión de Emergencias",

  {

    x: 1,

    y: 2.6,

    w: 10,

    h: 0.3,

    fontSize: 14,

    align: "center",

    color: "666666"

  }

);

  slide.addText(

  "Central de Emergencias",

  {

    x: 1,

    y: 3.3,

    w: 10,

    h: 0.3,

    fontSize: 16,

    bold: true,

    align: "center",

    color: "005b96"

  }

);

  slide.addText(

  "Reporte Ejecutivo Automatizado",

  {

    x: 1,

    y: 3.8,

    w: 10,

    h: 0.3,

    fontSize: 13,

    align: "center",

    color: "666666"

  }

);

  slide.addText(

  new Date().toLocaleDateString(),

  {

    x: 1,

    y: 4.6,

    w: 10,

    h: 0.3,

    fontSize: 14,

    align: "center",

    color: "444444"

  }

);

    const slide2 =
  pptx.addSlide();

    slide2.addText(

  "Resumen Ejecutivo",

  {

    x: 0.5,

    y: 0.3,

    w: 4,

    h: 0.4,

    fontSize: 22,

    bold: true,

    color: "005b96"

  }

);

    slide2.addText(

  `🚨 Emergencias: ${totalEmergencias}

🚑 Traslados: ${totalTraslados}

✅ Partes: ${totalPartes}

🚒 Con Brigada: ${conBrigada}

🚑 Con Médico: ${conMedico}

⚪ Sin Médico: ${sinMedico}`,

  {

    x: 0.7,

    y: 1.2,

    w: 5,

    h: 3,

    fontSize: 18

  }

);

    const slide3 =
  pptx.addSlide();

    slide3.addText(

  "Indicadores Destacados",

  {

    x: 0.5,

    y: 0.3,

    w: 5,

    h: 0.4,

    fontSize: 22,

    bold: true,

    color: "005b96"

  }

);

slide3.addShape(

  pptx.ShapeType.roundRect,

  {

    x: 0.5,
    y: 1.2,

    w: 2.8,
    h: 1.2,

    fill: {
      color: "F0F8FF"
    },

    line: {
      color: "005b96"
    }

  }

);

slide3.addText(

  "🏆 Brigada Top",

  {

    x: 0.6,
    y: 1.35,

    w: 2.6,
    h: 0.3,

    align: "center",

    bold: true

  }

);

slide3.addText(

  brigadaTop
    ? brigadaTop[0]
    : "-",

  {

    x: 0.6,
    y: 1.75,

    w: 2.6,
    h: 0.3,

    align: "center"

  }

);

    slide3.addShape(

  pptx.ShapeType.roundRect,

  {

    x: 3.6,
    y: 1.2,

    w: 2.8,
    h: 1.2,

    fill: {
      color: "F0F8FF"
    },

    line: {
      color: "005b96"
    }

  }

);

slide3.addText(

  "🚑 Ambulancia Top",

  {

    x: 3.7,
    y: 1.35,

    w: 2.6,
    h: 0.3,

    align: "center",

    bold: true

  }

);

slide3.addText(

  ambulanciaTop
    ? ambulanciaTop[0]
    : "-",

  {

    x: 3.7,
    y: 1.75,

    w: 2.6,
    h: 0.3,

    align: "center"

  }

);

    slide3.addShape(

  pptx.ShapeType.roundRect,

  {

    x: 6.7,
    y: 1.2,

    w: 2.8,
    h: 1.2,

    fill: {
      color: "F0F8FF"
    },

    line: {
      color: "005b96"
    }

  }

);

slide3.addText(

  "🏭 Faena Top",

  {

    x: 6.8,
    y: 1.35,

    w: 2.6,
    h: 0.3,

    align: "center",

    bold: true

  }

);

slide3.addText(

  faenaTop
    ? faenaTop[0]
    : "-",

  {

    x: 6.8,
    y: 1.75,

    w: 2.6,
    h: 0.3,

    align: "center"

  }

);

    slide3.addShape(

  pptx.ShapeType.roundRect,

  {

    x: 9.8,
    y: 1.2,

    w: 2.8,
    h: 1.2,

    fill: {
      color: "F0F8FF"
    },

    line: {
      color: "005b96"
    }

  }

);

slide3.addText(

  "⏱ Tiempo Promedio",

  {

    x: 9.9,
    y: 1.35,

    w: 2.6,
    h: 0.3,

    align: "center",

    bold: true

  }

);

slide3.addText(

  `${promedioEmergencias} min`,

  {

    x: 9.9,
    y: 1.75,

    w: 2.6,
    h: 0.3,

    align: "center"

  }

);

// KPI EMERGENCIAS

slide3.addShape(
  pptx.ShapeType.roundRect,
  {
    x: 0.5,
    y: 3.0,
    w: 2.0,
    h: 0.9,
    fill: { color: "F0F8FF" },
    line: { color: "005b96" }
  }
);

slide3.addText(
  "🚨 Emergencias",
  {
    x: 0.55,
    y: 3.1,
    w: 1.9,
    h: 0.2,
    align: "center",
    bold: true,
    fontSize: 11
  }
);

slide3.addText(
  `${totalEmergencias}`,
  {
    x: 0.55,
    y: 3.4,
    w: 1.9,
    h: 0.2,
    align: "center",
    fontSize: 16,
    bold: true
  }
);

// KPI TRASLADOS

slide3.addShape(
  pptx.ShapeType.roundRect,
  {
    x: 2.8,
    y: 3.0,
    w: 2.0,
    h: 0.9,
    fill: { color: "F0F8FF" },
    line: { color: "005b96" }
  }
);

slide3.addText(
  "🚑 Traslados",
  {
    x: 2.85,
    y: 3.1,
    w: 1.9,
    h: 0.2,
    align: "center",
    bold: true,
    fontSize: 11
  }
);

slide3.addText(
  `${totalTraslados}`,
  {
    x: 2.85,
    y: 3.4,
    w: 1.9,
    h: 0.2,
    align: "center",
    fontSize: 16,
    bold: true
  }
);

// KPI PARTES

slide3.addShape(
  pptx.ShapeType.roundRect,
  {
    x: 5.1,
    y: 3.0,
    w: 2.0,
    h: 0.9,
    fill: { color: "F0F8FF" },
    line: { color: "005b96" }
  }
);

slide3.addText(
  "✅ Partes",
  {
    x: 5.15,
    y: 3.1,
    w: 1.9,
    h: 0.2,
    align: "center",
    bold: true,
    fontSize: 11
  }
);

slide3.addText(
  `${totalPartes}`,
  {
    x: 5.15,
    y: 3.4,
    w: 1.9,
    h: 0.2,
    align: "center",
    fontSize: 16,
    bold: true
  }
);

// KPI CON BRIGADA

slide3.addShape(
  pptx.ShapeType.roundRect,
  {
    x: 0.5,
    y: 4.2,
    w: 2.0,
    h: 0.9,
    fill: { color: "F0F8FF" },
    line: { color: "005b96" }
  }
);

slide3.addText(
  "🚒 Con Brigada",
  {
    x: 0.55,
    y: 4.3,
    w: 1.9,
    h: 0.2,
    align: "center",
    bold: true,
    fontSize: 10
  }
);

slide3.addText(
  `${conBrigada}`,
  {
    x: 0.55,
    y: 4.55,
    w: 1.9,
    h: 0.2,
    align: "center",
    fontSize: 16,
    bold: true
  }
);

// KPI CON MEDICO

slide3.addShape(
  pptx.ShapeType.roundRect,
  {
    x: 2.8,
    y: 4.2,
    w: 2.0,
    h: 0.9,
    fill: { color: "F0F8FF" },
    line: { color: "005b96" }
  }
);

slide3.addText(
  "🚑 Con Médico",
  {
    x: 2.85,
    y: 4.3,
    w: 1.9,
    h: 0.2,
    align: "center",
    bold: true,
    fontSize: 10
  }
);

slide3.addText(
  `${conMedico}`,
  {
    x: 2.85,
    y: 4.55,
    w: 1.9,
    h: 0.2,
    align: "center",
    fontSize: 16,
    bold: true
  }
);

// KPI SIN MEDICO

slide3.addShape(
  pptx.ShapeType.roundRect,
  {
    x: 5.1,
    y: 4.2,
    w: 2.0,
    h: 0.9,
    fill: { color: "F0F8FF" },
    line: { color: "005b96" }
  }
);

slide3.addText(
  "⚪ Sin Médico",
  {
    x: 5.15,
    y: 4.3,
    w: 1.9,
    h: 0.2,
    align: "center",
    bold: true,
    fontSize: 9
  }
);

slide3.addText(
  `${sinMedico}`,
  {
    x: 5.15,
    y: 4.55,
    w: 1.9,
    h: 0.2,
    align: "center",
    fontSize: 16,
    bold: true
  }
);


// TARJETA HORARIO

  const slide4 =
  pptx.addSlide();
  
    slide4.addText(
  "Lectura Ejecutiva Rápida",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide4.addShape(

  pptx.ShapeType.roundRect,

  {

    x: 0.5,
    y: 1.0,

    w: 5.8,
    h: 3.2,

    fill: {
      color: "F8FBFF"
    },

    line: {
      color: "005b96"
    }

  }

);

slide4.addText(

  "🕒 Horario más frecuente",

  {

    x: 0.7,
    y: 1.15,

    w: 2.8,
    h: 0.3,

    fontSize: 18,

    bold: true

  }

);

slide4.addText(

  `${horarioTop ? horarioTop[0] : "-"} (${horarioTop ? horarioTop[1] : 0})`,

  {

    x: 3.5,
    y: 1.15,

    w: 2.2,
    h: 0.3,

    fontSize: 16,

    bold: true,

    align: "right",

    color: "005b96"

  }

);

// MADRUGADA

slide4.addText(

  "🌙 Madrugada",

  {
    x: 0.8,
    y: 1.8,
    w: 2,
    h: 0.2,
    bold: true
  }

);

slide4.addText(

  "00:00 - 05:59",

  {
    x: 0.8,
    y: 2.05,
    w: 2,
    h: 0.2,
    fontSize: 10,
    color: "666666"
  }

);

slide4.addText(

  `${porHorario.Madrugada}`,

  {
    x: 4.8,
    y: 1.9,
    w: 0.6,
    h: 0.2,
    align: "right",
    bold: true
  }

);

// MAÑANA

slide4.addText(

  "☀️ Mañana",

  {
    x: 0.8,
    y: 2.45,
    w: 2,
    h: 0.2,
    bold: true
  }

);

slide4.addText(

  "06:00 - 11:59",

  {
    x: 0.8,
    y: 2.7,
    w: 2,
    h: 0.2,
    fontSize: 10,
    color: "666666"
  }

);

slide4.addText(

  `${porHorario.Mañana}`,

  {
    x: 4.8,
    y: 2.55,
    w: 0.6,
    h: 0.2,
    align: "right",
    bold: true
  }

);

// TARDE

slide4.addText(

  "🌤️ Tarde",

  {
    x: 0.8,
    y: 3.1,
    w: 2,
    h: 0.2,
    bold: true
  }

);

slide4.addText(

  "12:00 - 17:59",

  {
    x: 0.8,
    y: 3.35,
    w: 2,
    h: 0.2,
    fontSize: 10,
    color: "666666"
  }

);

slide4.addText(

  `${porHorario.Tarde}`,

  {
    x: 4.8,
    y: 3.2,
    w: 0.6,
    h: 0.2,
    align: "right",
    bold: true
  }

);

// NOCHE

slide4.addText(

  "🌃 Noche",

  {
    x: 0.8,
    y: 3.75,
    w: 2,
    h: 0.2,
    bold: true
  }

);

slide4.addText(

  "18:00 - 23:59",

  {
    x: 0.8,
    y: 4.0,
    w: 2,
    h: 0.2,
    fontSize: 10,
    color: "666666"
  }

);

slide4.addText(

  `${porHorario.Noche}`,

  {
    x: 4.8,
    y: 3.85,
    w: 0.6,
    h: 0.2,
    align: "right",
    bold: true
  }

);

    // TARJETA TIPO

slide4.addShape(

  pptx.ShapeType.roundRect,

  {

    x: 6.8,
    y: 1.0,

    w: 5.8,
    h: 3.2,

    fill: {
      color: "F8FBFF"
    },

    line: {
      color: "005b96"
    }

  }

);

    slide4.addText(

  "🚨 Tipo más frecuente",

  {

    x: 7.0,
    y: 1.15,

    w: 2.8,

    h: 0.3,

    fontSize: 18,

    bold: true

  }

);

    slide4.addText(

  `${tipoTop ? tipoTop[0] : "-"} (${tipoTop ? tipoTop[1] : 0})`,

  {

    x: 10.0,

    y: 1.15,

    w: 2.2,

    h: 0.3,

    fontSize: 16,

    bold: true,

    align: "right",

    color: "005b96"

  }

);

    const tiposOrdenados =

  Object.entries(porTipo)

  .sort(
    (a,b) => b[1] - a[1]
  );

    let yTipo = 1.8;

tiposOrdenados
  .slice(0, 5)
  .forEach(([tipo, valor]) => {

    const icono = {

  "Incendio": "🔥",

  "Vehicular": "🚗",

  "Rescate": "🧗",

  "Medico": "🏥",

  "Médico": "🏥",

  "Hazmat": "☣️",

  "Simulacros": "🎯",

  "Sísmico": "🌎",

  "Sismico": "🌎",

  "Meteorologico": "🌧️",

  "Meteorológico": "🌧️",

  "Geologico": "⛰️",

  "Geológico": "⛰️",

  "Ambiental": "🌱",

  "Otros": "📦"

}[tipo] || "🚨";

   slide4.addText(

  `${icono} ${tipo}`,

  {

    x: 7.1,

    y: yTipo,

    w: 3.5,

    h: 0.2,

    fontSize: 12,

    bold: true

  }

);

    slide4.addText(

      `${valor}`,

      {

        x: 11.2,

        y: yTipo,

        w: 0.5,

        h: 0.2,

        fontSize: 12,

        bold: true,

        align: "right"

      }

    );

    yTipo += 0.45;

  });

    const slide5 =
  pptx.addSlide();

   slide5.addText(

  "Emergencias por Mes",

  {

    x: 0.5,

    y: 0.3,

    w: 5,

    h: 0.4,

    fontSize: 22,

    bold: true,

    color: "005b96"

  }

);

slide5.addImage(

  {

    data: graficoMesPNG,

    x: 0.5,

    y: 1,

    w: 10,

    h: 5.5

  }

);

  const slide6 =
  pptx.addSlide();

slide6.addText(
  "Emergencias por Tipo",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide6.addImage({
  data: graficoTipoPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide7 =
  pptx.addSlide();

slide7.addText(
  "Emergencias por Faena",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide7.addImage({
  data: graficoFaenaPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide8 =
  pptx.addSlide();

slide8.addText(
  "Unidades Más Utilizadas",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide8.addImage({
  data: graficoUnidadPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide9 =
  pptx.addSlide();

slide9.addText(
  "Empresas Afectadas",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide9.addImage({
  data: graficoEmpresaPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide10 =
  pptx.addSlide();

slide10.addText(
  "Emergencias por Horario",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide10.addImage({
  data: graficoHorarioPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide11 =
  pptx.addSlide();


slide11.addText(
  "Subcategorización de Emergencias",
  {
    x: 0.5,
    y: 0.3,
    w: 6,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide11.addImage({
  data: graficoSubtipoPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide12 =
  pptx.addSlide();

slide12.addText(
  "PUE Relacionado",
  {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: "005b96"
  }
);

slide12.addImage({
  data: graficoPUEPNG,
  x: 0.5,
  y: 1,
  w: 10,
  h: 5.5
});

  const slide13 =
  pptx.addSlide();

  slide13.addText(

  "Conclusiones Operacionales",

  {

    x: 0.5,

    y: 0.3,

    w: 6,

    h: 0.4,

    fontSize: 22,

    bold: true,

    color: "005b96"

  }

);

slide13.addText(

`• Durante el período analizado se registraron ${totalEmergencias} emergencias operacionales y ${totalTraslados} traslados.

• La actividad operacional se concentró principalmente en ${faenaTop ? faenaTop[0] : "-"}.

• La empresa con mayor participación operacional fue ${empresaTop ? empresaTop[0] : "-"}.

• La categoría predominante correspondió a ${tipoTop ? tipoTop[0] : "-"}.

• El subtipo predominante correspondió a ${subtipoTop ? subtipoTop[0] : "-"}.

• El horario con mayor frecuencia de activaciones fue ${horarioTop ? horarioTop[0] : "-"}.

• El PUE predominante fue ${pueTop ? pueTop[0] : "-"}.

• La brigada con mayor participación fue ${brigadaTop ? brigadaTop[0] : "-"}.

• La ambulancia con mayor utilización fue ${ambulanciaTop ? ambulanciaTop[0] : "-"}.

• El tiempo promedio de atención registrado fue de ${promedioEmergencias} minutos.`,

{

  x: 0.8,

  y: 1.2,

  w: 10,

  h: 5,

  fontSize: 16

}

);

  const slides = [

  slide,
  slide2,
  slide3,
  slide4,
  slide5,
  slide6,
  slide7,
  slide8,
  slide9,
  slide10,
  slide11,
  slide12,
  slide13

];

slides.forEach(

  (s, index) => {

    agregarLogo(s);

    agregarPie(
      s,
      index + 1
    );

  }

);


    

  pptx.writeFile({

    fileName:
      "CONDOR_Informe_Ejecutivo.pptx"

  });

};

  }

cargarInforme();
