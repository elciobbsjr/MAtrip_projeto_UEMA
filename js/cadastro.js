console.log('cadastro.js carregado');

const formCadastro = document.getElementById('cadastroForm');

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('formulário enviado');

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirma = document.getElementById('confirma').value;

  if (!nome || !email || !senha || !confirma) {
    alert('Preencha todos os campos');
    return;
  }

  if (senha !== confirma) {
    alert('As senhas não coincidem');
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.error || 'Erro ao cadastrar');
      return;
    }

    alert('Cadastro realizado com sucesso!');
    window.location.href = '/paginas/login1.html';

  } catch (erro) {
    console.error(erro);
    alert('Erro ao conectar com o servidor');
  }
});
