const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { Op } = require('sequelize');
const userService = require('../services/users');
const passport = require('passport');
const config = require('../config/config');
const bcrypt = require('bcrypt');

// Configure Passport
passport.use(
  new LocalStrategy(
    {
      usernameField: 'e-mail',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, userName, password, done) => {
      try {
        userService
          .findOne(() => [{ where: { [Op.or]: [{ UserName: userName }, { eMail: userName }] } }])
          .then(async (user) => {
            if (!user) {
              return done(null, false, {
                errors: 'username or password is invalid',
              });
            } else {
              await bcrypt.compare(password, user.HashPassword).then(async (same) => {
                if (same) {
                  return done(null, { user });
                } else {
                  return done(null, false, {
                    errors: 'username or password is invalid',
                  });
                }
              });
            }
            // return done(null, { UserName: user.UserName });
          })
          .catch((err) => {
            // log.error(err);
            return err;
          });
      } catch (error) {
        log.error(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(config.auth.facebook, async (accessToken, refreshToken, profile, done) => {
    try {
      let email = profile?.emails?.[0]?.value;
      if (email) {
        let user = await userService.findOne(() => [{ where: { [Op.or]: [{ UserName: email }, { eMail: email }] } }]);
        if (!user) {
          await userService.create({
            UserName: email,
            eMail: email,
            FirstName: profile?.name?.split(' ')[0] ?? email?.split(' ')[0],
          });
          return done(null, { UserName: email });
        }
        return done(null, { UserName: user.UserName });
      } else {
        return done('Email not recieved');
      }
    } catch (error) {
      log.error(error);
      return error;
    }
  })
);

passport.use(
  new GoogleStrategy(config.auth.google, async (token, tokenSecret, profile, done) => {
    try {
      let email = profile?.emails?.[0]?.value;
      if (email) {
        let user = await userService.findOne(() => [{ where: { [Op.or]: [{ UserName: email }, { eMail: email }] } }]);
        if (!user) {
          await userService.create({
            UserName: email,
            eMail: email,
            FirstName: profile?.name?.split(' ')[0] ?? email?.split(' ')[0],
          });
          return done(null, { UserName: email });
        }
        return done(null, { UserName: user.UserName });
      } else {
        return done('Email not recieved');
      }
    } catch (error) {
      log.error(error);
      return error;
    }
  })
);

module.exports = passport;
