// Ajuste se sua API estiver em outro host/porta.
// Se front e API estiverem no mesmo servidor, pode deixar "" e usar rotas relativas.
const API_BASE = "http://localhost:3000";

function criarIndicador(idx, isActive) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("data-bs-target", "#carouselExampleCaptions");
  btn.setAttribute("data-bs-slide-to", String(idx));
  btn.setAttribute("aria-label", `Slide ${idx + 1}`);

  if (isActive) {
    btn.classList.add("active");
    btn.setAttribute("aria-current", "true");
  }
  return btn;
}

function criarSlide(passeio, isActive) {
  const item = document.createElement("div");
  item.className = `carousel-item${isActive ? " active" : ""}`;

  const img = document.createElement("img");
  img.className = "d-block w-100";

  const titulo = `${passeio.local} – ${passeio.cidade}/${passeio.estado}`;
  img.alt = titulo;

  // sua API retorna "imagem" como filename (ex.: 1700000-foto.jpg)
  img.src = passeio.imagem
    ? `${API_BASE}/uploads/${passeio.imagem}`
    : "/img/placeholder.jpg";

  const caption = document.createElement("div");
  caption.className = "carousel-caption d-none d-md-block";

  const h5 = document.createElement("h5");
  h5.textContent = titulo;

  const p = document.createElement("p");
  p.textContent = passeio.descricao || "";

  caption.appendChild(h5);
  caption.appendChild(p);

  item.appendChild(img);
  item.appendChild(caption);

  return item;
}

// Chame isso depois que o carrossel.html já foi injetado no DOM
async function initCarrosselDinamico() {
  const indicatorsEl = document.getElementById("carouselIndicators");
  const innerEl = document.getElementById("carouselInner");

  if (!indicatorsEl || !innerEl) return; // carrossel não está na página

  indicatorsEl.innerHTML = "";
  innerEl.innerHTML = "";

  try {
    // Recomendo essa rota pro index (já traz 1 imagem por passeio)
    const resp = await fetch(`${API_BASE}/home/passeios`);
    if (!resp.ok) throw new Error("Falha ao buscar passeios");

    const passeios = await resp.json();

    // Se quiser limitar (ex.: 4 como era antes)
    const slides = passeios.slice(0, 4);

    if (slides.length === 0) {
      innerEl.innerHTML = `
        <div class="carousel-item active">
          <img src="/img/placeholder.jpg" class="d-block w-100" alt="Sem passeios">
          <div class="carousel-caption d-none d-md-block">
            <h5>Nenhum passeio cadastrado</h5>
            <p>Cadastre um passeio para aparecer aqui.</p>
          </div>
        </div>
      `;
      return;
    }

    slides.forEach((p, idx) => {
      indicatorsEl.appendChild(criarIndicador(idx, idx === 0));
      innerEl.appendChild(criarSlide(p, idx === 0));
    });
  } catch (e) {
    console.error(e);
    innerEl.innerHTML = `
      <div class="carousel-item active">
        <img src="/img/placeholder.jpg" class="d-block w-100" alt="Erro">
        <div class="carousel-caption d-none d-md-block">
          <h5>Erro ao carregar passeios</h5>
          <p>Confira se a API está rodando e a rota /home/passeios está OK.</p>
        </div>
      </div>
    `;
  }
}



function renderizarFlashcards(passeios) {
  const container = document.getElementById('flashcards-container');
  container.innerHTML = '';

  if (passeios.length === 0) {
    container.innerHTML = `
      <p class="text-center text-muted">
        Nenhum passeio encontrado para essa região.
      </p>`;
    return;
  }

  passeios.forEach(p => {
    container.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <img 
            src="${p.imagem ? `${API_BASE}/uploads/${p.imagem}` : '/img/padrao.jpg'}"
            class="card-img-top">

          <div class="card-body">
            <h5 class="card-title">${p.local}</h5>
            <p class="card-text">${p.descricao}</p>
            <p class="fw-bold text-primary">
              R$ ${Number(p.valor_final).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    `;
  });

}


// expõe para o main.js chamar depois de injetar o HTML
window.initCarrosselDinamico = initCarrosselDinamico;
