import { getCart, updateQty, removeFromCart } from "./cart-storage.js";

function formatBRL(n) {
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcSubtotal(cart) {
  return cart.reduce((sum, item) => sum + Number(item.preco) * Number(item.quantidade), 0);
}

function calcTaxas(subtotal) {
  return subtotal > 0 ? 20 : 0; // ajuste se quiser
}

function updateSummary(cart) {
  const subtotal = calcSubtotal(cart);
  const taxas = calcTaxas(subtotal);
  const total = subtotal + taxas;

  document.getElementById("subtotalValue").textContent = formatBRL(subtotal);
  document.getElementById("taxasValue").textContent = formatBRL(taxas);
  document.getElementById("totalValue").textContent = formatBRL(total);
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="alert alert-info">Seu carrinho está vazio.</div>`;
    updateSummary(cart);
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="card mb-3" data-id="${item.id}">
      <div class="card-body d-flex align-items-center">
        <img src="${item.imagem}" alt="${item.titulo}"
          style="width:110px;height:80px;object-fit:cover;border-radius:8px;">

        <div class="ms-3 flex-grow-1">
          <h5 class="mb-1">
            <!-- ✅ TIRA stretched-link pra não cobrir os botões -->
            <a href="${item.detalhesUrl}" class="text-decoration-none text-dark fw-semibold">
              ${item.titulo}
            </a>
          </h5>
          <p class="text-muted small mb-1">${item.subtitulo || ""}</p>

          <!-- ✅ z-index pra garantir clique nos botões -->
          <div class="d-flex align-items-center position-relative" style="z-index: 2;">
            <button class="btn btn-outline-secondary btn-sm me-2 btn-minus" type="button">-</button>
            <span>${item.quantidade}</span>
            <button class="btn btn-outline-secondary btn-sm ms-2 btn-plus" type="button">+</button>
          </div>
        </div>

        <div class="text-end position-relative" style="z-index: 2;">
          <p class="item-price mb-1">${formatBRL(item.preco * item.quantidade)}</p>
          <button class="btn btn-outline-danger btn-sm btn-remove" type="button">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  updateSummary(cart);
}

// Delegação de eventos (+ / - / remover) com bloqueio de navegação
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card[data-id]");
  if (!card) return;

  const id = card.getAttribute("data-id");

  const plus = e.target.closest(".btn-plus");
  const minus = e.target.closest(".btn-minus");
  const remove = e.target.closest(".btn-remove");

  if (plus || minus || remove) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (plus) {
    updateQty(id, +1);
    renderCart();
  }

  if (minus) {
    updateQty(id, -1);
    renderCart();
  }

  if (remove) {
    removeFromCart(id);
    renderCart();
  }
});

document.addEventListener("DOMContentLoaded", renderCart);
