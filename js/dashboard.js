// ===== CONTROLE GLOBAL (precisa ser global pq salvarParceiro usa) =====
let parceirosCarregados = false;

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

  const btnGerenciarUsuarios  = document.getElementById('btnGerenciarUsuarios');
  const btnCadastrarParceiro  = document.getElementById('btnCadastrarParceiro');

  const btnGerenciarParceiros = document.getElementById('btnGerenciarParceiros');
  const parceirosWrapper      = document.getElementById('parceirosWrapper');

  const adminTableWrapper = document.getElementById('adminTableWrapper');
  const tbody             = document.getElementById('admin-users');

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
  } else {
    localStorage.clear();
    window.location.href = '/paginas/login1.html';
    return;
  }

  // ===== LOGOUT =====
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/paginas/login1.html';
  });

  // ==========================
  // ADMIN: GERENCIAR USUÁRIOS (TOGGLE)
  // ==========================
  let tabelaUsuariosCarregada = false;

  if (tipoUsuario === 'admin' && btnGerenciarUsuarios && adminTableWrapper) {
    adminTableWrapper.style.display = 'none';

    btnGerenciarUsuarios.addEventListener('click', async () => {
      const estaOculta =
        adminTableWrapper.style.display === 'none' ||
        getComputedStyle(adminTableWrapper).display === 'none';

      if (estaOculta) {
        adminTableWrapper.style.display = 'block';

        if (!tabelaUsuariosCarregada) {
          await carregarUsuariosAdmin();
          tabelaUsuariosCarregada = true;
        }
      } else {
        adminTableWrapper.style.display = 'none';
      }
    });
  }

  // ==========================
  // ADMIN: GERENCIAR PARCEIROS (TOGGLE)
  // ==========================
  if (tipoUsuario === 'admin' && btnGerenciarParceiros && parceirosWrapper) {
    parceirosWrapper.style.display = 'none';

    btnGerenciarParceiros.addEventListener('click', async () => {
      const estaOculto =
        parceirosWrapper.style.display === 'none' ||
        getComputedStyle(parceirosWrapper).display === 'none';

      if (estaOculto) {
        parceirosWrapper.style.display = 'block';

        if (!parceirosCarregados) {
          await carregarParceiros();
          parceirosCarregados = true;
        }
      } else {
        parceirosWrapper.style.display = 'none';
      }
    });
  }

  // ==========================
  // ADMIN: CADASTRAR PARCEIROS (MODAL)
  // ==========================
  if (tipoUsuario === 'admin' && btnCadastrarParceiro) {
    btnCadastrarParceiro.addEventListener('click', () => {
      abrirModalParceiro();
    });
  }

  // ==========================
  // FUNÇÕES ADMIN (USUÁRIOS)
  // ==========================
  async function carregarUsuariosAdmin() {
    try {
      const res = await fetch('http://localhost:3000/admin/usuarios');
      const usuarios = await res.json();

      if (!tbody) return;
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

      // se a tabela estiver aberta, recarrega
      if (adminTableWrapper && getComputedStyle(adminTableWrapper).display !== 'none') {
        await carregarUsuariosAdmin();
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão');
    }
  }
});

// =========================
// GUIA: CARREGAR PASSEIOS
// =========================
async function carregarPasseiosGuia() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const container = document.getElementById('listaPasseiosGuia');

  if (!container) return;

  try {
    const res = await fetch(`http://localhost:3000/guias/${usuario.id}/passeios`);
    const passeios = await res.json();

    container.innerHTML = '';

    if (!Array.isArray(passeios) || passeios.length === 0) {
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

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Deseja realmente excluir este passeio?')) return;
        await excluirPasseio(id);
      });
    });

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
    const res = await fetch(`http://localhost:3000/passeios/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || data.error);
    carregarPasseiosGuia();
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir passeio');
  }
}

// =========================
// MODAL PARCEIROS
// =========================
function garantirModalParceiroCriado() {
  if (document.getElementById('modalParceiroOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'modalParceiroOverlay';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="tituloModalParceiro">
      <div class="modal-header">
        <h3 id="tituloModalParceiro">Cadastrar Parceiro</h3>
        <button class="modal-close" type="button" id="fecharModalParceiro" aria-label="Fechar">✕</button>
      </div>

      <form class="modal-form" id="formParceiro">
        <div>
          <label for="parceiroNome">Nome do parceiro</label>
          <input id="parceiroNome" name="nome" type="text" placeholder="Ex: Agência X" required />
        </div>

        <div>
          <label for="parceiroDocumento">CPF/CNPJ</label>
          <input id="parceiroDocumento" name="documento" type="text" placeholder="Somente números ou com máscara" required />
        </div>

        <div>
          <label for="parceiroLogo">Logo</label>
          <input id="parceiroLogo" name="logo" type="file" accept="image/*" />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="cancelarParceiro">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModalParceiro();
  });

  document.getElementById('fecharModalParceiro').addEventListener('click', fecharModalParceiro);
  document.getElementById('cancelarParceiro').addEventListener('click', fecharModalParceiro);
  document.getElementById('formParceiro').addEventListener('submit', salvarParceiro);
}

function abrirModalParceiro() {
  garantirModalParceiroCriado();
  const overlay = document.getElementById('modalParceiroOverlay');
  overlay.style.display = 'flex';
}

function fecharModalParceiro() {
  const overlay = document.getElementById('modalParceiroOverlay');
  if (!overlay) return;
  overlay.style.display = 'none';

  const form = document.getElementById('formParceiro');
  if (form) form.reset();
}

async function salvarParceiro(e) {
  e.preventDefault();

  const form = e.target;
  const fd = new FormData(form);

  try {
    const res = await fetch('http://localhost:3000/parceiros', {
      method: 'POST',
      body: fd
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Erro ao cadastrar parceiro');
      return;
    }

    alert(data.message || 'Parceiro cadastrado!');
    parceirosCarregados = false; // força recarregar na próxima abertura

    // se a lista estiver aberta, atualiza na hora
    const wrapper = document.getElementById('parceirosWrapper');
    const aberta = wrapper && getComputedStyle(wrapper).display !== 'none';
    if (aberta) {
      await carregarParceiros();
      parceirosCarregados = true;
    }

    fecharModalParceiro();
  } catch (err) {
    console.error(err);
    alert('Erro de conexão ao cadastrar parceiro');
  }
}

// =========================
// PARCEIROS (LISTAGEM)
// =========================
const API_BASE = "http://localhost:3000";

function logoUrl(logo) {
  if (!logo) return "/img/placeholder.jpg";
  if (logo.startsWith("http")) return logo;
  if (logo.startsWith("/uploads/")) return `${API_BASE}${logo}`;
  return `${API_BASE}/uploads/${logo}`;
}

async function carregarParceiros() {
  const lista = document.getElementById("parceirosLista");
  if (!lista) return;

  lista.innerHTML = "<p>Carregando parceiros...</p>";

  try {
    const res = await fetch(`${API_BASE}/parceiros`);
    const parceiros = await res.json();

    if (!res.ok) {
      lista.innerHTML = "<p>Erro ao carregar parceiros.</p>";
      return;
    }

    if (!Array.isArray(parceiros) || parceiros.length === 0) {
      lista.innerHTML = "<p>Nenhum parceiro cadastrado ainda.</p>";
      return;
    }

    lista.innerHTML = parceiros.map(p => `
      <div class="parceiro-card">
        <img class="parceiro-logo" src="${logoUrl(p.logo)}" alt="Logo ${p.nome}">
        <div class="parceiro-info">
          <h4>${p.nome}</h4>
          <p>${p.tipo_documento}: ${p.documento}</p>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>Erro de conexão ao carregar parceiros.</p>";
  }
}
