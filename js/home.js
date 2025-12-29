document.addEventListener('DOMContentLoaded', carregarHome);

async function carregarHome() {
  try {
    const res = await fetch('http://localhost:3000/home/passeios');
    const passeios = await res.json();

    const container = document.getElementById('homeCategorias');
    container.innerHTML = '';

    // AGRUPAR POR CATEGORIA
    const categorias = {};

    passeios.forEach(p => {
      if (!categorias[p.categoria]) {
        categorias[p.categoria] = [];
      }
      categorias[p.categoria].push(p);
    });

    // CRIAR HTML PARA CADA CATEGORIA
    for (const categoria in categorias) {
      const section = document.createElement('section');
      section.className = 'categoria mb-5 text-center';

      section.innerHTML = `
        <h3>${capitalizar(categoria)}</h3>
        <div class="cards-row"></div>
        <button class="btn-vermais">Ver mais</button>
      `;

      const row = section.querySelector('.cards-row');

      categorias[categoria].forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <img src="http://localhost:3000/uploads/${p.imagem || 'default.jpg'}" alt="${p.local}">
          <div class="card-body">
            <h5 class="card-title">${p.local}</h5>
            <p class="card-text">${p.descricao}</p>

            <div class="card-prices">
              <ul>
                ${p.valor_adulto ? `<li><i class="fa-solid fa-user"></i> Adultos: <strong>R$ ${formatar(p.valor_adulto)}</strong></li>` : ''}
                ${p.valor_estudante ? `<li><i class="fa-solid fa-graduation-cap"></i> Estudantes: <strong>R$ ${formatar(p.valor_estudante)}</strong></li>` : ''}
                ${p.valor_crianca ? `<li><i class="fa-solid fa-child"></i> Crianças: <strong>R$ ${formatar(p.valor_crianca)}</strong></li>` : ''}
              </ul>

              <div class="price-highlight">
                <div class="price-text">
                  <span>Por apenas</span>
                  <strong>R$ ${formatar(p.valor_final)}</strong>
                </div>
                <button class="btn-comprar">Comprar</button>
              </div>
            </div>
          </div>
        `;

        row.appendChild(card);
      });

      container.appendChild(section);
    }

  } catch (err) {
    console.error('Erro ao carregar home:', err);
  }
}

/* ===== HELPERS ===== */
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatar(valor) {
  return Number(valor).toFixed(2).replace('.', ',');
}
