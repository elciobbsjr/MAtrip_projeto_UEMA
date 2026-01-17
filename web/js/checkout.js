import { getCart, updateQty } from "./cart-storage.js";

// ==============================
// HELPERS
// ==============================
function formatBRL(n) {
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcSubtotal(cart) {
  return cart.reduce((s, i) => s + Number(i.preco) * Number(i.quantidade), 0);
}

function calcTaxas(subtotal) {
  return subtotal > 0 ? 20 : 0;
}

function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

function redirectToLogin() {
  localStorage.setItem("redirectAfterLogin", window.location.pathname);
  window.location.href = "/paginas/login1.html";
}

function redirectToCarrinho() {
  window.location.href = "/paginas/carrinho.html";
}

// ==============================
// DOM
// ==============================
const containerParticipantes = document.getElementById("containerParticipantes");
const btnAdicionar = document.getElementById("btnAdicionar");
const btnProsseguirPagamento = document.querySelector(".summary-box .btn-checkout");

// ==============================
// RENDER PRODUTOS + TOTAIS
// ==============================
function getResumoProdutosContainer() {
  const cards = document.querySelectorAll(".col-lg-8 .card.shadow-sm.p-4");
  if (!cards.length) return null;

  const card = cards[cards.length - 1];
  const h4 = card.querySelector("h4");

  let wrap = card.querySelector("#checkoutItems");
  if (!wrap) {
    [...card.children].forEach(c => { if (c !== h4) c.remove(); });
    wrap = document.createElement("div");
    wrap.id = "checkoutItems";
    card.appendChild(wrap);
  }
  return wrap;
}

function renderProdutos(cart) {
  const el = getResumoProdutosContainer();
  if (!el) return;

  el.innerHTML = cart.map((item, i) => `
    <div class="d-flex align-items-center ${i < cart.length - 1 ? "border-bottom pb-3 mb-3" : ""}">
      <img src="${item.imagem}" class="checkout-img me-3">
      <div>
        <h5 class="mb-1">${item.titulo}</h5>
        <small class="text-muted">Qtd: ${item.quantidade}</small><br>
        <strong>${formatBRL(item.preco * item.quantidade)}</strong>
      </div>
    </div>
  `).join("");
}

function updateTotais(cart) {
  const subtotal = calcSubtotal(cart);
  const taxas = calcTaxas(subtotal);
  const total = subtotal + taxas;

  const summary = document.querySelector(".summary-box");
  summary.querySelectorAll("strong")[0].textContent = formatBRL(subtotal);
  summary.querySelectorAll("strong")[1].textContent = formatBRL(taxas);
  summary.querySelector("h5.text-success").textContent = formatBRL(total);

  return { subtotal, taxas, total };
}

function rerenderTudo() {
  const cart = getCart();
  renderProdutos(cart);
  return updateTotais(cart);
}

// ==============================
// PARTICIPANTES
// ==============================
let contador = 1;

function fillPasseios(select, cart) {
  select.innerHTML = cart.map(p =>
    `<option value="${p.id}">${p.titulo}</option>`
  ).join("");
}

function adicionarParticipante() {
  const cart = getCart();
  if (!cart.length) return;

  const base = document.querySelector(".participante");
  const clone = base.cloneNode(true);

  contador++;
  clone.querySelector("h5").innerText = `Participante ${contador}`;
  clone.querySelectorAll("input").forEach(i => i.value = "");

  const select = clone.querySelector("select");
  fillPasseios(select, cart);

  const passeioId = select.value;
  clone.dataset.passeioId = passeioId;

  // ➕ aumenta valor
  updateQty(passeioId, +1);

  // botão remover
  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.className = "btn btn-outline-danger btn-sm mt-3";
  btnRemover.innerText = "Remover participante";
  btnRemover.addEventListener("click", () => removerParticipante(clone));

  clone.appendChild(btnRemover);
  containerParticipantes.appendChild(clone);

  atualizarSelects();
  rerenderTudo();
}

function removerParticipante(card) {
  const passeioId = card.dataset.passeioId;
  updateQty(passeioId, -1);

  card.remove();
  contador--;

  atualizarSelects();
  rerenderTudo();
}

function atualizarSelects() {
  const cart = getCart();
  document.querySelectorAll(".participante").forEach(card => {
    const sel = card.querySelector("select");
    const prev = card.dataset.passeioId;

    fillPasseios(sel, cart);
    sel.value = prev || sel.value;
  });
}

document.addEventListener("change", e => {
  if (!e.target.matches(".participante select")) return;

  const card = e.target.closest(".participante");
  const novo = e.target.value;
  const antigo = card.dataset.passeioId;

  if (novo !== antigo) {
    updateQty(antigo, -1);
    updateQty(novo, +1);
    card.dataset.passeioId = novo;
    rerenderTudo();
  }
});

// ==============================
// FINALIZAR
// ==============================
function coletarParticipantes() {
  return [...document.querySelectorAll(".participante")].map(card => {
    const t = card.querySelectorAll('input[type="text"]');
    return {
      nome: t[0].value,
      telefone: t[1].value,
      cpf: t[2].value,
      idade: card.querySelector('input[type="number"]').value,
      email: card.querySelector('input[type="email"]').value,
      passeioId: card.dataset.passeioId
    };
  });
}

function salvarCheckoutData(cart, totais, participantes, usuario) {
  localStorage.setItem("checkoutData", JSON.stringify({
    usuario,
    itens: cart,
    participantes,
    ...totais
  }));
}

// ==============================
// BOOT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const usuario = getLoggedUser();
  const cart = getCart();

  if (!usuario) return redirectToLogin();
  if (!cart.length) return redirectToCarrinho();

  atualizarSelects();
  rerenderTudo();

  btnAdicionar.addEventListener("click", adicionarParticipante);

  btnProsseguirPagamento.addEventListener("click", () => {
    const cartAtual = getCart();
    const totais = updateTotais(cartAtual);
    const participantes = coletarParticipantes();

    salvarCheckoutData(cartAtual, totais, participantes, usuario);
    // HTML segue para pagamento.html
  });
});
