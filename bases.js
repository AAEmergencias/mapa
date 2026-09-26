import {

  auth,
  db,

  onAuthStateChanged,

  collection,
  getDocs

}
from "./firebase.js";

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    cargarBases();

  }
);

async function cargarBases() {

  console.log(
    "🏠 Cargando bases..."
  );

}
