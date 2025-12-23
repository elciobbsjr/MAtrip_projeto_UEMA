document.addEventListener('DOMContentLoaded', () => {

  // 🔐 Proteção
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'guia') {
    window.location.href = '/paginas/login1.html';
    return;
  }

  const form = document.getElementById('formPasseio');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    console.log('Dados do passeio:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      // 🔜 BACKEND
      /*
      const res = await fetch('http://localhost:3000/guias/passeios', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      */

      alert('Passeio cadastrado com sucesso!');
      form.reset();

    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar passeio');
    }
  });

});
