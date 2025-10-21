document.addEventListener('DOMContentLoaded', () => {
    // ====== CALENDÁRIO ELEGANTE (Flatpickr) ======
    flatpickr("#data", {
        dateFormat: "d/m/Y",
        minDate: "today",
        altInput: true,
        altFormat: "j \\de F \\de Y",
        locale: {
            weekdays: {
                shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                longhand: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
            },
            months: {
                shorthand: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                longhand: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            },
            today: 'Hoje',
            clear: 'Limpar',
        },
    });

    // ====== PERMITE ABRIR O CALENDÁRIO AO CLICAR NA SETA ======
    const setaCalendario = document.querySelector('.seta-calendario');
    const campoData = document.querySelector('#data');

    if (setaCalendario && campoData._flatpickr) {
        setaCalendario.addEventListener('click', () => {
            campoData._flatpickr.open();
        });
    }

    // ====== CARROSSEL COM MINIATURAS ======
    let currentImageIndex = 0;
    const images = document.querySelectorAll('.carrossel .imagens img');
    const totalImages = images.length;
    const thumbs = document.querySelectorAll('.miniaturas .thumb');

    function changeImage() {
        images.forEach((img, i) => {
            img.classList.toggle('imagem-ativa', i === currentImageIndex);
        });
        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('ativa', i === currentImageIndex);
        });
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % totalImages;
        changeImage();
    }

    changeImage();
    let autoPlay = setInterval(nextImage, 4000);

    // ====== CLICAR NAS MINIATURAS ======
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            clearInterval(autoPlay); // pausa o autoplay quando o usuário interage
            currentImageIndex = parseInt(thumb.dataset.index);
            changeImage();
            autoPlay = setInterval(nextImage, 4000); // reinicia o autoplay
        });
    });

    // ====== FORMULÁRIO ======
    const dataInput = document.querySelector('#data');
    const categoriasDiv = document.querySelector('.categorias');
    const totalDiv = document.querySelector('.total');
    const totalValor = document.querySelector('#total-valor');
    const btnConfirmar = document.querySelector('#btn-confirmar');

    const valores = { integral: 200, meia: 100 };
    const campos = ['adultos-integral', 'adultos-meia', 'criancas-integral', 'criancas-meia'];

    function calcularTotal() {
        let total = 0;
        campos.forEach(id => {
            const input = document.getElementById(id);
            const tipo = id.includes('meia') ? 'meia' : 'integral';
            total += parseInt(input.value || 0) * valores[tipo];
        });
        totalValor.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        totalDiv.style.display = total > 0 ? 'block' : 'none';
    }

    dataInput.addEventListener('change', () => {
        categoriasDiv.style.display = dataInput.value ? 'block' : 'none';
        totalDiv.style.display = 'none';
    });

    campos.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            if (input.value < 0) input.value = 0;
            calcularTotal();
        });
    });

    // ====== MODAL DE CONFIRMAÇÃO DE COMPRA ======
    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const btnFecharModal = document.getElementById('btn-fechar-modal');

    btnConfirmar.addEventListener('click', () => {
        const reserva = {
            passeio: 'Lençóis Maranhenses - Lagoa Azul',
            data: dataInput.value,
            total: totalValor.textContent,
        };
        localStorage.setItem('reservaMatrip', JSON.stringify(reserva));
        modalConfirmacao.style.display = 'flex'; // abre o modal
    });

    btnFecharModal.addEventListener('click', () => {
        modalConfirmacao.style.display = 'none';
    });

    modalConfirmacao.addEventListener('click', (e) => {
        if (e.target === modalConfirmacao) modalConfirmacao.style.display = 'none';
    });

    // ====== ESTRELAS INTERATIVAS ======
    const estrelas = document.querySelectorAll('#avaliacao-estrelas span');
    const nota = document.getElementById('nota-avaliacao');

    if (estrelas.length > 0) {
        estrelas.forEach(star => {
            star.addEventListener('mouseover', () => {
                const valor = star.getAttribute('data-valor');
                estrelas.forEach(s => s.classList.toggle('ativa', s.getAttribute('data-valor') <= valor));
            });

            star.addEventListener('click', () => {
                const valor = star.getAttribute('data-valor');
                nota.textContent = `Você avaliou com ${valor} estrela${valor > 1 ? 's' : ''}!`;
            });

            star.addEventListener('mouseout', () => {
                estrelas.forEach(s => s.classList.remove('ativa'));
            });
        });
    }

    // ====== MODAL DE LOCALIZAÇÃO ======
    const modal = document.getElementById('modal-info');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close');

    // Dados do conteúdo do modal
    const infos = {
        maranhao: {
            titulo: 'Maranhão',
            imagem: './img/maranhao.jpg',
            texto: 'O Maranhão é um estado do Nordeste brasileiro, conhecido pelos Lençóis Maranhenses, uma das paisagens mais impressionantes do país, e por sua rica cultura e culinária típica.',
            link: ''
        },
        santoamaro: {
            titulo: 'Santo Amaro',
            imagem: './img/santo-amaro.jpg',
            texto: "Município conhecido por ter as lagoas mais bonitas entre as três cidades base dos Lençóis Maranhenses. Santo Amaro do Maranhão é um município do estado do Maranhão, limita-se ao Norte com o Oceano Atlântico; a Leste com o município de Barreirinhas; a Oeste com o município de Primeira Cruz e ao Sul com o município de Barreirinhas. É um importante polo turístico, nos Lençóis Maranhenses. É banhada pelo Rio Alegre, e o Lago de Santo Amaro. O acesso é através da BR 135, depois pela MA 402 e por fim mais 36 km de estrada de asfalto super tranquila até os estacionamentos no bairro olho d'água. É um dos acessos e o mais próximo para o Parque Nacional dos Lençóis Maranhenses, uma área virgem e quase inexplorada. Apesar do quase anonimato da cidade, a maioria do território dos Lençóis faz parte do município que detém mais da metade do território incluindo inclusive as lagoas maiores. O parque é de fato dividido entre os municípios de Santo Amaro, Barreirinhas e Primeira Cruz embora essa última possua apenas uma pequena parte constituída principalmente por manguezais. Além das lagoas aqui há de fato inúmeras trilhas que para os amantes de paisagens e natureza serão inesquecíveis. Dentre os pontos turísticos do local, destaca-se a Lagoa da Gaivota, cenário do filme Casa de Areia. As principais atrações são as lagoas do Parque Nacional dos Lençóis Maranhenses, sendo o mais belo passeio o da Lagoa das Emendadas, que exige um percurso de 4h a pé, contando ida e volta. Nada que vários mergulhos pelo caminho não aplaquem o cansaço da caminhada. As lagoas mais acessíveis de Santo Amaro são a Lagoa da Andorinha e a Lagoa da Gaivota. As duas podem ser visitadas no mesmo dia e, o que é melhor, com belo pôr do sol. Mais afastadas, estão a Lagoa do Espigão e a Lagoa da Betânia, que são visitadas em passeio de dia inteiro, também com entardecer. Para fechar o circuito de lagoas, invista no passeio de barco até a Lagoa da América. Quem tiver mais tempo na cidade poderá tentar um passeio para a Praia da Travosa, onde há uma pequena comunidade pesqueira. Para descansar na cidade, sem fazer passeios, o ideal é seguir até o rio que corta a região e tomar um delicioso banho de frente para os quiosques que vendem bebida gelada e petiscos fresquinhos.",
            link: ''
        }
    };

    // Abertura da modal
    document.getElementById('link-maranhao')?.addEventListener('click', () => abrirModal('maranhao'));
    document.getElementById('link-santoamaro')?.addEventListener('click', () => abrirModal('santoamaro'));

    function abrirModal(chave) {
        const info = infos[chave];
        modalBody.innerHTML = `
            <img src="${info.imagem}" alt="${info.titulo}">
            <h3>${info.titulo}</h3>
            <p>${info.texto}</p>
            <a href="${info.link}" target="_blank" rel="noopener noreferrer">Saiba mais →</a>
        `;
        modal.style.display = 'flex';
    }

    // Fechar modal de informações
    closeBtn?.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });
});
