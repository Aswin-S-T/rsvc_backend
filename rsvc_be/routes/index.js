var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use(function (req, res, next) {
  next();
});

// router.get('/get-agents/:id', userController.getAgents);
router.get('/get-agents', userController.getAgents);

router.get('/get-buyers', userController.getBuyers);

router.post('/send-message', userController.sendMessage);

router.post('/get-messages', userController.getMessages);

router.post('/notify-agents', userController.notifyAgents);

module.exports = router;
