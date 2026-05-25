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
