console.log("✅ parceiros-dinamico.js carregou");

(function () {
  // Se você abrir o index por Live Server (5500), a API está no 3000.
  const API_BASE =
    window.location.port === "3000"
      ? window.location.origin
      : "http://localhost:3000";

  const ENDPOINT = `${API_BASE}/parceiros/public`;

  async function carregarParceirosHome() {
    const container = document.getElementById("parceirosLogos");
    console.log("container parceirosLogos:", container);

    if (!container) return;

    container.innerHTML = `<span style="color:#94a3b8;">Carregando parceiros...</span>`;

    try {
      const res = await fetch(ENDPOINT);
      const parceiros = await res.json();

      console.log("parceiros:", parceiros);

      if (!res.ok) {
        container.innerHTML = `<span style="color:#ef4444;">Erro ao carregar parceiros (HTTP ${res.status}).</span>`;
        return;
      }

      container.innerHTML = "";

      if (!Array.isArray(parceiros) || parceiros.length === 0) {
        container.innerHTML = `<span style="color:#94a3b8;">Nenhum parceiro cadastrado.</span>`;
        return;
      }

      // 1x
      parceiros.forEach(p => container.appendChild(criarImg(p, API_BASE)));
      // duplica (efeito contínuo)
      parceiros.forEach(p => container.appendChild(criarImg(p, API_BASE)));

    } catch (err) {
      console.error("Erro fetch parceiros:", err);
      container.innerHTML = `<span style="color:#ef4444;">Erro de conexão ao carregar parceiros.</span>`;
    }
  }

  function criarImg(p, API_BASE) {
    const img = document.createElement("img");
    img.className = "parceiro-logo";
    img.alt = p?.nome || "Parceiro";
    img.src = p?.logo ? `${API_BASE}/uploads/${p.logo}` : "/img/placeholder.jpg";
    img.onerror = () => {
      img.onerror = null;
      img.src = "/img/placeholder.jpg";
    };
    return img;
  }

  document.addEventListener("DOMContentLoaded", carregarParceirosHome);
})();
