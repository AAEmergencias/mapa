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

<h1>
  CONDOR
</h1>

<h2>
  Informe Ejecutivo Operacional
</h2>

<p>
  Modulo nuevo funcionando
</p>

`;
