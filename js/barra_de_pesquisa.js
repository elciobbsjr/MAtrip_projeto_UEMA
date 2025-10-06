// ====== Carrega e injeta a barra de pesquisa ======
fetch('paginas/barra_de_pesquisa.html')
  .then(r => r.text())
  .then(html => {
    const container = document.getElementById('barra-pesquisa-container');
    container.innerHTML = html;

    const cssPath = '/css/barra_de_pesquisa.css';
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = cssPath;
      document.head.appendChild(css);
    }

    // ====== Animação fade-in ======
    const barra = container.querySelector('.container');
    if (barra) {
      barra.classList.add('barra-fadein');
      requestAnimationFrame(() => barra.classList.add('show'));
    }

    // ====== Inicializa dropdowns ======
    const dropdownTriggers = container.querySelectorAll('.dropdown-toggle');
    dropdownTriggers.forEach(trigger => new bootstrap.Dropdown(trigger));

    // ====== Dados de estados e municípios ======
    const estados = {
      "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"],
      "AL": ["Maceió", "Arapiraca", "Penedo"],
      "AM": ["Manaus", "Parintins", "Itacoatiara"],
      "AP": ["Macapá", "Santana"],
      "BA": ["Salvador", "Feira de Santana", "Ilhéus", "Itabuna"],
      "CE": ["Fortaleza", "Juazeiro do Norte", "Sobral"],
      "DF": ["Brasília"],
      "ES": ["Vitória", "Vila Velha", "Serra"],
      "GO": ["Goiânia", "Anápolis", "Aparecida de Goiânia"],
      "MA": ["São Luís", "Imperatriz", "Barreirinhas", "Santo Amaro", "Paulino Neves"],
      "MG": ["Belo Horizonte", "Uberlândia", "Ouro Preto"],
      "MS": ["Campo Grande", "Dourados"],
      "MT": ["Cuiabá", "Rondonópolis"],
      "PA": ["Belém", "Santarém", "Marabá"],
      "PB": ["João Pessoa", "Campina Grande"],
      "PE": ["Recife", "Olinda", "Petrolina"],
      "PI": ["Teresina", "Parnaíba"],
      "PR": ["Curitiba", "Londrina", "Maringá"],
      "RJ": ["Rio de Janeiro", "Niterói", "Petrópolis", "Angra dos Reis"],
      "RN": ["Natal", "Mossoró"],
      "RO": ["Porto Velho", "Ji-Paraná"],
      "RR": ["Boa Vista"],
      "RS": ["Porto Alegre", "Caxias do Sul", "Gramado"],
      "SC": ["Florianópolis", "Joinville", "Blumenau"],
      "SE": ["Aracaju", "Lagarto"],
      "SP": ["São Paulo", "Campinas", "Santos", "São José dos Campos"],
      "TO": ["Palmas", "Araguaína"]
    };

    const ufList = container.querySelector('#ufList');
    const municipioList = container.querySelector('#municipioList');
    const ufButton = container.querySelector('#dropdownUF');
    const municipioButton = container.querySelector('#dropdownMunicipio');

    // Preenche lista de UFs
    Object.keys(estados).forEach(uf => {
      const li = document.createElement('li');
      li.innerHTML = `<a class="dropdown-item" href="#">${uf}</a>`;
      ufList.appendChild(li);
    });

    // Evento: selecionar UF
    ufList.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', e => {
        const uf = e.target.textContent;
        ufButton.textContent = uf;
        municipioButton.textContent = "Município";
        municipioList.innerHTML = '';

        // Popula municípios da UF
        estados[uf].forEach(m => {
          const li = document.createElement('li');
          li.innerHTML = `<a class="dropdown-item" href="#">${m}</a>`;
          municipioList.appendChild(li);
        });

        // Reativa o dropdown dos municípios
        municipioList.querySelectorAll('.dropdown-item').forEach(mItem => {
          mItem.addEventListener('click', ev => {
            municipioButton.textContent = ev.target.textContent;
          });
        });
      });
    });

    console.log("✅ Barra de pesquisa carregada com UFs e municípios!");
  })
  .catch(err => console.error("❌ Erro ao carregar barra de pesquisa:", err));
