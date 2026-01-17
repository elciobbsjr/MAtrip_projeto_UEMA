const CART_KEY = "matrip_cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(p => String(p.id) === String(item.id));

  if (existing) {
    existing.quantidade = Number(existing.quantidade || 1) + 1;
  } else {
    cart.push({ ...item, quantidade: 1 }); // ✅ CORRIGIDO
  }

  saveCart(cart);
}

export function removeFromCart(id) {
  const cart = getCart().filter(p => String(p.id) !== String(id));
  saveCart(cart);
}

export function updateQty(id, delta) {
  let cart = getCart();
  const item = cart.find(p => String(p.id) === String(id));
  if (!item) return;

  item.quantidade = Number(item.quantidade || 1) + Number(delta);

  if (item.quantidade <= 0) {
    cart = cart.filter(p => String(p.id) !== String(id));
  }

  saveCart(cart);
}
