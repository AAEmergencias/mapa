let emergencia = JSON.parse(localStorage.getItem("emergenciaSeleccionada"));

if (emergencia) {

  // ✅ Tipo
  document.getElementById("tipo").value = emergencia.tipo || "";

  // ✅ Subtipo
  document.getElementById("subtipo").value = emergencia.subtipo || "";

  // ✅ Fecha formateada
  if (emergencia.fecha) {
    document.getElementById("fecha").value = convertirFecha(emergencia.fecha);
  }

}

function convertirFecha(fecha) {

  let partes = fecha.includes("/")
    ? fecha.split("/")
    : fecha.split("-");

  if (partes.length !== 3) return "";

  // formato HTML → yyyy-mm-dd
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

document.getElementById("lugar").value = emergencia.ubicacion || "";

document.getElementById("vehiculo").value = emergencia.unidades?.join(", ") || "";

document.getElementById("formParte").onsubmit = (e) => {
  e.preventDefault();

  let parte = {
    fecha: document.getElementById("fecha").value,
    horaActivacion: document.getElementById("horaActivacion").value,
    horaCierre: document.getElementById("horaCierre").value,
    tipo: document.getElementById("tipo").value,
    subtipo: document.getElementById("subtipo").value,
    descripcion: document.getElementById("descripcion").value,
    lugar: document.getElementById("lugar").value,
    comuna: document.getElementById("comuna").value,
    faena: document.getElementById("faena").value,
    empresa: document.getElementById("empresa").value,
    impacto: document.getElementById("impacto").value,
    brigada: document.getElementById("brigada").value,
    vehiculo: document.getElementById("vehiculo").value,
    ambulancia: document.getElementById("ambulancia").value,
    tipoAtencion: document.getElementById("tipoAtencion").value,
    pacientes: document.getElementById("pacientes").value,
    pue: document.getElementById("pue").value,
    descripcionPue: document.getElementById("descPue").value,
    anexo3: document.getElementById("anexo3").value,
    operador: document.getElementById("operador").value
  };

  // ✅ Guardar en localStorage
  let partes = JSON.parse(localStorage.getItem("partesEmergencia")) || [];

  partes.push(parte);

  localStorage.setItem("partesEmergencia", JSON.stringify(partes));

  alert("✅ Parte guardado");

  document.getElementById("formParte").reset();
};
