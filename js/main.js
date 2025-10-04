// Carrega o conteúdo da navbar
fetch('/navbar.html')
  .then(response => response.text())
  .then(data => {
    const el = document.getElementById('navbar-container');
    if (el) el.innerHTML = data;
  });

// Carrega o conteúdo do footer
fetch('/footer.html')
  .then(response => response.text())
  .then(data => {
    const el = document.getElementById('footer-container');
    if (el) el.innerHTML = data;
  });

// Desativa a restauração automática de scroll do navegador
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Garante que a página comece no topo ao carregar
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Carregar flashcards.html dinamicamente
document.addEventListener("DOMContentLoaded", () => {
  fetch("/paginas/flashcards.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("flashcards-container").innerHTML = data;
    })
    .catch(error => console.error("Erro ao carregar flashcards:", error));
});

document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".exibir-mais");

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      const target = botao.getAttribute("data-target");
      const extras = document.querySelectorAll("." + target);

      extras.forEach(el => {
        el.classList.toggle("hidden");
      });

      // Trocar texto do botão
      if (botao.innerText === "Exibir mais") {
        botao.innerText = "Exibir menos";
      } else {
        botao.innerText = "Exibir mais";
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".exibir-mais");

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      const target = botao.getAttribute("data-target");
      const extras = document.querySelectorAll("." + target);

      extras.forEach(el => {
        el.classList.toggle("hidden");
      });

      // Trocar texto do botão
      if (botao.innerText === "Exibir mais") {
        botao.innerText = "Exibir menos";
      } else {
        botao.innerText = "Exibir mais";
      }
    });
  });
});
