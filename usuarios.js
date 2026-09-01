import {

db,
collection,
getDocs

}
from "./firebase.js";

const tabla =
document.getElementById(
"tablaUsuarios"
);

async function cargarUsuarios(){

tabla.innerHTML =
"Cargando...";

const snapshot =
await getDocs(
collection(
db,
"usuarios"
));

let html = "";

snapshot.forEach(docSnap => {

const u =
docSnap.data();

html += `
<div class="usuario">

<b>${u.nombre}</b><br>

📧 ${docSnap.id}<br>

👤 ${u.rol}<br>

</div>
`;

});

tabla.innerHTML =
html;

}

cargarUsuarios();
