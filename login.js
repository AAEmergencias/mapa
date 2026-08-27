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
