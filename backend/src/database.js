const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '35246',      // coloque sua senha se tiver
  database: 'matrip'
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL ✅');
});

module.exports = connection;
