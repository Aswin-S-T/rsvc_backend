const jwt = require('jsonwebtoken');
const config = require('../config/config');
const passport = require('../services/auth');
const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(config.auth.google.clientID);
const rolesService = require('../services/roles');
const userService = require('../services/users');
const { generateRandom } = require('../utils/utils');
const min = process.env.MIN_START || 1;
const max = process.env.MAX_START || 1000;

/**
 * Function to authenticate if the user login is valid or not
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.localLogin = (req, res, next) => {
  passport.authenticate('local', async (err, passportUser, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    let token, message;
    if (passportUser) {
      token = jwt.sign({ data: passportUser }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
      });
    } else {
      message = 'The username or password you have entered is invalid.';
      res.status(HTTP_FORBIDDEN).json({ message });
      return;
    }
    if (token) {
      res.cookie('token', token);
      res.cookie('userName', passportUser.UserName);
      res.cookie('eMail', passportUser.eMail);
      res.status(HTTP_OK).json({
        message: 'Login successfull',
        data: passportUser,
      });
    } else {
      res.status(HTTP_FORBIDDEN).json({ message });
    }
  })(req, res, next);
};

/**
 * Function to authenticate if the user login is valid or not
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.googleLogin = (req, res, next) => {
  passport.authenticate('google', (err, passportUser, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    let token, message;
    if (passportUser) {
      token = jwt.sign({ data: passportUser }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
      });
    } else {
      message = 'The username or password you have entered is invalid.';
      res.status(HTTP_FORBIDDEN).json({ message });
      return;
    }
    if (token) {
      res.cookie('token', token);
      res.cookie('userName', passportUser.UserName);
      res.cookie('eMail', passportUser.eMail);
      res.status(HTTP_OK).json({
        message: 'Login successfull',
        data: passportUser,
      });
    } else {
      res.status(HTTP_FORBIDDEN).json({ message });
    }
  })(req, res, next);
};

/**
 * Function to authenticate if the user login is valid or not
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.facebookLogin = (req, res, next) => {
  passport.authenticate('google', (err, passportUser, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    let token, message;
    if (passportUser) {
      token = jwt.sign({ data: passportUser }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
      });
    } else {
      message = 'The username or password you have entered is invalid.';
      res.status(HTTP_FORBIDDEN).json({ message });
      return;
    }
    if (token) {
      res.cookie('token', token);
      res.cookie('userName', passportUser.UserName);
      res.cookie('eMail', passportUser.eMail);
      res.status(HTTP_OK).json({
        message: 'Login successfull',
        data: passportUser,
      });
    } else {
      res.status(HTTP_FORBIDDEN).json({ message });
    }
  })(req, res, next);
};

exports.googleSignin = async (req, res, next) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  const { name, given_name, family_name, email, picture } = ticket.getPayload();

  let role = await rolesService.findOne(() => [{ where: { RoleName: 'buyer' } }]);

  let userData = {
    UserName: name,
    password: name + generateRandom(min, max),
    FirstName: given_name,
    LastName: family_name,
    Role: 'buyer',
    eMail: email,
    PhoneNumber: '',
    PreferredContactMethod: 'Whatsapp',
    SignUpMethod: 'Google',
    ProfilePic: picture,
  };

  let user = await userService.findOne(() => [{ where: { eMail: email } }]);

  if (user) {
    res.status(HTTP_OK).json({
      message: 'Login successfull',
      data: user,
    });
  } else {
    await userService
      .create({
        ...userData,
        Role: role?.RoleID ? role?.RoleID : '1234',
        HashPassword: userData.password ? userData.password : '',
      })
      .then((result) => {
        if (result) {
          res.status(HTTP_OK).json({
            message: 'Login successfull',
            data: result,
          });
        } else {
          console.log('Error in signin');
        }
      });
  }
};
