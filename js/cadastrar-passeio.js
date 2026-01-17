document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();

  const form = document.getElementById('passeioForm');
  const btnNova = document.getElementById('btnNovaCategoria');
  const formNova = document.getElementById('novaCategoriaForm');
  const salvarCategoriaBtn = document.getElementById('salvarCategoria');

  // ================= LISTAS DINÂMICAS =================
  const btnAddParada = document.getElementById('btnAddParada');
  const btnAddInclui = document.getElementById('btnAddInclui');
  const btnAddEmbarque = document.getElementById('btnAddEmbarque');
  const btnAddHorario = document.getElementById('btnAddHorario');

  // Estado (arrays) que viram JSON nos hidden inputs
  const state = {
    paradas: [],
    inclui: [],
    embarques: [],
    horarios: []
  };

  // ================= NOVA CATEGORIA =================
  btnNova.addEventListener('click', () => {
    formNova.style.display =
      formNova.style.display === 'none' ? 'block' : 'none';
  });

  salvarCategoriaBtn.addEventListener('click', criarCategoria);

  // ================= PARADAS =================
  btnAddParada.addEventListener('click', () => {
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
  });

  // ================= INCLUI =================
  btnAddInclui.addEventListener('click', () => {
    const item = document.getElementById('incluiInput').value.trim();
    if (!item) {
      alert('Digite um item do que inclui.');
      return;
    }

    state.inclui.push(item);
    document.getElementById('incluiInput').value = '';
    renderInclui(state);
    syncIncluiHidden(state);
  });

  // ================= EMBARQUES =================
  btnAddEmbarque.addEventListener('click', () => {
    const item = document.getElementById('embarqueInput').value.trim();
    if (!item) {
      alert('Digite um local de embarque.');
      return;
    }

    state.embarques.push(item);
    document.getElementById('embarqueInput').value = '';
    renderEmbarques(state);
    syncEmbarqueHidden(state);
  });

  // ================= HORÁRIOS =================
  btnAddHorario.addEventListener('click', () => {
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
  });

  // Atualiza o hidden do roteiro quando campos base mudarem
  ['roteiroSaidaLocal','roteiroSaidaHora','roteiroRetornoLocal','roteiroRetornoHora'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => syncRoteiroHidden(state));
  });

  // ================= PREVIEW DE IMAGENS (MULTI + REMOVER) =================
  const imagensInput = document.getElementById('imagensInput');
  const imagensPreview = document.getElementById('imagensPreview');

  // Guarda as imagens para permitir remover individualmente
  let imagensSelecionadas = [];

  if (imagensInput && imagensPreview) {
    imagensInput.addEventListener('change', () => {
      // comportamento: ao selecionar de novo, substitui a seleção anterior
      imagensSelecionadas = Array.from(imagensInput.files);

      atualizarPreviewImagens();
      sincronizarInputFiles();
    });
  }

  function atualizarPreviewImagens() {
    imagensPreview.innerHTML = '';

    if (imagensSelecionadas.length === 0) {
      imagensPreview.innerHTML = `<small>Nenhuma imagem selecionada.</small>`;
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
        atualizarPreviewImagens();
        sincronizarInputFiles();
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
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

  // ================= SUBMIT DO PASSEIO =================
  form.addEventListener('submit', (e) => enviarPasseio(e, state));
});

// ================= CONFIG API =================
const API_URL = 'http://localhost:3000';

// ================= CARREGAR CATEGORIAS =================
async function carregarCategorias() {
  const container = document.getElementById('categoriasContainer');
  container.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/categorias`);
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

    carregarCategorias(); // atualiza radios
  } catch (err) {
    console.error(err);
    alert('Erro de conexão');
  }
}

// ================= ENVIAR PASSEIO =================
async function enviarPasseio(e, state) {
  e.preventDefault();

  const form = document.getElementById('passeioForm');

  // sincroniza hidden inputs antes de enviar
  syncRoteiroHidden(state);
  syncIncluiHidden(state);
  syncEmbarqueHidden(state);
  syncHorariosHidden(state);

  // guia logado
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || usuario.tipo !== 'guia') {
    alert('Usuário não autorizado');
    return;
  }

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

    alert('Passeio cadastrado com sucesso!');
    window.location.href = '/paginas/dashboard.html';

  } catch (err) {
    console.error(err);
    alert('Erro ao enviar passeio');
  }
}

// ================= RENDER / SYNC (LISTAS) =================
function renderParadas(state) {
  const wrap = document.getElementById('paradasList');
  wrap.innerHTML = '';

  if (state.paradas.length === 0) {
    wrap.innerHTML = `<small>Nenhuma parada adicionada.</small>`;
    return;
  }

  state.paradas.forEach((p, idx) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';

    div.innerHTML = `
      <div style="flex:1;">
        <strong>${escapeHtml(p.local)}</strong>
        ${p.hora ? `<small style="margin-left:8px;">(${escapeHtml(p.hora)})</small>` : `<small style="margin-left:8px;">(sem horário)</small>`}
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
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';

    div.innerHTML = `
      <div style="flex:1;">• ${escapeHtml(item)}</div>
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
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';

    div.innerHTML = `
      <div style="flex:1;">• ${escapeHtml(item)}</div>
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
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';

    div.innerHTML = `
      <div style="flex:1;">• ${escapeHtml(h)}</div>
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


const cidadesPorEstado = {
  MA: ["São Luís", "Imperatriz", "Barreirinhas", "Carolina"],
  PA: ["Belém", "Santarém", "Alter do Chão"],
  PI: ["Teresina", "Parnaíba"],
  CE: ["Fortaleza", "Jericoacoara"]
};

const estadoSelect = document.getElementById("estadoSelect");
const cidadeSelect = document.getElementById("cidadeSelect");

estadoSelect.addEventListener("change", () => {
  const uf = estadoSelect.value;
  cidadeSelect.innerHTML = "";

  if (!uf || !cidadesPorEstado[uf]) {
    cidadeSelect.innerHTML = `<option value="">Selecione o estado primeiro</option>`;
    return;
  }

  cidadesPorEstado[uf].forEach(cidade => {
    const opt = document.createElement("option");
    opt.value = cidade;
    opt.textContent = cidade;
    cidadeSelect.appendChild(opt);
  });
});




const steps = document.querySelectorAll(".wizard-step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progress = document.getElementById("wizardProgress");

let currentStep = 0;

function updateWizard() {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === currentStep);
  });

  prevBtn.style.display = currentStep === 0 ? "none" : "inline-flex";

  if (currentStep === steps.length - 1) {
    nextBtn.textContent = "Salvar Passeio";
    nextBtn.type = "submit";
  } else {
    nextBtn.textContent = "Próximo";
    nextBtn.type = "button";
  }

  progress.style.width = ((currentStep + 1) / steps.length) * 100 + "%";
}

nextBtn.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateWizard();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateWizard();
  }
});

updateWizard();
