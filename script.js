async function cargarCatalogo() {
  const resp = await fetch("catalogo.json");
  return await resp.json();
}

function renderLista(canciones, data) {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  canciones.forEach(c => {
    const item = document.createElement("div");
    item.className = "item";
    item.textContent = `${c.titulo} - ${c.autor}`;
    item.onclick = () => mostrarCancion(c);
    lista.appendChild(item);
  });
}

function mostrarCancion(c) {
  const visor = document.getElementById("visor");
  visor.innerHTML = `
    <h2>${c.titulo}</h2>
    <p><b>Autor:</b> ${c.autor}</p>
    <iframe src="${c.pdf}" width="100%" height="400"></iframe><br>
    <a href="${c.youtube}" target="_blank">🎥 Ver en YouTube</a>
  `;
}

function renderEventos(eventos, data) {
  const divEventos = document.getElementById("eventos");
  divEventos.innerHTML = "";
  eventos.forEach(ev => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<b>${ev.fecha}</b> - ${ev.nombre}`;
    item.onclick = () => mostrarEvento(ev, data);
    divEventos.appendChild(item);
  });
}

function mostrarEvento(ev, data) {
  const lista = document.getElementById("lista");
  lista.innerHTML = `<h3>Canciones del evento: ${ev.nombre}</h3>`;
  ev.canciones.forEach(id => {
    const cancion = data.canciones.find(c => c.id === id);
    if (cancion) {
      const item = document.createElement("div");
      item.className = "item";
      item.textContent = `${cancion.titulo} - ${cancion.autor}`;
      item.onclick = () => mostrarCancion(cancion);
      lista.appendChild(item);
    }
  });
}

document.getElementById("busqueda").addEventListener("input", async (e) => {
  const q = e.target.value.toLowerCase();
  const data = await cargarCatalogo();
  const filtradas = data.canciones.filter(c =>
    c.titulo.toLowerCase().includes(q) ||
    c.autor.toLowerCase().includes(q)
  );
  renderLista(filtradas, data);
});

// Inicial
(async () => {
  const data = await cargarCatalogo();
  renderLista(data.canciones, data);
  renderEventos(data.eventos, data);
})();
