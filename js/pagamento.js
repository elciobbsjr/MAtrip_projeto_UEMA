/* =============================
   UTIL
============================= */

function getCheckoutData() {
  try {
    return JSON.parse(localStorage.getItem("checkoutData"));
  } catch {
    return null;
  }
}

function formatBRL(v) {
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* =============================
   RESUMO
============================= */

function carregarResumoPagamento() {
  const d = getCheckoutData();
  if (!d) return;

  resumoSubtotal.innerText = formatBRL(d.subtotal);
  resumoTaxas.innerText = formatBRL(d.taxas);
  resumoTotal.innerText = formatBRL(d.total);
}

/* =============================
   PIX
============================= */

async function gerarPix() {
  const checkout = getCheckoutData();
  if (!checkout) return;

  btnPix.disabled = true;
  btnPix.innerText = "Gerando...";

  try {
    const res = await fetch("http://localhost:3000/api/pix/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: checkout.total,
        email: checkout.usuario.email,
        pedidoId: `PIX-${Date.now()}`
      })
    });

    const data = await res.json();
    if (!res.ok) throw data;

    qrPix.src = `data:image/png;base64,${data.qrCodeBase64}`;

    copiarPix.onclick = async () => {
      await navigator.clipboard.writeText(data.copiaECola);
      copiarPix.innerText = "Copiado!";
    };

    new bootstrap.Modal(modalPix).show();

  } catch (e) {
    console.error(e);
    alert("Erro ao gerar PIX");
  } finally {
    btnPix.disabled = false;
    btnPix.innerText = "Gerar QR Code PIX";
  }
}

/* =============================
   CARTÃO
============================= */

const MP_PUBLIC_KEY = "TEST-68841436-830d-4799-a6dd-41b7c30114b1";
const mp = new MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

function parseValidade(v) {
  const [mm, yy] = v.split("/");
  return { month: mm, year: "20" + yy };
}

async function pagarComCartao() {
  const checkout = getCheckoutData();
  if (!checkout) return;

  if (
    !nomeCartao.value ||
    !cpfCartao.value ||
    !numCartao.value ||
    !validadeCartao.value ||
    !cvvCartao.value
  ) {
    alert("Preencha todos os dados do cartão");
    return;
  }

  btnPagarCartao.disabled = true;

  try {
    const validade = parseValidade(validadeCartao.value);

    const tokenRes = await mp.createCardToken({
      cardNumber: numCartao.value.replace(/\s/g, ""),
      cardholderName: nomeCartao.value,
      cardExpirationMonth: validade.month,
      cardExpirationYear: validade.year,
      securityCode: cvvCartao.value
    });

    if (tokenRes.errors) {
      alert("Dados do cartão inválidos");
      return;
    }

    const res = await fetch("http://localhost:3000/api/cartao/pagar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: tokenRes.id,
        valor: checkout.total,
        parcelas: parcelas.value,
        email: checkout.usuario.email,
        cpf: cpfCartao.value.replace(/\D/g, "")
      })
    });

    const data = await res.json();
    if (!res.ok) throw data;

    if (data.status === "approved") {
      window.location.href = "/paginas/confirmacao.html";
    } else {
      alert(`Status do pagamento: ${data.status}`);
    }

  } catch (e) {
    console.error(e);
    alert("Erro no pagamento com cartão");
  } finally {
    btnPagarCartao.disabled = false;
  }
}

/* =============================
   BOOT
============================= */

document.addEventListener("DOMContentLoaded", () => {
  carregarResumoPagamento();
  btnPix.onclick = gerarPix;
  btnPagarCartao.onclick = pagarComCartao;
});
