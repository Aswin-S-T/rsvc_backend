var express = require('express');
const { addAgentsManually } = require('../services/freshInstallation');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/add-agents', async (req, res) => {
  addAgentsManually(req.body);
});

router.post('/all-agents',async(req,res)=>{})

module.exports = router;
