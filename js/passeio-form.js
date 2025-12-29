document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Debug pra você ver no console se está pegando o id
  console.log('[passeio-form] URL:', window.location.href);

  const passeioId = new URLSearchParams(window.location.search).get('id');
  console.log('[passeio-form] ID:', passeioId);

  // UI nova categoria
  const btnNova = document.getElementById('btnNovaCategoria');
  const formNova = document.getElementById('novaCategoriaForm');
  const salvarCategoriaBtn = document.getElementById('salvarCategoria');

  btnNova?.addEventListener('click', () => {
    formNova.style.display = (formNova.style.display === 'none' || !formNova.style.display) ? 'block' : 'none';
  });

  salvarCategoriaBtn?.addEventListener('click', criarCategoria);

  // Se tem ID, carrega passeio e preenche. Se não, só carrega categorias.
  if (passeioId) {
    await carregarPasseio(passeioId); // isso também carrega categorias marcando a correta
    setModoEdicao();
  } else {
    await carregarCategorias(); // modo cadastro
    setModoCadastro();
  }

  // Submit
  document.getElementById('passeioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (passeioId) {
      await atualizarPasseio(passeioId);
    } else {
      await criarPasseio();
    }
  });
}

function setModoEdicao() {
  const titulo = document.getElementById('tituloForm');
  const subtitulo = document.getElementById('subtituloForm');
  const btn = document.getElementById('btnSubmit');

  if (titulo) titulo.textContent = 'Editar Passeio';
  if (subtitulo) subtitulo.textContent = 'Atualize as informações do passeio turístico.';
  if (btn) btn.textContent = 'Atualizar Passeio';
}

function setModoCadastro() {
  const titulo = document.getElementById('tituloForm');
  const subtitulo = document.getElementById('subtituloForm');
  const btn = document.getElementById('btnSubmit');

  if (titulo) titulo.textContent = 'Cadastrar Novo Passeio';
  if (subtitulo) subtitulo.textContent = 'Preencha as informações básicas do passeio turístico.';
  if (btn) btn.textContent = 'Salvar Passeio';
}

// ================= CATEGORIAS =================
async function carregarCategorias(categoriaSelecionada) {
  const container = document.getElementById('categoriasContainer');
  if (!container) return;

  container.innerHTML = '';

  const res = await fetch('http://localhost:3000/categorias');
  const categorias = await res.json();

  categorias.forEach(cat => {
    const label = document.createElement('label');
    label.className = 'categoria-pill';

    const checked = (categoriaSelecionada && cat.nome === categoriaSelecionada) ? 'checked' : '';

    label.innerHTML = `
      <input type="radio" name="categoria" value="${cat.nome}" ${checked} required>
      <span>${capitalizar(cat.nome)}</span>
    `;
    container.appendChild(label);
  });
}

async function criarCategoria() {
  const input = document.getElementById('novaCategoriaInput');
  const nome = (input?.value || '').trim();

  if (!nome) {
    alert('Informe o nome da categoria');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Erro ao criar categoria');
      return;
    }

    alert('Categoria criada com sucesso!');
    input.value = '';
    document.getElementById('novaCategoriaForm').style.display = 'none';

    // recarrega categorias e deixa a nova marcada
    await carregarCategorias(nome.toLowerCase());
  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

// ================= PASSEIO (GET) =================
async function carregarPasseio(id) {
  try {
    const res = await fetch(`http://localhost:3000/passeios/${id}`);
    const passeio = await res.json();

    if (!res.ok) {
      alert(passeio.error || 'Erro ao carregar passeio');
      return;
    }

    // Preenche campos
    document.querySelector('[name="local"]').value = passeio.local || '';
    document.querySelector('[name="descricao"]').value = passeio.descricao || '';
    document.querySelector('[name="valor_adulto"]').value = passeio.valor_adulto ?? '';
    document.querySelector('[name="valor_estudante"]').value = passeio.valor_estudante ?? '';
    document.querySelector('[name="valor_crianca"]').value = passeio.valor_crianca ?? '';
    document.querySelector('[name="valor_final"]').value = passeio.valor_final ?? '';

    // Carrega categorias e marca a do passeio
    await carregarCategorias(passeio.categoria);

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar passeio');
  }
}

// ================= PASSEIO (POST) =================
async function criarPasseio() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || usuario.tipo !== 'guia') {
    alert('Apenas guias podem cadastrar passeios.');
    return;
  }

  const form = document.getElementById('passeioForm');
  const formData = new FormData(form);
  formData.append('guia_id', usuario.id);

  try {
    const res = await fetch('http://localhost:3000/passeios', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Erro ao cadastrar passeio');
      return;
    }

    alert(data.message || 'Passeio cadastrado!');
    window.location.href = '/paginas/dashboard.html';
  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

// ================= PASSEIO (PUT) =================
async function atualizarPasseio(id) {
  const form = document.getElementById('passeioForm');
  const formData = new FormData(form);

  try {
    const res = await fetch(`http://localhost:3000/passeios/${id}`, {
      method: 'PUT',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Erro ao atualizar passeio');
      return;
    }

    alert(data.message || 'Passeio atualizado!');
    window.location.href = '/paginas/dashboard.html';
  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

// ================= UTIL =================
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
