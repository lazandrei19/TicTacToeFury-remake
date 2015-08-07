var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
	//res.render('singleplayer'); //render asker
});

router.get('/:username', function(req, res) {
  res.render('multiplayer');
});

module.exports = router;