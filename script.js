// 🔹 Configuración GitHub
const GITHUB_USER = "usuario";     // 👈 cámbialo
const GITHUB_REPO = "micatalogo";  // 👈 cámbialo
const TOKEN       = "TU_TOKEN";    // 👈 cámbialo
const FILE_CANCIONES = "catalogo.json";
const FILE_EVENTOS  = "eventos.json";

// Utilidad: GET archivo JSON desde GitHub
async function getFile(path) {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, { headers: { Authorization: `token ${TOKEN}` } });
  const data = await res.json();
  const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
  return { content, sha: data.sha };
}

// Utilidad: PUT archivo JSON a GitHub
async function saveFile(path, newData, sha) {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Actualización de ${path} desde la app web`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2)))),
      sha: sha
    })
  }).then(r => r.json());
}

// 🔹 Navegación de vistas
function mostrarVista(vista) {
  document.getElementById("visor").classList.add("hidden");
  document.getElementById("vistaCanciones").classList.add("hidden");
  document.getElementById("vistaEventos").classList.add("hidden");

  if (vista === "visor") document.getElementById("visor").classList.remove("hidden");
  if (vista === "canciones") renderCanciones();
  if (vista === "eventos") renderEventos();
}

// 🔹 Canciones
async function renderCanciones() {
  const { content: canciones, sha } = await getFile(FILE_CANCIONES);
  const cont = document.getElementById("vistaCanciones");
  cont.classList.remove("hidden");

  cont.innerHTML = `
    <h2 class="text-xl font-bold mb-4">🎶 Mantenimiento de Canciones</h2>
    <form id="formCancion" class="mb-4 space-y-2">
      <input name="titulo" placeholder="Título" class="border p-2 w-full rounded" required>
      <input name="autor" placeholder="Autor" class="border p-2 w-full rounded">
      <input name="pdf" placeholder="URL PDF" class="border p-2 w-full rounded">
      <input name="youtube" placeholder="URL YouTube" class="border p-2 w-full rounded">
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">➕ Agregar</button>
    </form>
    <ul class="space-y-2">
      ${canciones.map((c, i) => `
        <li class="p-2 border rounded flex justify-between items-center">
          <span><b>${c.titulo}</b> - ${c.autor}</span>
          <div>
            <button onclick="mostrarCancion(${i})" class="bg-gray-400 text-white px-2 py-1 rounded mr-2">👁 Ver</button>
            <button onclick="eliminarCancion(${i}, '${sha}')" class="bg-red-500 text-white px-2 py-1 rounded">🗑 Eliminar</button>
          </div>
        </li>
      `).join("")}
    </ul>
  `;

  document.getElementById("formCancion").onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    canciones.push(data);
    await saveFile(FILE_CANCIONES, canciones, sha);
    renderCanciones();
  };
}

async function eliminarCancion(i, sha) {
  const { content: canciones } = await getFile(FILE_CANCIONES);
  canciones.splice(i, 1);
  await saveFile(FILE_CANCIONES, canciones, sha);
  renderCanciones();
}

async function mostrarCancion(i) {
  const { content: canciones } = await getFile(FILE_CANCIONES);
  const c = canciones[i];
  const visor = document.getElementById("visor");
  mostrarVista("visor");
  visor.innerHTML = `
    <h3 class="text-lg font-bold mb-2">${c.titulo}</h3>
    <p class="text-sm mb-4"><b>Autor:</b> ${c.autor}</p>
    <div class="relative">
      <iframe id="docFrame" src="${c.pdf}" class="w-full h-64 rounded-lg border"></iframe>
      <button onclick="pantallaCompleta()" class="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 text-xs rounded-lg shadow">⛶ Pantalla completa</button>
    </div>
    <a href="${c.youtube}" target="_blank" class="mt-3 inline-block bg-red-500 text-white px-4 py-2 rounded-lg shadow">🎥 Ver en YouTube</a>
  `;
}

// 🔹 Eventos
async function renderEventos() {
  const { content: eventos, sha: shaEventos } = await getFile(FILE_EVENTOS);
  const { content: canciones } = await getFile(FILE_CANCIONES);
  const cont = document.getElementById("vistaEventos");
  cont.classList.remove("hidden");

  cont.innerHTML = `
    <h2 class="text-xl font-bold mb-4">📅 Mantenimiento de Eventos</h2>
    <form id="formEvento" class="mb-4 space-y-2">
      <input name="nombre" placeholder="Nombre del evento" class="border p-2 w-full rounded" required>
      <select name="canciones" multiple class="border p-2 w-full rounded h-32">
        ${canciones.map(c => `<option value="${c.titulo}">${c.titulo}</option>`).join("")}
      </select>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">➕ Crear Evento</button>
    </form>
    <ul class="space-y-2">
      ${eventos.map((ev, i) => `
        <li class="p-2 border rounded">
          <b>${ev.nombre}</b>
          <ul class="ml-4 list-disc">${ev.canciones.map(c => `<li>${c}</li>`).join("")}</ul>
          <button onclick="eliminarEvento(${i}, '${shaEventos}')" class="mt-2 bg-red-500 text-white px-2 py-1 rounded">🗑 Eliminar</button>
        </li>
      `).join("")}
    </ul>
  `;

  document.getElementById("formEvento").onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    eventos.push({
      nombre: data.nombre,
      canciones: Array.from(e.target.canciones.selectedOptions).map(o => o.value)
    });
    await saveFile(FILE_EVENTOS, eventos, shaEventos);
    renderEventos();
  };
}

async function eliminarEvento(i, sha) {
  const { content: eventos } = await getFile(FILE_EVENTOS);
  eventos.splice(i, 1);
  await saveFile(FILE_EVENTOS, eventos, sha);
  renderEventos();
}

// 🔹 Fullscreen
function pantallaCompleta() {
  const iframe = document.getElementById("docFrame");
  if (iframe.requestFullscreen) iframe.requestFullscreen();
  else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
  else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
}
