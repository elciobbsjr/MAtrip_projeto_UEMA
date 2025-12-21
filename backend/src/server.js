const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// ==============================
// ROTA TESTE
// ==============================
app.get('/', (req, res) => {
  res.send('Servidor rodando 🚀');
});

// ==============================
// LISTAR USUÁRIOS
// ==============================
app.get('/usuarios', (req, res) => {
  db.query('SELECT id, nome, email FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// ==============================
// CADASTRAR USUÁRIO (COM BCRYPT)
// ==============================
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    // criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, senhaHash], (err) => {
      if (err) {
        // erro de email duplicado (se tiver UNIQUE)
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'E-mail já cadastrado' });
        }

        return res.status(500).json(err);
      }

      res.json({ message: 'Usuário cadastrado com sucesso!' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criptografar senha' });
  }
});

// ==============================
// LOGIN
// ==============================
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const sql = 'SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const usuario = results[0];

    const senhaOk = await bcrypt.compare(password, usuario.senha);

    if (!senhaOk) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    // login OK
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    });
  });
});

// ==============================
// ADMIN - LISTAR USUÁRIOS
// ==============================
app.get('/admin/usuarios', (req, res) => {
  const sql = `
    SELECT id, nome, email, tipo
    FROM usuarios
    WHERE tipo != 'admin'
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ==============================
// ADMIN - ALTERAR TIPO DE USUÁRIO
// ==============================
app.put('/admin/usuarios/:id/tipo', (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  if (!['usuario', 'guia'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  const sql = `
    UPDATE usuarios
    SET tipo = ?
    WHERE id = ? AND tipo != 'admin'
  `;

  db.query(sql, [tipo, id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado ou é admin' });
    }

    res.json({ message: 'Tipo de usuário atualizado com sucesso' });
  });
});



// ==============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

