const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: 'rsvc_2023_development_@_deltasoft',
    expiry: '24h',
  },
  auth: {
    facebook: {
      clientID: '986008663911-stfbfo4nqaea83dd5n7khgllpke05okf.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/auth/facebook/redirect',
      scope: 'email',
      profileFields: ['emails', 'name'],
    },
    google: {
      clientID: process.env.GOOGLE_CLIENTID || '986008663911-stfbfo4nqaea83dd5n7khgllpke05okf.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_SECRET || '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',
      // callbackURL: "http://localhost:3000/api/auth/google/redirect",
      callbackURL: 'https://654357d99f92cb2dc521c107--fanciful-pasca-c9a092.netlify.app/api/auth/google/redirect',
      scope: ['profile', 'email'],
      profileFields: ['emails', 'name'],
    },
  },
  imageBaseUrl: '/images/uploads',
};
