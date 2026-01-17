const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const nome = profile.displayName;
        const googleId = profile.id;

        const sqlBusca = 'SELECT * FROM usuarios WHERE email = ?';

        db.query(sqlBusca, [email], (err, results) => {
          if (err) return done(err);

          // usuário não existe → cria
          if (results.length === 0) {
            const sqlInsert = `
              INSERT INTO usuarios (nome, email, provider, provider_id, tipo)
              VALUES (?, ?, 'google', ?, 'usuario')
            `;

            db.query(sqlInsert, [nome, email, googleId], (err2, result) => {
              if (err2) return done(err2);

              return done(null, {
                id: result.insertId,
                nome,
                email,
                tipo: 'usuario'
              });
            });

          } else {
            const usuario = results[0];

            // se não tiver provider ainda, associa
            if (!usuario.provider) {
              db.query(
                'UPDATE usuarios SET provider = "google", provider_id = ? WHERE id = ?',
                [googleId, usuario.id]
              );
            }

            return done(null, {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              tipo: usuario.tipo
            });
          }
        });

      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
