//var mongoose = require('mongoose');
//var blockinfos = mongoose.model('blockinfo');
var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;
/* GET home page. */
router.get('/', function(req, res, next) {
	
	const child = exec('gcoin-cli getblockchaininfo',
			(error, stdout, stderr) => {
				console.log(stdout);
			    var blockHeight = JSON.parse(stdout).blocks;
			    if (error !== null) {
			      console.log('get blockchain info error: ', error);
			      res.render('blockinfo_view', {title: "Gcoin", page_title: 'Home', blockHeight:'Error retriving blockchain info'});
			      res.end();
			    }
			    res.render('index', { title: 'Gcoin' , page_title: 'Home', blockHeight:blockHeight});
			});
});

module.exports = router;
