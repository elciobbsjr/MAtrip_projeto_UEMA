document.addEventListener('DOMContentLoaded', () => {
  console.log('dashboard.js carregou ✅');

  // ===== PROTEÇÃO =====
  const usuarioRaw = localStorage.getItem('usuario');
  const tipoUsuario = localStorage.getItem('tipo');

  if (!usuarioRaw || !tipoUsuario) {
    window.location.href = '/paginas/login1.html';
    return;
  }

  // ===== ELEMENTOS =====
  const adminArea = document.getElementById('admin-area');
  const userArea  = document.getElementById('user-area');
  const guiaArea  = document.getElementById('guia-area');

  const welcomeText = document.getElementById('welcomeText');
  const roleText    = document.getElementById('roleText');
  const logoutBtn   = document.getElementById('logoutBtn');

  const btnGerenciarUsuarios = document.getElementById('btnGerenciarUsuarios');
  const adminTableWrapper    = document.getElementById('adminTableWrapper');
  const tbody                = document.getElementById('admin-users');

  // Se algum elemento essencial não existe, loga e para (ajuda a diagnosticar)
  if (!adminArea || !userArea || !guiaArea || !welcomeText || !roleText || !logoutBtn) {
    console.error('Elementos do dashboard não encontrados. Verifique IDs no HTML.');
    return;
  }

  // ===== ESCONDE TUDO (REGRA) =====
  adminArea.style.display = 'none';
  userArea.style.display = 'none';
  guiaArea.style.display = 'none';

  // ===== TÍTULOS =====
  welcomeText.textContent = 'Bem-vindo ao Matrip!';
  roleText.textContent = '';

  // ===== MOSTRA SÓ UM =====
  if (tipoUsuario === 'admin') {
    roleText.textContent = 'Perfil: Administrador';
    adminArea.style.display = 'block';
  } else if (tipoUsuario === 'usuario') {
    roleText.textContent = 'Perfil: Usuário';
    userArea.style.display = 'block';
  } else if (tipoUsuario === 'guia') {
  roleText.textContent = 'Perfil: Guia Turístico';
  guiaArea.style.display = 'block';
  carregarPasseiosGuia();
}
 else {
    // tipo inválido
    localStorage.clear();
    window.location.href = '/paginas/login1.html';
    return;
  }

  // ===== LOGOUT =====
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/paginas/login1.html';
  });

  // ===== ADMIN: gerenciar usuários =====
  if (tipoUsuario === 'admin' && btnGerenciarUsuarios && adminTableWrapper && tbody) {
    btnGerenciarUsuarios.addEventListener('click', () => {
      adminTableWrapper.style.display = 'block';
      carregarUsuariosAdmin();
    });
  }

  async function carregarUsuariosAdmin() {
    try {
      const res = await fetch('http://localhost:3000/admin/usuarios');
      const usuarios = await res.json();

      tbody.innerHTML = '';

      usuarios.forEach(user => {
        const novoTipo = user.tipo === 'usuario' ? 'guia' : 'usuario';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.nome}</td>
          <td>${user.email}</td>
          <td>${user.tipo}</td>
          <td>
            <button data-id="${user.id}" data-tipo="${novoTipo}">
              Tornar ${novoTipo}
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // evento por delegação (mais seguro que onclick inline)
      tbody.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const tipo = btn.getAttribute('data-tipo');
          await alterarTipo(id, tipo);
        });
      });

    } catch (err) {
      console.error('Erro ao carregar usuários', err);
    }
  }

  async function alterarTipo(id, tipo) {
    try {
      const res = await fetch(`http://localhost:3000/admin/usuarios/${id}/tipo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      });

      const data = await res.json();
      alert(data.message || data.error || 'Erro ao atualizar');

      carregarUsuariosAdmin();
    } catch (err) {
      console.error(err);
      alert('Erro de conexão');
    }
  }
});

async function carregarPasseiosGuia() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const container = document.getElementById('listaPasseiosGuia');

  if (!container) return;

  try {
    const res = await fetch(
      `http://localhost:3000/guias/${usuario.id}/passeios`
    );
    const passeios = await res.json();

    container.innerHTML = '';

    if (passeios.length === 0) {
      container.innerHTML = '<p>Você ainda não cadastrou passeios.</p>';
      return;
    }

    passeios.forEach(p => {
      const card = document.createElement('div');
      card.classList.add('passeio-card');

      card.innerHTML = `
      <div class="passeio-imagem">
        <img src="http://localhost:3000/uploads/${p.imagem || 'default.jpg'}" alt="Passeio">
      </div>

      <div class="passeio-conteudo">
        <h4>${p.local}</h4>
        <p>${p.descricao}</p>
        <span class="preco">R$ ${Number(p.valor_final).toFixed(2)}</span>
      </div>

      <div class="passeio-acoes">
        <button class="btn-editar" data-id="${p.id}">Editar</button>
        <button class="btn-excluir" data-id="${p.id}">Excluir</button>
      </div>
    `;

      container.appendChild(card);
    });

    // eventos excluir
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;

        if (!confirm('Deseja realmente excluir este passeio?')) return;

        await excluirPasseio(id);
      });
    });

    // eventos editar (por enquanto navega)
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.location.href = `/paginas/guia/passeios/editar.html?id=${id}`;
      });
    });

  } catch (err) {
    console.error('Erro ao carregar passeios do guia', err);
  }
}

async function excluirPasseio(id) {
  try {
    const res = await fetch(`http://localhost:3000/passeios/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    alert(data.message || data.error);

    carregarPasseiosGuia(); // recarrega lista

  } catch (err) {
    console.error(err);
    alert('Erro ao excluir passeio');
  }
}
