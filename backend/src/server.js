require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path'); // ✅ movido pra cima
const db = require('./database');
console.log("MP_ACCESS_TOKEN:", process.env.MP_ACCESS_TOKEN);


const crypto = require("crypto");

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));


const { MercadoPagoConfig, Payment } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const mpPayment = new Payment(mpClient);


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
const FRONT_DIR = path.join(__dirname, '../../web'); // Define que a pasta "web" é o front do projeto

// Rotas para subpastas importantes
app.use('/css', express.static(path.join(FRONT_DIR, 'css')));
app.use('/js', express.static(path.join(FRONT_DIR, 'js')));
app.use('/img', express.static(path.join(FRONT_DIR, 'img')));
app.use('/paginas', express.static(path.join(FRONT_DIR, 'paginas')));

// Servir tudo que estiver dentro da pasta web
app.use(express.static(FRONT_DIR));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONT_DIR, 'index.html'));
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
  const { tipo } = req.body;
  const { id } = req.params;

  if (!['admin', 'usuario', 'guia'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  db.query(
    'UPDATE usuarios SET tipo = ? WHERE id = ?',
    [tipo, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar tipo' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ message: 'Tipo atualizado com sucesso' });
    }
  );
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
app.post('/agencias', upload.single('logo'), (req, res) => {
  const {
    nome_fantasia,
    razao_social,
    cnpj,
    homepage,
    email,
    endereco,
    bairro,
    status,
    telefone,
    celular
  } = req.body;

  if (!nome_fantasia || !razao_social || !cnpj || !email || !endereco || !bairro || !celular) {
    return res.status(400).json({ error: 'Dados obrigatórios não preenchidos' });
  }

  const cnpjLimpo = String(cnpj).replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido' });
  }

  const logo = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO agencias (
      nome_fantasia, razao_social, cnpj,
      email, homepage, endereco, bairro,
      telefone, celular, status, logo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nome_fantasia.trim(),
      razao_social.trim(),
      cnpjLimpo,
      email.trim(),
      homepage || null,
      endereco.trim(),
      bairro.trim(),
      telefone || null,
      celular.trim(),
      status || 'ativa',
      logo
    ],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Já existe agência com esse CNPJ' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Erro ao cadastrar agência' });
      }

      res.status(201).json({
        message: 'Agência cadastrada com sucesso!',
        id: result.insertId
      });
    }
  );
});

app.get('/agencias', (req, res) => {
  const sql = `
    SELECT
      id,
      nome_fantasia,
      razao_social,
      cnpj,
      email,
      telefone,
      celular,
      status,
      logo,
      created_at
    FROM agencias
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar agências' });
    }

    res.json(results);
  });
});


app.get('/parceiros/public', (req, res) => {
  const sql = `
    SELECT 
      id,
      nome_fantasia AS nome,
      logo
    FROM agencias
    WHERE status = 'ativa'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ ERRO SQL /parceiros/public:', err);
      return res.status(500).json({ error: 'Erro ao listar parceiros' });
    }

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
// PAGAMENTO PIX - CRIAR
// ==============================
//deixa essa
app.post('/api/pix/criar', async (req, res) => {
  try {
    const { valor, email, pedidoId } = req.body;

    if (!valor || !email || !pedidoId) {
      return res.status(400).json({ error: 'Dados incompletos para PIX' });
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `pix_${pedidoId}_${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: `Pedido ${pedidoId} - Matrip`,
        payment_method_id: "pix",
        payer: { email }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return res.status(400).json(data);
    }

    res.json({
      paymentId: data.id,
      status: data.status,
      qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64,
      copiaECola: data.point_of_interaction.transaction_data.qr_code
    });

  } catch (err) {
    console.error("ERRO PIX:", err);
    res.status(500).json({ error: "Erro ao criar pagamento PIX" });
  }
});

// ==============================
// PAGAMENTO PIX - STATUS
// ==============================
app.get('/api/pix/status/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json(data);
    }

    res.json({
      status: data.status,
      status_detail: data.status_detail
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar status PIX' });
  }
});

// ==============================
// PAGAMENTO CARTÃO
// ==============================
app.post('/api/cartao/pagar', async (req, res) => {
  try {
    const { token, valor, parcelas, email, cpf } = req.body;

    if (!token || !valor || !parcelas || !email || !cpf) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const payment = await mpPayment.create({
      body: {
        transaction_amount: Number(valor),
        token,
        description: 'Pagamento Matrip',
        installments: Number(parcelas),
        payment_method_id: "visa", // sandbox
        payer: {
          email,
          identification: {
            type: "CPF",
            number: cpf
          }
        }
      }
    });

    res.json({
      status: payment.status,
      id: payment.id
    });

  } catch (err) {
    console.error("ERRO CARTÃO:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// ADMIN - LISTAR GUIAS
// ==============================
app.get('/admin/guias', (req, res) => {
  const sql = `
    SELECT 
      g.id,
      u.nome,
      g.email,
      g.mei,
      g.celular
    FROM guias g
    JOIN usuarios u ON u.id = g.usuario_id
    ORDER BY u.nome
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar guias' });
    }

    res.json(results);
  });
});


// ==============================
// ADMIN - DELETAR GUIA
// ==============================
app.delete('/admin/guias/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM guias
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Guia não encontrado' });
    }

    res.json({ message: 'Guia removido com sucesso' });
  });
});


app.post('/guias', (req, res) => {
  const { usuario_id, mei, celular, email } = req.body;

  if (!usuario_id || !mei || !celular || !email) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // 1️⃣ verifica se já existe
  db.query(
    'SELECT id FROM guias WHERE usuario_id = ?',
    [usuario_id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao verificar guia' });
      }

      if (results.length > 0) {
        return res.status(409).json({
          error: 'Este usuário já está cadastrado como guia'
        });
      }

      // 2️⃣ só insere se não existir
      db.query(
        'INSERT INTO guias (usuario_id, mei, celular, email) VALUES (?, ?, ?, ?)',
        [usuario_id, mei, celular, email],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: 'Erro ao cadastrar guia' });
          }

          res.status(201).json({ message: 'Guia cadastrado com sucesso' });
        }
      );
    }
  );
});

/*app.get('/admin/guias', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        g.id,
        u.nome,
        g.email,
        g.mei,
        g.celular
      FROM guias g
      JOIN usuarios u ON u.id = g.usuario_id
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar guias' });
  }
});

app.delete('/admin/guias/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM guias WHERE id = ?', [id]);
    res.json({ message: 'Guia removido com sucesso' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover guia' });
  }
});*/

// ==============================
// ADMIN - DELETAR AGÊNCIA
// ==============================
app.delete('/agencias/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM agencias
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao excluir agência' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agência não encontrada' });
    }

    res.json({ message: 'Agência excluída com sucesso' });
  });
});

// routes/passeios.js
app.get('/api/passeios', (req, res) => {
  const { estado, cidade } = req.query;

  let sql = `
    SELECT 
      p.id,
      p.categoria,
      p.local,
      p.cidade,
      p.estado,
      p.descricao,
      p.valor_final,
      (
        SELECT caminho 
        FROM passeio_imagens 
        WHERE passeio_id = p.id 
        LIMIT 1
      ) AS imagem
    FROM passeios p
    WHERE 1=1
  `;

  const params = [];

  if (estado) {
    sql += ' AND p.estado = ?';
    params.push(estado.trim().toUpperCase());
  }

  if (cidade) {
    sql += ' AND p.cidade = ?';
    params.push(cidade.trim());
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ ERRO SQL /api/passeios:', err);
      return res.json([]); // ⚠️ SEMPRE array
    }

    res.json(rows);
  });
});


// ==============================
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
/*dd*/
