async function carregarPasseios() {
  try {
    const response = await fetch('http://localhost:3000/passeios');
    const passeios = await response.json();

    const container = document.getElementById('listaPasseios');
    container.innerHTML = '';

    passeios.forEach(passeio => {
      const card = document.createElement('div');
      card.classList.add('passeio-card');

      card.innerHTML = `
        <img 
          src="http://localhost:3000/uploads/${passeio.imagem || 'default.jpg'}" 
          alt="Imagem do passeio"
        >

        <div class="passeio-info">
          <span class="categoria">${passeio.categoria}</span>
          <h3>${passeio.local}</h3>
          <p>${passeio.descricao}</p>
          <strong>R$ ${Number(passeio.valor_final).toFixed(2)}</strong>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    alert('Erro ao carregar passeios');
  }
}

carregarPasseios();
