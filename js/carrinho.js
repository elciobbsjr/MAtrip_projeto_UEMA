import { getCart, updateQty, removeFromCart } from "./cart-storage.js";

function formatBRL(n) {
  return Number(n).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function calcSubtotal(cart) {
  return cart.reduce(
    (sum, item) => sum + Number(item.preco) * Number(item.quantidade),
    0
  );
}

function calcTaxas(subtotal) {
  return subtotal > 0 ? 20 : 0;
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
    container.innerHTML =
      `<div class="alert alert-info">Seu carrinho está vazio.</div>`;
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
            <a href="${item.detalhesUrl}"
               class="text-decoration-none text-dark fw-semibold">
              ${item.titulo}
            </a>
          </h5>

          <p class="text-muted small mb-1">${item.subtitulo || ""}</p>

          <div class="d-flex align-items-center">
            <button class="btn btn-outline-secondary btn-sm me-2 btn-minus">-</button>
            <span>${item.quantidade}</span>
            <button class="btn btn-outline-secondary btn-sm ms-2 btn-plus">+</button>
          </div>
        </div>

        <div class="text-end">
          <p class="mb-1">${formatBRL(item.preco * item.quantidade)}</p>
          <button class="btn btn-outline-danger btn-sm btn-remove">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  updateSummary(cart);
}

// Delegação de eventos
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card[data-id]");
  if (!card) return;

  const id = card.dataset.id;

  if (e.target.closest(".btn-plus")) {
    updateQty(id, +1);
    renderCart();
  }

  if (e.target.closest(".btn-minus")) {
    updateQty(id, -1);
    renderCart();
  }

  if (e.target.closest(".btn-remove")) {
    removeFromCart(id);
    renderCart();
  }
});

// FINALIZAR COMPRA
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    const usuario = localStorage.getItem("usuario");

    if (!cart || cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    if (!usuario) {
      localStorage.setItem("redirectAfterLogin", "/paginas/carrinho.html");
      window.location.href = "/paginas/login1.html";
      return;
    }

    window.location.href = "/paginas/checkout.html";
  });
});
