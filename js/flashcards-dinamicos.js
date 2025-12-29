document.addEventListener('DOMContentLoaded', carregarFlashcards);

async function carregarFlashcards() {
  try {
    const res = await fetch('http://localhost:3000/home/passeios');
    const passeios = await res.json();

    const container = document.getElementById('flashcards-container');
    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(passeios) || passeios.length === 0) {
      container.innerHTML = `
        <p class="text-center text-muted">
          Nenhum passeio disponível no momento.
        </p>
      `;
      return;
    }

    // ========= Agrupar por categoria =========
    const categorias = {};
    passeios.forEach(p => {
      const cat = (p.categoria || 'Outros').toLowerCase();
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(p);
    });

    // ========= Gerar blocos por categoria =========
    Object.keys(categorias).forEach((cat) => {
      const lista = categorias[cat];

      // Separa: 3 primeiros visíveis, resto vai para "extras"
      const principais = lista.slice(0, 3);
      const extras = lista.slice(3);

      const section = document.createElement('div');
      section.className = 'categoria mb-5 text-center';

      section.innerHTML = `
        <h3>${capitalizar(cat)}</h3>

        <div class="cards-row"></div>

        ${extras.length > 0 ? `<div class="cards-row extras" style="display:none;"></div>` : ''}

        ${extras.length > 0 ? `<button class="btn-vermais" type="button">Ver mais</button>` : ''}
      `;

      const rowPrincipais = section.querySelector('.cards-row');
      principais.forEach(p => rowPrincipais.appendChild(criarCard(p)));

      if (extras.length > 0) {
        const rowExtras = section.querySelector('.cards-row.extras');
        extras.forEach(p => rowExtras.appendChild(criarCard(p)));

        const btnVerMais = section.querySelector('.btn-vermais');
        btnVerMais.addEventListener('click', () => {
          const aberto = rowExtras.style.display !== 'none';
          rowExtras.style.display = aberto ? 'none' : 'flex';
          btnVerMais.textContent = aberto ? 'Ver mais' : 'Ver menos';
        });
      }

      container.appendChild(section);
    });

  } catch (err) {
    console.error('Erro ao carregar flashcards:', err);
  }
}

function criarCard(p) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = p.imagem
    ? `http://localhost:3000/uploads/${p.imagem}`
    : 'http://localhost:3000/uploads/default.jpg';

  // Monta os preços somente se existirem
  const adulto = p.valor_adulto ? `
    <li><i class="fa-solid fa-user"></i> Adultos: <strong>R$ ${formatar(p.valor_adulto)}</strong></li>
  ` : '';

  const estudante = p.valor_estudante ? `
    <li><i class="fa-solid fa-graduation-cap"></i> Estudantes: <strong>R$ ${formatar(p.valor_estudante)}</strong></li>
  ` : '';

  const crianca = p.valor_crianca ? `
    <li><i class="fa-solid fa-child"></i> Crianças: <strong>R$ ${formatar(p.valor_crianca)}</strong></li>
  ` : '';

  card.innerHTML = `
    <img src="${img}" alt="${escapeHtml(p.local || 'Passeio')}">
    <div class="card-body">
      <h5 class="card-title">${escapeHtml(p.local || 'Sem local')}</h5>
      <p class="card-text">${escapeHtml(p.descricao || '')}</p>

      <div class="card-prices">
        <ul>
          ${adulto}
          ${estudante}
          ${crianca}
        </ul>

        <div class="price-highlight">
          <div class="price-text">
            <span>Por apenas</span>
            <strong>R$ ${formatar(p.valor_final || 0)}</strong>
          </div>

          <button class="btn-comprar" type="button" data-id="${p.id}">
            Comprar
          </button>
        </div>
      </div>
    </div>
  `;

  // ✅ Clique em comprar -> vai para a tela de detalhes com o id
  card.querySelector('.btn-comprar')?.addEventListener('click', () => {
    window.location.href = `/paginas/detalhes.html?id=${p.id}`;
  });

  return card;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatar(valor) {
  return Number(valor).toFixed(2).replace('.', ',');
}

// evita quebrar HTML se vier caracteres especiais
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
