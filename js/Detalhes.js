document.addEventListener('DOMContentLoaded', init);

const API_URL = 'http://localhost:3000';

async function init() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    alert('Passeio inválido.');
    window.location.href = '/index.html';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/passeios/${id}/detalhes`);
    const passeio = await res.json();

    if (!res.ok) {
      alert(passeio?.error || 'Erro ao carregar detalhes do passeio');
      window.location.href = '/index.html';
      return;
    }

    preencherDetalhes(passeio);
    montarCarrossel(passeio.imagens, passeio.local);

    // Botão comprar -> você liga no carrinho depois
    const btn = document.getElementById('btnComprar');
    if (btn) {
      btn.addEventListener('click', () => {
        // Exemplo simples: vai pro carrinho com id
        window.location.href = `/paginas/carrinho.html?id=${id}`;
      });
    }

  } catch (err) {
    console.error(err);
    alert('Erro de conexão ao carregar detalhes.');
  }
}

// =====================
// PREENCHER TELA
// =====================
function preencherDetalhes(p) {
  setText('passeioTitulo', p.local || 'Passeio');
  setText('passeioLocal', p.categoria ? `Categoria: ${capitalizar(p.categoria)}` : '');
  setText('passeioDescricao', p.descricao || '');
  setText('passeioPreco', formatarMoeda(p.valor_final || 0));

  // Data (date/datetime)
  setOptionalTextBlock('blocoData', 'passeioData', formatarData(p.data_passeio));

  // Classificação / Frequência
  setOptionalTextBlock('blocoClassificacao', 'passeioClassificacao', toText(p.classificacao));
  setOptionalTextBlock('blocoFrequencia', 'passeioFrequencia', montarFrequencia(p.frequencia, p.horarios));

  // Roteiro (JSON)
  renderRoteiro(p.roteiro);

  // Inclui / embarque / importantes (podem vir JSON ou string)
  setOptionalListBlock('blocoInclusos', 'passeioInclusos', toList(p.inclui));
  setOptionalListBlock('blocoEmbarque', 'passeioEmbarque', toList(p.locais_embarque));
  setOptionalListBlock('blocoImportantes', 'passeioImportantes', toList(p.informacoes_importantes));
}

function renderRoteiro(roteiroRaw) {
  const blocoId = 'blocoRoteiro';
  const listId = 'passeioRoteiro';

  const bloco = document.getElementById(blocoId);
  const ul = document.getElementById(listId);
  if (!bloco || !ul) return;

  const roteiro = parseMaybeJson(roteiroRaw);
  if (!roteiro || typeof roteiro !== 'object') {
    bloco.style.display = 'none';
    return;
  }

  const linhas = [];

  // saída
  const saidaLocal = roteiro?.saida?.local;
  const saidaHora = roteiro?.saida?.hora;
  if (saidaLocal || saidaHora) {
    linhas.push(`Saída: ${joinParts([saidaLocal, saidaHora], ' — ')}`);
  }

  // paradas
  const paradas = Array.isArray(roteiro?.paradas) ? roteiro.paradas : [];
  if (paradas.length > 0) {
    paradas.forEach((p, idx) => {
      const local = p?.local;
      const hora = p?.hora;
      linhas.push(`Parada ${idx + 1}: ${joinParts([local, hora], ' — ')}`);
    });
  }

  // retorno
  const retornoLocal = roteiro?.retorno?.local;
  const retornoHora = roteiro?.retorno?.hora;
  if (retornoLocal || retornoHora) {
    linhas.push(`Retorno: ${joinParts([retornoLocal, retornoHora], ' — ')}`);
  }

  if (linhas.length === 0) {
    bloco.style.display = 'none';
    return;
  }

  bloco.style.display = 'block';
  ul.innerHTML = '';
  linhas.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
}

function montarFrequencia(freq, horariosRaw) {
  const f = toText(freq);
  const horarios = toList(horariosRaw);

  if (!f && horarios.length === 0) return '';

  const partes = [];
  if (f) partes.push(`Frequência: ${capitalizar(f.replaceAll('_', ' '))}`);
  if (horarios.length > 0) partes.push(`Horários: ${horarios.join(', ')}`);

  return partes.join(' • ');
}

// =====================
// CARROSSEL (simples)
// Requer esses IDs no HTML:
// - carrosselImagens
// - carrosselIndicadores
// - carrosselThumbs
// =====================
function montarCarrossel(imagens, titulo) {
  const wrapImgs = document.getElementById('carrosselImagens');
  const wrapDots = document.getElementById('carrosselIndicadores');
  const wrapThumbs = document.getElementById('carrosselThumbs');

  if (!wrapImgs || !wrapDots || !wrapThumbs) return;

  const lista = Array.isArray(imagens) && imagens.length > 0 ? imagens : ['default.jpg'];

  wrapImgs.innerHTML = '';
  wrapDots.innerHTML = '';
  wrapThumbs.innerHTML = '';

  lista.forEach((nome, idx) => {
    const src = `${API_URL}/uploads/${encodeURIComponent(nome)}`;

    // imagem grande
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${titulo || 'Passeio'} - imagem ${idx + 1}`;
    img.className = idx === 0 ? 'carrossel-img ativa' : 'carrossel-img';
    img.dataset.index = String(idx);
    wrapImgs.appendChild(img);

    // dots
    const dot = document.createElement('span');
    dot.className = idx === 0 ? 'dot ativa' : 'dot';
    dot.dataset.index = String(idx);
    dot.addEventListener('click', () => ativar(idx));
    wrapDots.appendChild(dot);

    // thumbs
    const th = document.createElement('img');
    th.src = src;
    th.alt = `Miniatura ${idx + 1}`;
    th.className = idx === 0 ? 'thumb ativa' : 'thumb';
    th.dataset.index = String(idx);
    th.addEventListener('click', () => ativar(idx));
    wrapThumbs.appendChild(th);
  });

  function ativar(index) {
    wrapImgs.querySelectorAll('.carrossel-img').forEach(el => {
      el.classList.toggle('ativa', Number(el.dataset.index) === index);
    });
    wrapDots.querySelectorAll('.dot').forEach(el => {
      el.classList.toggle('ativa', Number(el.dataset.index) === index);
    });
    wrapThumbs.querySelectorAll('.thumb').forEach(el => {
      el.classList.toggle('ativa', Number(el.dataset.index) === index);
    });
  }
}

// =====================
// HELPERS
// =====================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
}

function setOptionalTextBlock(blocoId, textId, value) {
  const bloco = document.getElementById(blocoId);
  const texto = toText(value);

  if (!bloco) return;

  if (!texto) {
    bloco.style.display = 'none';
    return;
  }

  bloco.style.display = 'block';
  setText(textId, texto);
}

function setOptionalListBlock(blocoId, listId, items) {
  const bloco = document.getElementById(blocoId);
  const ul = document.getElementById(listId);
  if (!bloco || !ul) return;

  const lista = Array.isArray(items) ? items.filter(Boolean) : [];
  if (lista.length === 0) {
    bloco.style.display = 'none';
    return;
  }

  bloco.style.display = 'block';
  ul.innerHTML = '';
  lista.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
}

function toList(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    const s = value.trim();

    // tenta JSON
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}

    // tenta quebrar por linhas / separadores
    return s
      .split(/\r?\n|;|\|/g)
      .map(x => x.trim())
      .filter(Boolean);
  }

  // objeto -> pega valores
  if (typeof value === 'object') {
    return Object.values(value).map(v => String(v)).filter(Boolean);
  }

  return [];
}

function parseMaybeJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;

  const s = String(value).trim();
  if (!s) return null;

  try { return JSON.parse(s); } catch { return null; }
}

function toText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function joinParts(parts, sep) {
  return parts.filter(Boolean).join(sep);
}

function capitalizar(texto) {
  const t = String(texto || '').trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function formatarMoeda(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const d = new Date(String(dataISO));
  if (Number.isNaN(d.getTime())) return String(dataISO);
  return d.toLocaleDateString('pt-BR');
}
