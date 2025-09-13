async function cargarCatalogo() {
  const resp = await fetch("catalogo.json");
  return await resp.json();
}

function renderLista(canciones, data) {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  canciones.forEach(c => {
    const item = document.createElement("div");
    item.className = "p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition";
    item.textContent = `${c.titulo} - ${c.autor}`;
    item.onclick = () => mostrarCancion(c);
    lista.appendChild(item);
  });
}

function mostrarCancion(c) {
  const visor = document.getElementById("visor");
  visor.innerHTML = `
    <h3 class="text-lg font-bold mb-2">${c.titulo}</h3>
    <p class="text-sm mb-4"><b>Autor:</b> ${c.autor}</p>
    <iframe src="${c.pdf}" class="w-full h-64 rounded-lg border" ></iframe>
    <a href="${c.youtube}" target="_blank" 
       class="mt-3 inline-block bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600">
       🎥 Ver en YouTube
    </a>
  `;
}

function renderEventos(eventos, data) {
  const divEventos = document.getElementById("eventos");
  divEventos.innerHTML = "";
  eventos.forEach(ev => {
    const item = document.createElement("div");
    item.className = "p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition";
    item.innerHTML = `<b>${ev.fecha}</b> - ${ev.nombre}`;
    item.onclick = () => mostrarEvento(ev, data);
    divEventos.appendChild(item);
  });
}

function mostrarEvento(ev, data) {
  const lista = document.getElementById("lista");
  lista.innerHTML = `<h3 class="font-semibold text-indigo-700 mb-2">🎤 Canciones del evento: ${ev.nombre}</h3>`;
  ev.canciones.forEach(id => {
    const cancion = data.canciones.find(c => c.id === id);
    if (cancion) {
      const item = document.createElement("div");
      item.className = "p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition";
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
