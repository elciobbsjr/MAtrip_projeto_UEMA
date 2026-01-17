document.addEventListener('DOMContentLoaded', init);

const API_URL = 'http://localhost:3000';

async function init() {
  const passeioId = new URLSearchParams(window.location.search).get('id');

  // UI nova categoria
  const btnNova = document.getElementById('btnNovaCategoria');
  const formNova = document.getElementById('novaCategoriaForm');
  const salvarCategoriaBtn = document.getElementById('salvarCategoria');

  btnNova?.addEventListener('click', () => {
    formNova.style.display = (formNova.style.display === 'none' || !formNova.style.display) ? 'block' : 'none';
  });
  salvarCategoriaBtn?.addEventListener('click', criarCategoria);

  // Estado (arrays) -> hidden inputs
  const state = {
    paradas: [],
    inclui: [],
    embarques: [],
    horarios: []
  };

  // Listeners das listas
  document.getElementById('btnAddParada')?.addEventListener('click', () => addParada(state));
  document.getElementById('btnAddInclui')?.addEventListener('click', () => addInclui(state));
  document.getElementById('btnAddEmbarque')?.addEventListener('click', () => addEmbarque(state));
  document.getElementById('btnAddHorario')?.addEventListener('click', () => addHorario(state));

  // Atualiza roteiro quando altera inputs base
  ['roteiroSaidaLocal','roteiroSaidaHora','roteiroRetornoLocal','roteiroRetornoHora'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', () => syncRoteiroHidden(state));
  });

  // Preview de imagens (novas)
  setupPreviewImagens();

  // Modo cadastro/edição
  if (passeioId) {
    await carregarPasseio(passeioId, state);
    setModoEdicao();
  } else {
    await carregarCategorias();
    setModoCadastro();
    document.getElementById('imagensExistentes').style.display = 'none';
  }

  // Submit
  document.getElementById('passeioForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // sincroniza hidden inputs antes de enviar
    syncRoteiroHidden(state);
    syncIncluiHidden(state);
    syncEmbarqueHidden(state);
    syncHorariosHidden(state);

    if (passeioId) {
      await atualizarPasseio(passeioId);
    } else {
      await criarPasseio();
    }
  });
}

// ================= MODO UI =================
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

  const res = await fetch(`${API_URL}/categorias`);
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
    const res = await fetch(`${API_URL}/categorias`, {
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

    await carregarCategorias(nome.toLowerCase());
  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

// ================= CARREGAR PASSEIO (GET) =================
async function carregarPasseio(id, state) {
  try {
    const res = await fetch(`${API_URL}/passeios/${id}`);
    const passeio = await res.json();

    if (!res.ok) {
      alert(passeio.error || 'Erro ao carregar passeio');
      return;
    }

    // Campos básicos
    document.querySelector('[name="local"]').value = passeio.local || '';
    document.querySelector('[name="cidade"]').value = passeio.cidade || '';
    document.querySelector('[name="estado"]').value = passeio.estado || '';
    document.querySelector('[name="descricao"]').value = passeio.descricao || '';
    document.querySelector('[name="valor_adulto"]').value = passeio.valor_adulto ?? '';
    document.querySelector('[name="valor_estudante"]').value = passeio.valor_estudante ?? '';
    document.querySelector('[name="valor_crianca"]').value = passeio.valor_crianca ?? '';
    document.querySelector('[name="valor_final"]').value = passeio.valor_final ?? '';

    // Novos campos simples
    if (passeio.data_passeio) {
      // se vier como ISO "2025-12-28T..." pega só a data
      const d = String(passeio.data_passeio).slice(0, 10);
      document.querySelector('[name="data_passeio"]').value = d;
    }

    document.querySelector('[name="frequencia"]').value = passeio.frequencia || '';
    document.querySelector('[name="classificacao"]').value = passeio.classificacao || '';
    document.querySelector('[name="informacoes_importantes"]').value = passeio.informacoes_importantes || '';

    // JSON fields: roteiro/inclui/embarques/horarios
    const roteiro = parseMaybeJson(passeio.roteiro) || {};
    const inclui = parseMaybeJson(passeio.inclui) || [];
    const embarques = parseMaybeJson(passeio.locais_embarque) || [];
    const horarios = parseMaybeJson(passeio.horarios) || [];

    // Preenche roteiro inputs
    document.getElementById('roteiroSaidaLocal').value = roteiro?.saida?.local || '';
    document.getElementById('roteiroSaidaHora').value = roteiro?.saida?.hora || '';
    document.getElementById('roteiroRetornoLocal').value = roteiro?.retorno?.local || '';
    document.getElementById('roteiroRetornoHora').value = roteiro?.retorno?.hora || '';

    state.paradas = Array.isArray(roteiro?.paradas) ? roteiro.paradas : [];
    state.inclui = Array.isArray(inclui) ? inclui : [];
    state.embarques = Array.isArray(embarques) ? embarques : [];
    state.horarios = Array.isArray(horarios) ? horarios : [];

    renderParadas(state);
    renderInclui(state);
    renderEmbarques(state);
    renderHorarios(state);

    syncRoteiroHidden(state);
    syncIncluiHidden(state);
    syncEmbarqueHidden(state);
    syncHorariosHidden(state);

    // Categorias
    await carregarCategorias(passeio.categoria);

    // Imagens existentes
    renderImagensExistentes(passeio.imagens || []);

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
    const res = await fetch(`${API_URL}/passeios`, {
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
    const res = await fetch(`${API_URL}/passeios/${id}`, {
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

// ================= LISTAS (ADD) =================
function addParada(state) {
  const local = document.getElementById('paradaLocalInput').value.trim();
  const hora = document.getElementById('paradaHoraInput').value;

  if (!local) {
    alert('Informe o local da parada.');
    return;
  }

  state.paradas.push({ local, hora: hora || null });
  document.getElementById('paradaLocalInput').value = '';
  document.getElementById('paradaHoraInput').value = '';

  renderParadas(state);
  syncRoteiroHidden(state);
}

function addInclui(state) {
  const item = document.getElementById('incluiInput').value.trim();
  if (!item) {
    alert('Digite um item do que inclui.');
    return;
  }

  state.inclui.push(item);
  document.getElementById('incluiInput').value = '';

  renderInclui(state);
  syncIncluiHidden(state);
}

function addEmbarque(state) {
  const item = document.getElementById('embarqueInput').value.trim();
  if (!item) {
    alert('Digite um local de embarque.');
    return;
  }

  state.embarques.push(item);
  document.getElementById('embarqueInput').value = '';

  renderEmbarques(state);
  syncEmbarqueHidden(state);
}

function addHorario(state) {
  const horario = document.getElementById('horarioInput').value;
  if (!horario) {
    alert('Selecione um horário.');
    return;
  }

  if (state.horarios.includes(horario)) {
    alert('Esse horário já foi adicionado.');
    return;
  }

  state.horarios.push(horario);
  document.getElementById('horarioInput').value = '';

  renderHorarios(state);
  syncHorariosHidden(state);
}

// ================= RENDER =================
function renderParadas(state) {
  const wrap = document.getElementById('paradasList');
  wrap.innerHTML = '';

  if (state.paradas.length === 0) {
    wrap.innerHTML = `<small>Nenhuma parada adicionada.</small>`;
    return;
  }

  state.paradas.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = 'linha-item';

    div.innerHTML = `
      <div class="linha-item-texto">
        <strong>${escapeHtml(p.local)}</strong>
        <small>${p.hora ? `(${escapeHtml(p.hora)})` : `(sem horário)`}</small>
      </div>
      <button type="button" class="btn-confirmar" data-remove-parada="${idx}">Remover</button>
    `;
    wrap.appendChild(div);
  });

  wrap.querySelectorAll('[data-remove-parada]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const i = Number(ev.currentTarget.getAttribute('data-remove-parada'));
      state.paradas.splice(i, 1);
      renderParadas(state);
      syncRoteiroHidden(state);
    });
  });
}

function renderInclui(state) {
  const wrap = document.getElementById('incluiList');
  wrap.innerHTML = '';

  if (state.inclui.length === 0) {
    wrap.innerHTML = `<small>Nenhum item adicionado.</small>`;
    return;
  }

  state.inclui.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'linha-item';

    div.innerHTML = `
      <div class="linha-item-texto">• ${escapeHtml(item)}</div>
      <button type="button" class="btn-confirmar" data-remove-inclui="${idx}">Remover</button>
    `;
    wrap.appendChild(div);
  });

  wrap.querySelectorAll('[data-remove-inclui]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const i = Number(ev.currentTarget.getAttribute('data-remove-inclui'));
      state.inclui.splice(i, 1);
      renderInclui(state);
      syncIncluiHidden(state);
    });
  });
}

function renderEmbarques(state) {
  const wrap = document.getElementById('embarqueList');
  wrap.innerHTML = '';

  if (state.embarques.length === 0) {
    wrap.innerHTML = `<small>Nenhum local adicionado.</small>`;
    return;
  }

  state.embarques.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'linha-item';

    div.innerHTML = `
      <div class="linha-item-texto">• ${escapeHtml(item)}</div>
      <button type="button" class="btn-confirmar" data-remove-embarque="${idx}">Remover</button>
    `;
    wrap.appendChild(div);
  });

  wrap.querySelectorAll('[data-remove-embarque]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const i = Number(ev.currentTarget.getAttribute('data-remove-embarque'));
      state.embarques.splice(i, 1);
      renderEmbarques(state);
      syncEmbarqueHidden(state);
    });
  });
}

function renderHorarios(state) {
  const wrap = document.getElementById('horariosList');
  wrap.innerHTML = '';

  if (state.horarios.length === 0) {
    wrap.innerHTML = `<small>Nenhum horário adicionado.</small>`;
    return;
  }

  state.horarios.forEach((h, idx) => {
    const div = document.createElement('div');
    div.className = 'linha-item';

    div.innerHTML = `
      <div class="linha-item-texto">• ${escapeHtml(h)}</div>
      <button type="button" class="btn-confirmar" data-remove-horario="${idx}">Remover</button>
    `;
    wrap.appendChild(div);
  });

  wrap.querySelectorAll('[data-remove-horario]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const i = Number(ev.currentTarget.getAttribute('data-remove-horario'));
      state.horarios.splice(i, 1);
      renderHorarios(state);
      syncHorariosHidden(state);
    });
  });
}

// ================= HIDDEN SYNC =================
function syncRoteiroHidden(state) {
  const saidaLocal = document.getElementById('roteiroSaidaLocal').value.trim();
  const saidaHora = document.getElementById('roteiroSaidaHora').value || null;
  const retornoLocal = document.getElementById('roteiroRetornoLocal').value.trim();
  const retornoHora = document.getElementById('roteiroRetornoHora').value || null;

  const roteiro = {
    saida: { local: saidaLocal || null, hora: saidaHora },
    paradas: state.paradas,
    retorno: { local: retornoLocal || null, hora: retornoHora }
  };

  document.getElementById('roteiroHidden').value = JSON.stringify(roteiro);
}

function syncIncluiHidden(state) {
  document.getElementById('incluiHidden').value = JSON.stringify(state.inclui);
}

function syncEmbarqueHidden(state) {
  document.getElementById('embarqueHidden').value = JSON.stringify(state.embarques);
}

function syncHorariosHidden(state) {
  document.getElementById('horariosHidden').value = JSON.stringify(state.horarios);
}

// ================= IMAGENS (EXISTENTES + PREVIEW NOVAS) =================
function renderImagensExistentes(imagens) {
  const wrap = document.getElementById('imagensExistentes');
  if (!wrap) return;

  if (!Array.isArray(imagens) || imagens.length === 0) {
    wrap.innerHTML = `<small>Nenhuma imagem cadastrada ainda.</small>`;
    return;
  }

  wrap.innerHTML = `
    <small style="display:block; margin-bottom:8px;">
      Imagens atuais do passeio:
    </small>
    <div class="imagens-existentes-grid">
      ${imagens.map(nome => `
        <div class="img-existente-card">
          <img src="${API_URL}/uploads/${encodeURIComponent(nome)}" alt="Imagem do passeio">
        </div>
      `).join('')}
    </div>
  `;
}

function setupPreviewImagens() {
  const imagensInput = document.getElementById('imagensInput');
  const imagensPreview = document.getElementById('imagensPreview');
  const hint = document.getElementById('hintImagens');

  if (!imagensInput || !imagensPreview) return;

  let imagensSelecionadas = [];

  imagensInput.addEventListener('change', () => {
    imagensSelecionadas = Array.from(imagensInput.files);

    if (hint) {
      hint.textContent = imagensSelecionadas.length > 0
        ? 'Novas imagens selecionadas: ao salvar, elas vão substituir as atuais.'
        : 'Se você selecionar novas imagens na edição, elas vão substituir as atuais.';
    }

    atualizarPreview();
    sincronizarInputFiles();
  });

  function atualizarPreview() {
    imagensPreview.innerHTML = '';

    if (imagensSelecionadas.length === 0) {
      imagensPreview.innerHTML = `<small>Nenhuma nova imagem selecionada.</small>`;
      return;
    }

    imagensSelecionadas.forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;

      const card = document.createElement('div');
      card.className = 'img-preview-card';

      const img = document.createElement('img');
      img.className = 'img-preview-thumb';
      img.alt = `Imagem ${index + 1}`;

      const info = document.createElement('div');
      info.className = 'img-preview-info';
      info.innerHTML = `
        <small title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</small>
        <small>${formatBytes(file.size)}</small>
      `;

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.className = 'img-preview-remove';
      btnRemove.textContent = 'Remover';

      btnRemove.addEventListener('click', () => {
        imagensSelecionadas.splice(index, 1);
        atualizarPreview();
        sincronizarInputFiles();
      });

      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.readAsDataURL(file);

      card.appendChild(img);
      card.appendChild(info);
      card.appendChild(btnRemove);

      imagensPreview.appendChild(card);
    });
  }

  function sincronizarInputFiles() {
    const dt = new DataTransfer();
    imagensSelecionadas.forEach(f => dt.items.add(f));
    imagensInput.files = dt.files;
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    const val = bytes / Math.pow(1024, i);
    return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }
}

// ================= UTIL =================
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseMaybeJson(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  const s = String(value).trim();
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
