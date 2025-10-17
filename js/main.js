// ==============================
// 🚀 INJEÇÃO DE COMPONENTES
// ==============================
function carregarComponente(seletor, caminho) {
  const elemento = document.querySelector(seletor);
  if (elemento) {
    fetch(caminho)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar ${caminho}`);
        return res.text();
      })
      .then(html => {
        elemento.innerHTML = html;

        // ✅ Se for o container dos flashcards, ativa o scroll reveal
        if (seletor === "#flashcards-container") {
          ativarScrollReveal();
        }
      })
      .catch(err => console.error(err));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarComponente("#navbar-container", "/navbar.html");
  carregarComponente("#carrossel-container", "/paginas/carrossel.html");
  carregarComponente("#flashcards-container", "/paginas/flashcards.html");
  carregarComponente("#footer-container", "/footer.html");
});

// ==============================
// 🧭 CONTROLE DE SCROLL
// ==============================
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

// ==============================
// 🌟 ANIMAÇÃO AO ROLAR (Scroll Reveal)
// ==============================
function ativarScrollReveal() {
  const cards = document.querySelectorAll(".card");

  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // mostra apenas uma vez
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
}

// ==============================
// ⬆️ BOTÃO "VOLTAR AO TOPO"
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const btnTopo = document.getElementById("btn-topo");

  if (!btnTopo) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btnTopo.classList.add("show");
    } else {
      btnTopo.classList.remove("show");
    }
  });

  btnTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ==============================
// 🤝 ANIMAÇÃO DOS PARCEIROS (reveal ao rolar)
// ==============================
function ativarRevealParceiros() {
  const elementos = document.querySelectorAll(".reveal");
  if (!elementos.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elementos.forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", ativarRevealParceiros);

// ==============================
// 🤝 CARROSSEL DE PARCEIROS (pausar ao passar o mouse)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel-logos");

  if (carousel) {
    carousel.addEventListener("mouseenter", () => {
      carousel.style.animationPlayState = "paused";
    });
    carousel.addEventListener("mouseleave", () => {
      carousel.style.animationPlayState = "running";
    });
  }
});

// ==============================
// 🎴 BOTÕES "VER MAIS / VER MENOS / VER TUDO"
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    // Clique no botão "Ver mais"
    if (e.target.classList.contains("btn-vermais")) {
      const btn = e.target;
      const categoria = btn.closest(".categoria");
      const extras = categoria.querySelector(".extras");

      if (!extras) return;

      extras.classList.toggle("show");

      if (extras.classList.contains("show")) {
        btn.style.display = "none"; // Esconde o botão original

        // Cria o container dos novos botões
        const actions = document.createElement("div");
        actions.classList.add("btn-actions");

        // Botão Ver menos
        const btnMenos = document.createElement("button");
        btnMenos.className = "btn-vermenos";
        btnMenos.textContent = "Ver menos";

        // Botão Ver tudo
        const btnTudo = document.createElement("button");
        btnTudo.className = "btn-vertudo";
        btnTudo.textContent = "Ver tudo";

        actions.appendChild(btnMenos);
        actions.appendChild(btnTudo);

        categoria.appendChild(actions);

        // Animação suave nos cards extras
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
    if (e.target.classList.contains("btn-vermenos")) {
      const btnMenos = e.target;
      const categoria = btnMenos.closest(".categoria");
      const extras = categoria.querySelector(".extras");
      const btnVerMais = categoria.querySelector(".btn-vermais");
      const actions = categoria.querySelector(".btn-actions");

      extras.classList.remove("show");
      actions.remove();
      btnVerMais.style.display = "inline-block";
    }

    // Clique em "Ver tudo"
    if (e.target.classList.contains("btn-vertudo")) {
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

      document.querySelectorAll(".btn-actions")?.forEach(a => a.remove());
      document.querySelectorAll(".btn-vermais")?.forEach(b => b.style.display = "none");
    }
  });
});
