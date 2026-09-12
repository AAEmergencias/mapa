import {

  auth,

  db,

  signInWithEmailAndPassword,

  doc,

  getDocs,

  collection

}

from "./firebase.js";

const btnLogin =
  document.getElementById(
    "btnLogin"
  );

btnLogin.onclick =
async () => {

  const correo =
    document.getElementById(
      "correo"
    ).value.trim();

  const password =
    document.getElementById(
      "password"
    ).value;

  const mensaje =
    document.getElementById(
      "mensaje"
    );

  try {

    await signInWithEmailAndPassword(
  auth,
  correo,
  password
);

const usuarioDoc =
  await getDoc(
    doc(
      db,
      "usuarios",
      correo
    )
  );

if (!usuarioDoc.exists()) {

  await signOut(auth);

  mensaje.innerHTML =
    "❌ Usuario no registrado";

  return;

}

const datos =
  usuarioDoc.data();

if (!datos.activo) {

  await signOut(auth);

  mensaje.innerHTML =
    "⛔ Usuario deshabilitado";

  return;

}

localStorage.setItem(
  "usuarioCorreo",
  correo
);

window.location.href =
  "index.html";

  }

  catch(error) {

    mensaje.innerHTML =
      "❌ Usuario o contraseña incorrecta";

    console.error(error);

  }

};
