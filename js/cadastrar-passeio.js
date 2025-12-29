document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();

  const form = document.getElementById('passeioForm');
  const btnNova = document.getElementById('btnNovaCategoria');
  const formNova = document.getElementById('novaCategoriaForm');
  const salvarCategoriaBtn = document.getElementById('salvarCategoria');

  // ================= NOVA CATEGORIA =================
  btnNova.addEventListener('click', () => {
    formNova.style.display =
      formNova.style.display === 'none' ? 'block' : 'none';
  });

  salvarCategoriaBtn.addEventListener('click', criarCategoria);

  // ================= SUBMIT DO PASSEIO =================
  form.addEventListener('submit', enviarPasseio);
});

// ================= CARREGAR CATEGORIAS =================
async function carregarCategorias() {
  const container = document.getElementById('categoriasContainer');
  container.innerHTML = '';

  try {
    const res = await fetch('http://localhost:3000/categorias');
    const categorias = await res.json();

    categorias.forEach(cat => {
      const label = document.createElement('label');
      label.className = 'categoria-pill';

      label.innerHTML = `
        <input type="radio" name="categoria" value="${cat.nome}" required>
        <span>${capitalizar(cat.nome)}</span>
      `;

      container.appendChild(label);
    });
  } catch (err) {
    console.error('Erro ao carregar categorias', err);
  }
}

// ================= CRIAR CATEGORIA =================
async function criarCategoria() {
  const input = document.getElementById('novaCategoriaInput');
  const nome = input.value.trim();

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

    carregarCategorias(); // atualiza radios
  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

// ================= ENVIAR PASSEIO =================
async function enviarPasseio(e) {
  e.preventDefault();

  const form = document.getElementById('passeioForm');
  const formData = new FormData(form);

  // guia logado
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || usuario.tipo !== 'guia') {
    alert('Usuário não autorizado');
    return;
  }

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

    alert('Passeio cadastrado com sucesso!');
    window.location.href = '/paginas/dashboard.html';

  } catch (err) {
    console.error(err);
    alert('Erro ao enviar passeio');
  }
}

// ================= UTIL =================
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
