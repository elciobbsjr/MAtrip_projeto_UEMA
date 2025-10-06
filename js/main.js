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
// 🎴 BOTÕES "VER MAIS / VER MENOS"
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-vermais")) {
      const btn = e.target;
      const categoria = btn.closest(".categoria");
      const extras = categoria.querySelector(".extras");

      if (!extras) return;

      extras.classList.toggle("show");

      // Alterna texto do botão
      btn.textContent = extras.classList.contains("show")
        ? "Ver menos"
        : "Ver mais";
    }
  });
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
