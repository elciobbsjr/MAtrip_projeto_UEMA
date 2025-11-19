/* =============================
   MÁSCARAS DE CARTÃO
============================= */

// Mascara número do cartão (#### #### #### ####)
const numCartao = document.getElementById("numCartao");
if (numCartao) {
  numCartao.addEventListener("input", () => {
    let v = numCartao.value.replace(/\D/g, "");
    v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
    numCartao.value = v.substring(0, 19);
  });
}

// Mascara validade (MM/AA)
const validadeCartao = document.getElementById("validadeCartao");
if (validadeCartao) {
  validadeCartao.addEventListener("input", () => {
    let v = validadeCartao.value.replace(/\D/g, "");
    if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    validadeCartao.value = v.substring(0, 5);
  });
}

// Mascara CVV (###)
const cvvCartao = document.getElementById("cvvCartao");
if (cvvCartao) {
  cvvCartao.addEventListener("input", () => {
    let v = cvvCartao.value.replace(/\D/g, "");
    cvvCartao.value = v.substring(0, 3);
  });
}

/* =============================
   MODAL PIX
============================= */

const btnPix = document.getElementById("btnPix");
const modalPix = document.getElementById("modalPix");

if (btnPix && modalPix) {
  btnPix.addEventListener("click", () => {
    const modal = new bootstrap.Modal(modalPix);
    modal.show();
  });
}

/* =============================
   BOTÃO COPIAR CÓDIGO PIX
============================= */

const btnCopiar = document.getElementById("copiarPix");
if (btnCopiar) {
  btnCopiar.addEventListener("click", () => {
    const codigoPix = "PagamentoMatrip";

    navigator.clipboard.writeText(codigoPix).then(() => {
      btnCopiar.innerText = "Copiado!";
      btnCopiar.classList.remove("btn-outline-success");
      btnCopiar.classList.add("btn-success");

      setTimeout(() => {
        btnCopiar.innerText = "Copiar Código PIX";
        btnCopiar.classList.remove("btn-success");
        btnCopiar.classList.add("btn-outline-success");
      }, 2000);
    });
  });
}

/* =============================
   VALIDAÇÃO BÁSICA DO CARTÃO
============================= */

function validarCamposCartao() {
  const nome = document.getElementById("nomeCartao");
  const numero = document.getElementById("numCartao");
  const validade = document.getElementById("validadeCartao");
  const cvv = document.getElementById("cvvCartao");

  if (!nome.value || !numero.value || !validade.value || !cvv.value) {
    alert("Preencha todos os campos do cartão.");
    return false;
  }

  return true;
}

/* =============================
   ANIMAÇÕES SUAVES
============================= */

// Fade in nos cards
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card, .summary-box");

  cards.forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }, 150 * i);
  });
});
