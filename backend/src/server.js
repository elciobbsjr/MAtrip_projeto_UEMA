require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path'); // ✅ movido pra cima
const db = require('./database');

const facebookPassport = require('./facebookAuth');
console.log(process.env.GOOGLE_CLIENT_ID);

const app = express();

// ==============================
// MIDDLEWARES
// ==============================
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const passport = require('./googleAuth');

app.use(facebookPassport.initialize());

app.use(passport.initialize());


// ==============================
// MULTER (UPLOAD)
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// ==============================
// ✅ FRONT (INDEX fora do backend)
// RAIZ DO PROJETO (um nível acima da pasta "backend")
// ==============================
const ROOT_DIR = path.join(__dirname, '..', '..'); // agora aponta pra raiz do projeto


// servir pastas do FRONT
// ⚠️ sua pasta no print é "CSS" (maiúsculo), então aqui tem que ser CSS
app.use('/css', express.static(path.join(ROOT_DIR, 'CSS')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));
app.use('/img', express.static(path.join(ROOT_DIR, 'img')));
app.use('/paginas', express.static(path.join(ROOT_DIR, 'paginas')));

// se você usa navbar.html/footer.html na raiz
app.use(express.static(ROOT_DIR));

// ✅ rota HOME (fica só essa rota "/")
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// ==============================
// LISTAR USUÁRIOS
// ==============================
app.get('/usuarios', (req, res) => {
  db.query('SELECT id, nome, email, tipo FROM usuarios', (err, results) => {
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
  } catch {
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

  db.query(sql, [tipo, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Tipo atualizado com sucesso' });
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

// ==============================
// CADASTRAR PASSEIO (GUIA) + IMAGENS
// ==============================
app.post('/passeios', upload.array('imagens', 10), (req, res) => {
  const {
    categoria,
    local,

    cidade,
    estado,

    descricao,
    valor_adulto,
    valor_estudante,
    valor_crianca,
    valor_final,
    guia_id,

    data_passeio,
    roteiro,
    inclui,
    locais_embarque,
    horarios,
    frequencia,
    classificacao,
    informacoes_importantes
  } = req.body;

  if (!categoria || !local || !cidade || !estado || !descricao || !valor_final || !guia_id) {
    return res.status(400).json({ error: 'Dados obrigatórios não preenchidos' });
  }

  const uf = String(estado || '').trim().toUpperCase();

  const sqlPasseio = `
    INSERT INTO passeios
    (
      categoria, local, cidade, estado, descricao,
      valor_adulto, valor_estudante, valor_crianca, valor_final,
      guia_id,
      data_passeio, roteiro, inclui, locais_embarque, horarios, frequencia,
      classificacao, informacoes_importantes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sqlPasseio,
    [
      categoria,
      local,
      cidade,
      uf,
      descricao,
      valor_adulto || null,
      valor_estudante || null,
      valor_crianca || null,
      valor_final,
      guia_id,

      data_passeio || null,
      roteiro || null,
      inclui || null,
      locais_embarque || null,
      horarios || null,
      frequencia || null,
      classificacao || null,
      informacoes_importantes || null
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao cadastrar passeio' });
      }

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

      res.status(201).json({ message: 'Passeio cadastrado com sucesso!', id: passeioId });
    }
  );
});

// ==============================
// LISTAR TODOS PASSEIOS (RESUMO)
// ==============================
app.get('/passeios', (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.categoria,
      p.local,
      p.cidade,
      p.estado,
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
      p.cidade,
      p.estado,
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

  db.query(
    'DELETE FROM passeio_imagens WHERE passeio_id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao excluir imagens' });

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

  db.query('SELECT * FROM passeios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar passeio' });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Passeio não encontrado' });
    }
    res.json(results[0]);
  });
});

// ==============================
// DETALHES DO PASSEIO + IMAGENS
// ==============================
app.get('/passeios/:id/detalhes', (req, res) => {
  const { id } = req.params;

  const sqlPasseio = `
    SELECT 
      p.*,
      u.nome AS guia_nome
    FROM passeios p
    LEFT JOIN usuarios u ON u.id = p.guia_id
    WHERE p.id = ?
    LIMIT 1
  `;

  db.query(sqlPasseio, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do passeio' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Passeio não encontrado' });
    }

    const passeio = results[0];

    db.query(
      'SELECT id, caminho FROM passeio_imagens WHERE passeio_id = ? ORDER BY id ASC',
      [id],
      (err2, imgs) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: 'Erro ao buscar imagens do passeio' });
        }

        passeio.imagens = imgs.map(i => i.caminho);
        res.json(passeio);
      }
    );
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
    cidade,
    estado,
    descricao,
    valor_adulto,
    valor_estudante,
    valor_crianca,
    valor_final,
    data_passeio,
    roteiro,
    inclui,
    locais_embarque,
    horarios,
    frequencia,
    classificacao,
    informacoes_importantes
  } = req.body;

  if (!categoria || !local || !cidade || !estado || !descricao || !valor_final) {
    return res.status(400).json({ error: 'Dados obrigatórios não preenchidos' });
  }

  const uf = String(estado || '').trim().toUpperCase();

  const sql = `
    UPDATE passeios
    SET
      categoria = ?,
      local = ?,
      cidade = ?,
      estado = ?,
      descricao = ?,
      valor_adulto = ?,
      valor_estudante = ?,
      valor_crianca = ?,
      valor_final = ?,
      data_passeio = ?,
      roteiro = ?,
      inclui = ?,
      locais_embarque = ?,
      horarios = ?,
      frequencia = ?,
      classificacao = ?,
      informacoes_importantes = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      categoria,
      local,
      cidade,
      uf,
      descricao,
      valor_adulto || null,
      valor_estudante || null,
      valor_crianca || null,
      valor_final,
      data_passeio || null,
      roteiro || null,
      inclui || null,
      locais_embarque || null,
      horarios || null,
      frequencia || null,
      classificacao || null,
      informacoes_importantes || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar passeio' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Passeio não encontrado' });
      }

      if (req.files && req.files.length > 0) {
        const sqlImagem = `
          INSERT INTO passeio_imagens (passeio_id, caminho)
          VALUES (?, ?)
        `;
        req.files.forEach(file => {
          db.query(sqlImagem, [id, file.filename]);
        });
      }

      res.json({ message: 'Passeio atualizado com sucesso!' });
    }
  );
});

// ==============================
// HOME - PASSEIOS (INDEX)
// ==============================
app.get('/home/passeios', (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.categoria,
      p.local,
      p.cidade,
      p.estado,
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
// PARCEIROS
// ==============================
app.post('/parceiros', upload.single('logo'), (req, res) => {
  const { nome, documento } = req.body;

  if (!nome || !documento) {
    return res.status(400).json({ error: 'Nome e CPF/CNPJ são obrigatórios' });
  }

  const doc = String(documento).replace(/\D/g, '');

  let tipo = null;
  if (doc.length === 11) tipo = 'CPF';
  if (doc.length === 14) tipo = 'CNPJ';
  if (!tipo) return res.status(400).json({ error: 'CPF/CNPJ inválido' });

  const logo = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO parceiros (nome, documento, tipo_documento, logo)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [nome.trim(), doc, tipo, logo], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Já existe parceiro com esse CPF/CNPJ' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Erro ao cadastrar parceiro' });
    }

    res.status(201).json({ message: 'Parceiro cadastrado com sucesso!', id: result.insertId });
  });
});

app.get('/parceiros', (req, res) => {
  db.query('SELECT id, nome, documento, tipo_documento, logo, created_at FROM parceiros ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar parceiros' });
    res.json(results);
  });
});

app.get('/parceiros/public', (req, res) => {
  const sql = 'SELECT id, nome, logo FROM parceiros ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar parceiros' });
    res.json(results);
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const userJson = JSON.stringify(req.user).replace(/</g, "\\u003c");

    res.send(`
      <script>
        localStorage.setItem("usuario", ${JSON.stringify(userJson)});
        localStorage.setItem("tipo", ${JSON.stringify(req.user.tipo)});

        const redirect = localStorage.getItem("redirectAfterLogin");
        if (redirect) {
          localStorage.removeItem("redirectAfterLogin");
          window.location.replace(redirect);
        } else {
          window.location.replace("/paginas/dashboard.html");
        }
      </script>
    `);
  }
);


// LOGIN COM FACEBOOK
app.get('/auth/facebook/callback',
  facebookPassport.authenticate('facebook', { session: false }),
  (req, res) => {
    const userJson = JSON.stringify(req.user).replace(/</g, "\\u003c");

    res.send(`
      <script>
        localStorage.setItem("usuario", ${JSON.stringify(userJson)});
        localStorage.setItem("tipo", ${JSON.stringify(req.user.tipo)});

        const redirect = localStorage.getItem("redirectAfterLogin");
        if (redirect) {
          localStorage.removeItem("redirectAfterLogin");
          window.location.replace(redirect);
        } else {
          window.location.replace("/paginas/dashboard.html");
        }
      </script>
    `);
  }
);

app.get('/auth/facebook',
  facebookPassport.authenticate('facebook', { scope: ['email'] })
);


// ==============================
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
