const emergencia = {

    id: "EM-001",

    tipo: "Vehicular",

    subtipo: "Colisión vehículos livianos",

    notas: "2 ocupantes involucrados",

    latitud: -33.12345,

    longitud: -70.12345
};

document.getElementById("tipo").textContent =
    emergencia.tipo;

document.getElementById("subtipo").textContent =
    emergencia.subtipo;

document.getElementById("notas").textContent =
    emergencia.notas;

document
.getElementById("btnRecibido")
.addEventListener("click", () => {

    alert("Despacho recibido");
});

document
.getElementById("btnRechazar")
.addEventListener("click", () => {

    alert("Despacho rechazado");
});

document
.getElementById("btnNavegar")
.addEventListener("click", () => {

    window.open(
        `https://www.google.com/maps?q=${emergencia.latitud},${emergencia.longitud}`
    );
});

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register(
        "./sw.js"
    );
}