const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const db = require('./database');

const app = express();

// ==============================
// MIDDLEWARES
// ==============================
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ==============================
// MULTER (UPLOAD)
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ==============================
// CADASTRAR USUÁRIO
// ==============================
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, senhaHash], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'E-mail já cadastrado' });
        }
        return res.status(500).json(err);
      }

      res.json({ message: 'Usuário cadastrado com sucesso!' });
    });
  } catch (error) {
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
// ADMIN - ALTERAR TIPO
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
    res.json({ message: 'Tipo atualizado com sucesso' });
  });
});

// ==============================
// CADASTRAR PASSEIO (GUIA)
// ==============================
app.post('/passeios', upload.array('imagens', 10), (req, res) => {
  const {
    categoria,
    local,
    descricao,
    valor_adulto,
    valor_estudante,
    valor_crianca,
    valor_final,
    guia_id
  } = req.body;

  if (!categoria || !local || !descricao || !valor_final || !guia_id) {
    return res.status(400).json({ error: 'Dados obrigatórios não preenchidos' });
  }

  const sqlPasseio = `
    INSERT INTO passeios
    (categoria, local, descricao, valor_adulto, valor_estudante, valor_crianca, valor_final, guia_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sqlPasseio,
    [
      categoria,
      local,
      descricao,
      valor_adulto || null,
      valor_estudante || null,
      valor_crianca || null,
      valor_final,
      guia_id
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar passeio' });

      const passeioId = result.insertId;

      if (req.files && req.files.length > 0) {
        const sqlImagem = `
          INSERT INTO passeio_imagens (passeio_id, caminho)
          VALUES (?, ?)
        `;

        req.files.forEach(file => {
          db.query(sqlImagem, [passeioId, file.filename]);
        });
      }

      res.status(201).json({ message: 'Passeio cadastrado com sucesso!' });
    }
  );
});

// ==============================
// LISTAR TODOS PASSEIOS
// ==============================
app.get('/passeios', (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.categoria,
      p.local,
      p.descricao,
      p.valor_final,
      MIN(i.caminho) AS imagem
    FROM passeios p
    LEFT JOIN passeio_imagens i ON p.id = i.passeio_id
    GROUP BY p.id
    ORDER BY p.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar passeios' });
    res.json(results);
  });
});

// ==============================
// LISTAR PASSEIOS DO GUIA
// ==============================
app.get('/guias/:guiaId/passeios', (req, res) => {
  const { guiaId } = req.params;

  const sql = `
    SELECT 
      p.id,
      p.local,
      p.descricao,
      p.valor_final,
      MIN(i.caminho) AS imagem
    FROM passeios p
    LEFT JOIN passeio_imagens i ON p.id = i.passeio_id
    WHERE p.guia_id = ?
    GROUP BY p.id
    ORDER BY p.id DESC
  `;

  db.query(sql, [guiaId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar passeios do guia' });
    res.json(results);
  });
});

// ==============================
// EXCLUIR PASSEIO
// ==============================
app.delete('/passeios/:id', (req, res) => {
  const { id } = req.params;

  // primeiro apaga imagens
  db.query(
    'DELETE FROM passeio_imagens WHERE passeio_id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao excluir imagens' });

      // depois apaga o passeio
      db.query(
        'DELETE FROM passeios WHERE id = ?',
        [id],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: 'Erro ao excluir passeio' });

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Passeio não encontrado' });
          }

          res.json({ message: 'Passeio excluído com sucesso' });
        }
      );
    }
  );
});

// ==============================
// BUSCAR PASSEIO POR ID
// ==============================
app.get('/passeios/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM passeios
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar passeio' });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Passeio não encontrado' });
    }

    res.json(results[0]);
  });
});

// ==============================
// ATUALIZAR PASSEIO
// ==============================
app.put('/passeios/:id', upload.array('imagens', 10), (req, res) => {
  const { id } = req.params;

  const {
    categoria,
    local,
    descricao,
    valor_adulto,
    valor_estudante,
    valor_crianca,
    valor_final
  } = req.body;

  const sql = `
    UPDATE passeios
    SET
      categoria = ?,
      local = ?,
      descricao = ?,
      valor_adulto = ?,
      valor_estudante = ?,
      valor_crianca = ?,
      valor_final = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      categoria,
      local,
      descricao,
      valor_adulto || null,
      valor_estudante || null,
      valor_crianca || null,
      valor_final,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar passeio' });

      res.json({ message: 'Passeio atualizado com sucesso!' });
    }
  );
});

// ==============================
// HOME - PASSEIOS AGRUPADOS POR CATEGORIA
// ==============================
app.get('/home/passeios', (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.categoria,
      p.local,
      p.descricao,
      p.valor_adulto,
      p.valor_estudante,
      p.valor_crianca,
      p.valor_final,
      MIN(i.caminho) AS imagem
    FROM passeios p
    LEFT JOIN passeio_imagens i ON p.id = i.passeio_id
    GROUP BY p.id
    ORDER BY p.categoria, p.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao carregar home' });
    }

    res.json(results);
  });
});

// ==============================
// LISTAR CATEGORIAS
// ==============================
app.get('/categorias', (req, res) => {
  db.query(
    'SELECT id, nome FROM categorias ORDER BY nome',
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// ==============================
// CRIAR CATEGORIA
// ==============================
app.post('/categorias', (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }

  db.query(
    'INSERT INTO categorias (nome) VALUES (?)',
    [nome.toLowerCase()],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Categoria já existe' });
        }
        return res.status(500).json(err);
      }

      res.status(201).json({ message: 'Categoria criada com sucesso' });
    }
  );
});

// BUSCAR PASSEIO POR ID
app.get('/passeios/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM passeios
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Passeio não encontrado' });
    }
    res.json(results[0]);
  });
});


// ==============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
