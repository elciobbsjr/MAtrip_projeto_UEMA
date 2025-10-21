// ==============================
// 🚀 INJEÇÃO DE COMPONENTES
// ==============================
function carregarComponente(seletor, caminho) {
  const elemento = document.querySelector(seletor);
  if (!elemento) return;

  fetch(caminho)
    .then(res => {
      if (!res.ok) throw new Error(`Erro ao carregar ${caminho}`);
      return res.text();
    })
    .then(html => {
      elemento.innerHTML = html;

      // ✅ Inicializa componentes específicos após a injeção
      if (seletor === "#carrossel-container") inicializarCarrossel();
      if (seletor === "#flashcards-container") ativarScrollReveal();
    })
    .catch(err => console.error(err));
}

// ==============================
// ⚙️ CARREGAMENTO INICIAL
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  carregarComponente("#navbar-container", "/navbar.html");
  carregarComponente("#carrossel-container", "/paginas/carrossel.html");
  carregarComponente("#flashcards-container", "/paginas/flashcards.html");
  carregarComponente("#footer-container", "/footer.html");

  ativarRevealParceiros();
  configurarBotaoTopo();
  pausarCarrosselParceiros();
  configurarBotoesVerMais();
});

// ==============================
// 🧭 CONTROLE DE SCROLL
// ==============================
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("load", () => window.scrollTo(0, 0));

// ==============================
// 🎠 INICIALIZAÇÃO DO CARROSSEL BOOTSTRAP
// ==============================
function inicializarCarrossel() {
  const myCarousel = document.querySelector('#carouselExampleCaptions');
  if (!myCarousel) return;

  new bootstrap.Carousel(myCarousel, {
    interval: 5000, // ⏱️ tempo entre slides (ms)
    ride: 'carousel', // inicia automaticamente
    pause: false // não pausa ao passar o mouse
  });
}

// ==============================
// 🌟 ANIMAÇÃO AO ROLAR (Scroll Reveal)
// ==============================
function ativarScrollReveal() {
  const cards = document.querySelectorAll(".card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
}

// ==============================
// ⬆️ BOTÃO "VOLTAR AO TOPO"
// ==============================
function configurarBotaoTopo() {
  const btnTopo = document.getElementById("btn-topo");
  if (!btnTopo) return;

  window.addEventListener("scroll", () => {
    btnTopo.classList.toggle("show", window.scrollY > 400);
  });

  btnTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==============================
// 🤝 ANIMAÇÃO DOS PARCEIROS (reveal ao rolar)
// ==============================
function ativarRevealParceiros() {
  const elementos = document.querySelectorAll(".reveal");
  if (!elementos.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elementos.forEach(el => observer.observe(el));
}

// ==============================
// 🤝 CARROSSEL DE PARCEIROS (pausar ao passar o mouse)
// ==============================
function pausarCarrosselParceiros() {
  const carousel = document.querySelector(".carousel-logos");
  if (!carousel) return;

  carousel.addEventListener("mouseenter", () => {
    carousel.style.animationPlayState = "paused";
  });
  carousel.addEventListener("mouseleave", () => {
    carousel.style.animationPlayState = "running";
  });
}

// ==============================
// 🎴 BOTÕES "VER MAIS / VER MENOS / VER TUDO"
// ==============================
function configurarBotoesVerMais() {
  document.body.addEventListener("click", e => {
    const btn = e.target;

    // Clique no botão "Ver mais"
    if (btn.classList.contains("btn-vermais")) {
      const categoria = btn.closest(".categoria");
      const extras = categoria?.querySelector(".extras");
      if (!extras) return;

      extras.classList.toggle("show");

      if (extras.classList.contains("show")) {
        btn.style.display = "none"; // esconde botão original

        // Cria o container dos novos botões
        const actions = document.createElement("div");
        actions.classList.add("btn-actions");

        const btnMenos = document.createElement("button");
        btnMenos.className = "btn-vermenos";
        btnMenos.textContent = "Ver menos";

        const btnTudo = document.createElement("button");
        btnTudo.className = "btn-vertudo";
        btnTudo.textContent = "Ver tudo";

        actions.append(btnMenos, btnTudo);
        categoria.append(actions);

        // animação suave dos cards extras
        extras.querySelectorAll(".card").forEach((card, i) => {
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          setTimeout(() => {
            card.style.transition = "opacity .4s ease, transform .4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, i * 60);
        });
      }
    }

    // Clique em "Ver menos"
    if (btn.classList.contains("btn-vermenos")) {
      const categoria = btn.closest(".categoria");
      const extras = categoria?.querySelector(".extras");
      const btnVerMais = categoria?.querySelector(".btn-vermais");
      categoria?.querySelector(".btn-actions")?.remove();

      extras?.classList.remove("show");
      if (btnVerMais) btnVerMais.style.display = "inline-block";
    }

    // Clique em "Ver tudo"
    if (btn.classList.contains("btn-vertudo")) {
      document.querySelectorAll(".categoria .extras").forEach(ex => {
        ex.classList.add("show");
        ex.querySelectorAll(".card").forEach((card, i) => {
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          setTimeout(() => {
            card.style.transition = "opacity .4s ease, transform .4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, i * 50);
        });
      });

      document.querySelectorAll(".btn-actions").forEach(a => a.remove());
      document.querySelectorAll(".btn-vermais").forEach(b => b.style.display = "none");
    }
  });
}
