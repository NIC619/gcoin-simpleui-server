var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
		const exec = require('child_process').exec;
		const child = exec("gcoin-cli getwalletinfo",
			(error, stdout, stderr) => {

			    var balance = JSON.parse(stdout).balance;
			    
			    if (error !== null) {
			      console.log('get wallet info error: ', error);
			      res.render('wallet' , {title: 'Gcoin' , page_title:"Walletinfo", walletinfos : 'Error getting balance' , addresslist : []});
			      res.end();
			    }
			    const child2 = exec("gcoin-cli listreceivedbyaddress",
			    	(error, stdout, stderr) => {
			    		var addressList = JSON.parse(stdout);
			    		res.render('wallet' , {title: 'Gcoin' , page_title:"Walletinfo", walletinfos : balance , addresslist : addressList});
			    	}); 
			});
});


module.exports = router;
