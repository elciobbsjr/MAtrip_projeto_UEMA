const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('./database');

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails']
},
(profileToken, refreshToken, profile, done) => {

  const facebookId = profile.id;
  const nome = profile.displayName;
  const email = profile.emails?.[0]?.value || null;

  // procura usuário pelo facebook_id
  db.query(
    'SELECT * FROM usuarios WHERE facebook_id = ?',
    [facebookId],
    (err, results) => {
      if (err) return done(err);

      if (results.length > 0) {
        return done(null, results[0]);
      }

      // cria novo usuário
      db.query(
        `
        INSERT INTO usuarios (nome, email, facebook_id, tipo)
        VALUES (?, ?, ?, 'usuario')
        `,
        [nome, email, facebookId],
        (err2, result) => {
          if (err2) return done(err2);

          const novoUsuario = {
            id: result.insertId,
            nome,
            email,
            tipo: 'usuario'
          };

          return done(null, novoUsuario);
        }
      );
    }
  );
}));

module.exports = passport;
