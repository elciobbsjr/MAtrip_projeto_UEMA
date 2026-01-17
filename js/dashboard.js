// ===== CONTROLE GLOBAL (precisa ser global pq salvarParceiro usa) =====
let parceirosCarregados = false;

// ===== FUNÇÃO GLOBAL =====
async function carregarGuiasAdmin() {
  try {
    const res = await fetch('http://localhost:3000/admin/guias');
    const guias = await res.json();

    const tbodyGuias = document.getElementById('admin-guias');
    if (!tbodyGuias) return;

    tbodyGuias.innerHTML = '';

    if (!Array.isArray(guias) || guias.length === 0) {
      tbodyGuias.innerHTML = `
        <tr><td colspan="5">Nenhum guia cadastrado</td></tr>
      `;
      return;
    }

    guias.forEach(g => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.nome}</td>
        <td>${g.email}</td>
        <td>${g.mei}</td>
        <td>${g.celular}</td>
        <td>
          <button class="btn-excluir" data-id="${g.id}">Excluir</button>
        </td>
      `;
      tbodyGuias.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao carregar guias', err);
  }
}


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

  const btnGerenciarGuias = document.getElementById('btnGerenciarGuias');
  const guiasWrapper = document.getElementById('guiasWrapper');
  const tbodyGuias = document.getElementById('admin-guias');


  // Se algum elemento essencial não existe, loga e para (ajuda a diagnosticar)
  if (!adminArea || !userArea || !guiaArea || !welcomeText || !roleText || !logoutBtn) {
    console.error('Elementos do dashboard não encontrados. Verifique IDs no HTML.');
    return;
  }

  function fecharPaineisAdmin() {
  if (adminTableWrapper) adminTableWrapper.style.display = 'none';
  if (guiasWrapper) guiasWrapper.style.display = 'none';
  if (parceirosWrapper) parceirosWrapper.style.display = 'none';
  }


  // ===== ESCONDE TUDO (REGRA) =====
  adminArea.style.display = 'none';
  userArea.style.display = 'none';
  guiaArea.style.display = 'none';

  // ===== TÍTULOS =====
  welcomeText.textContent = 'Bem-vindo a Matrip!';
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
  fecharPaineisAdmin();
  adminTableWrapper.style.display = 'block';

  if (!tabelaUsuariosCarregada) {
    await carregarUsuariosAdmin();
    tabelaUsuariosCarregada = true;
  }
  });
}
  // ==========================
// ADMIN: GERENCIAR GUIAS (TOGGLE)
// ==========================
let guiasCarregados = false;

if (tipoUsuario === 'admin' && btnGerenciarGuias && guiasWrapper) {
  guiasWrapper.style.display = 'none';

  btnGerenciarGuias.addEventListener('click', async () => {
  fecharPaineisAdmin();
  guiasWrapper.style.display = 'block';

  if (!guiasCarregados) {
    await carregarGuiasAdmin();
    guiasCarregados = true;
  }
  });
}


  // ==========================
  // ADMIN: GERENCIAR PARCEIROS (TOGGLE)
  // ==========================
  if (tipoUsuario === 'admin' && btnGerenciarParceiros && parceirosWrapper) {
    parceirosWrapper.style.display = 'none';

    btnGerenciarParceiros.addEventListener('click', async () => {
    fecharPaineisAdmin();
    parceirosWrapper.style.display = 'block';

    if (!parceirosCarregados) {
      await carregarParceiros();
      parceirosCarregados = true;
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
        btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalGuia(id);
      });

      });

    } catch (err) {
      console.error('Erro ao carregar usuários', err);
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
    <div class="modal-box" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Cadastrar Agência</h3>
        <button class="modal-close" type="button" id="fecharModalParceiro">✕</button>
      </div>

      <form class="modal-form" id="formParceiro">

        <div>
          <label>Nome Fantasia</label>
          <input type="text" name="nome_fantasia" required placeholder="Ex: Matrip Turismo">
        </div>

        <div>
          <label>Razão Social</label>
          <input type="text" name="razao_social" required placeholder="Matrip Turismo LTDA">
        </div>

        <div>
          <label>CNPJ</label>
          <input type="text" name="cnpj" required placeholder="00.000.000/0001-00">
        </div>

        <div>
          <label>Homepage</label>
          <input type="url" name="homepage" placeholder="https://www.matrip.com.br">
        </div>

        <div>
          <label>E-mail</label>
          <input type="email" name="email" required placeholder="contato@agencia.com">
        </div>

        <div>
          <label>Endereço</label>
          <input type="text" name="endereco" required placeholder="Rua, número">
        </div>

        <div>
          <label>Bairro</label>
          <input type="text" name="bairro" required placeholder="Centro">
        </div>

        <div>
          <label>Status</label>
          <select name="status" required>
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
          </select>
        </div>

        <div>
          <label>Telefone</label>
          <input type="tel" name="telefone" placeholder="(99) 9999-9999">
        </div>

        <div>
          <label>Celular</label>
          <input type="tel" name="celular" required placeholder="(99) 99999-9999">
        </div>
        
        <div>
          <label>Logo da Agência</label>
          <input type="file" name="logo" accept="image/*" id="logoInput">
          <img id="previewLogo" style="max-width:120px; display:none; margin-top:8px;">
        </div>



        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="cancelarParceiro">Cancelar</button>
          <button type="submit" class="btn-primary">Cadastrar Agência</button>
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
    const res = await fetch('http://localhost:3000/agencias', {
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

  lista.innerHTML = "<p>Carregando agências...</p>";

  try {
    const res = await fetch(`${API_BASE}/agencias`);
    const agencias = await res.json();

    if (!res.ok) {
      lista.innerHTML = "<p>Erro ao carregar agências.</p>";
      return;
    }

    if (!Array.isArray(agencias) || agencias.length === 0) {
      lista.innerHTML = "<p>Nenhuma agência cadastrada ainda.</p>";
      return;
    }

    lista.innerHTML = agencias.map(a => `
      <div class="parceiro-card">
        <img class="parceiro-logo" src="${logoUrl(a.logo)}">
        <div class="parceiro-info">
          <h4>${a.nome_fantasia}</h4>
          <p>CNPJ: ${a.cnpj}</p>
          <p>Status: ${a.status}</p>
          <p>Email: ${a.email}</p>
        </div>
        <div class="parceiro-acoes">
          <button class="btn-excluir" data-id="${a.id}">Excluir</button>
        </div>
      </div>
    `).join("");

    // 🔗 listeners
    document.querySelectorAll('.parceiro-card .btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => {
        excluirAgencia(btn.dataset.id);
      });
    });

  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>Erro de conexão ao carregar agências.</p>";
  }
}


async function excluirAgencia(id) {
  if (!confirm('Deseja realmente excluir esta agência?')) return;

  try {
    const res = await fetch(`${API_BASE}/agencias/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Erro ao excluir agência');
      return;
    }

    alert(data.message || 'Agência excluída com sucesso');

    parceirosCarregados = false;
    await carregarParceiros();
    parceirosCarregados = true;

  } catch (err) {
    console.error(err);
    alert('Erro de conexão ao excluir agência');
  }
}



// =========================
// MODAL CADASTRO GUIA
// =========================
let usuarioParaVirarGuia = null;

function garantirModalGuiaCriado() {
  if (document.getElementById('modalGuiaOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'modalGuiaOverlay';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>Cadastro de Guia</h3>
        <button class="modal-close" onclick="fecharModalGuia()">✕</button>
      </div>

      <form id="formGuia" class="modal-form">
        <div>
          <label>MEI</label>
          <input type="text" name="mei" required placeholder="CNPJ do MEI">
        </div>

        <div>
          <label>Celular</label>
          <input type="tel" name="celular" required placeholder="(99) 99999-9999">
        </div>

        <div>
          <label>Email</label>
          <input type="email" name="email" required placeholder="email@exemplo.com">
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="fecharModalGuia()">Cancelar</button>
          <button type="submit" class="btn-primary">Enviar</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('formGuia').addEventListener('submit', enviarCadastroGuia);
}

function abrirModalGuia(userId) {
  usuarioParaVirarGuia = userId;
  garantirModalGuiaCriado();
  document.getElementById('modalGuiaOverlay').style.display = 'flex';
}

function fecharModalGuia() {
  const overlay = document.getElementById('modalGuiaOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function enviarCadastroGuia(e) {
  e.preventDefault();

  const form = e.target;
  const dados = {
    mei: form.mei.value,
    celular: form.celular.value,
    email: form.email.value
  };

  try {
    // 1️⃣ salvar dados do guia
    const res = await fetch(`http://localhost:3000/guias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioParaVirarGuia,
        ...dados
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Erro ao cadastrar guia');
      return;
    }

    // 2️⃣ agora sim muda o tipo
    await alterarTipo(usuarioParaVirarGuia, 'guia');

    fecharModalGuia();

  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}



async function excluirGuia(id) {
  try {
    const res = await fetch(`http://localhost:3000/admin/guias/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    alert(data.message || data.error);

    guiasCarregados = false;
    await carregarGuiasAdmin();
    guiasCarregados = true;

  } catch (err) {
    console.error(err);
    alert('Erro ao excluir guia');
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

    if (!res.ok) {
      alert(data.error || 'Erro ao atualizar');
      return;
    }

    alert(data.message || 'Tipo atualizado');

    // 🔥 SE FOR O USUÁRIO LOGADO, atualiza localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.id == id) {
      localStorage.setItem('tipo', tipo);
      usuario.tipo = tipo;
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // recarrega dashboard
      window.location.reload();
    }

  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

document.addEventListener('change', (e) => {
  if (e.target.id === 'logoInput') {
    const file = e.target.files[0];
    const preview = document.getElementById('previewLogo');

    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    }
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Apenas imagens são permitidas'));
    } else {
      cb(null, true);
    }
  }
});

