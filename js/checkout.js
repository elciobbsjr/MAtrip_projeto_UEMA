// ====== DUPLICAR PARTICIPANTE ======
const container = document.getElementById('containerParticipantes');
const btnAdicionar = document.getElementById('btnAdicionar');

let contador = 1;

btnAdicionar.addEventListener('click', () => {
  contador++;

  const clone = document.querySelector('.participante').cloneNode(true);

  // Atualiza título
  clone.querySelector('h5').innerText = `Participante ${contador}`;

  // Limpa inputs
  clone.querySelectorAll('input').forEach(input => input.value = "");

  container.appendChild(clone);
});
