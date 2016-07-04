var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;

var new_address;
var addressList = [];
router.get('/' , function(req , res){			//list addresses
	const child = exec("gcoin-cli getaddressesbyaccount ''",
	  (error, stdout, stderr) => {
	    addressList = JSON.parse(stdout);
	    if (error !== null) {
	      console.log('get addresses by account error: ', error);
	      res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:[], new_address:'', replyMsg:'Error getting addresses'});
	      res.end();
	    }
	    else{
			res.render('tx', {title : "Gcoin" , page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:''}); 
		}
	});
});
router.post('/', function(req , res){
	
	const child = exec('gcoin-cli getnewaddress',
	  (error, stdout, stderr) => {
	    new_address = stdout;
	    if (error !== null) {
	      console.log('get new address error: ', error);
	      res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:'', new_address:'', replyMsg:'Error getting new address'});
	      res.end();
	    }
	    else{
	    	const child2 = exec("gcoin-cli getaddressesbyaccount ''",
			  (error, stdout, stderr) => {
			    addressList = JSON.parse(stdout);
			    if (error !== null) {
			      console.log('get addresses by account error: ', error);
			      res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:[], new_address:new_address, replyMsg:'Error getting addresses'});
			      res.end();
			    }
			    else{
					res.render('tx', {title : "Gcoin" , page_title:"Transaction" , addresslist:addressList, new_address:new_address, replyMsg:''}); 
				}
			});
		}
	});
	
});


router.get('/query' , function(req , res){					//query using query method
	if(req.query.hash){
		var cmd = 'gcoin-cli getrawtransaction ' + req.query.hash + ' 1';
		
		const child = exec(cmd,
		  (error, stdout, stderr) => {
		    if (error !== null) {
		      console.log('get raw tx error: ', error);
		      res.render('tx_query_view', {title: "Gcoin", page_title:"Transaction" , tx_query_result: 'Error retriving specified transaction'});
		      res.end();
		    }
		    else{
		    	res.render('tx_query_view', {title: "Gcoin", page_title:"Transaction" , tx_query_result: JSON.parse(stdout)});
			}
		});
	}
	else
		res.render('tx_query_view', {title : "Gcoin" , page_title:"Transaction" , tx_query_result:'No transaction hash input'});
});
router.post('/query', function(req , res){					//query using form
	var cmd = 'gcoin-cli getrawtransaction ' + req.body.query_value + ' 1';
	
	const child = exec(cmd,
	  (error, stdout, stderr) => {
	    if (error !== null) {
	      console.log('get raw tx error: ', error);
	      res.render('tx_query_view', {title: "Gcoin", page_title:"Transaction" , tx_query_result: 'Error retriving specified transaction'});
	      res.end();
	    }
	    else{
	    	res.render('tx_query_view', {title: "Gcoin", page_title:"Transaction" , tx_query_result: JSON.parse(stdout)});
		}
	});
	
});

router.post('/getfee',function(req, res){					//getting color 1 coin as tx fee
	var cmd = 'gcoin-cli sendtoaddress ' + req.body.feeaddress + ' 1 1';
	
	const child = exec(cmd,
	  (error, stdout, stderr) => {
	    if (error !== null) {
	      console.log('get color 1 coin error: ', error);
	      res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:'Error sending transaction fee'});
	      res.end();
	    }
	    else{
	    	res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:'Fee Transfer Complete'});
		}
	});
});
router.post('/conduct',function(req, res){					//conduct a transaction
	var cmd = "gcoin-cli getwalletinfo";
	const child = exec(cmd,									//first check if there's enough fee
		(error, stdout, stderr) => {
			var balance = JSON.parse(stdout).balance;
			for(color in balance){
				if((color==1)&&(balance[color]>0)){			//has fee
					cmd = 'gcoin-cli sendtoaddress ' + req.body.txaddress + ' ' + req.body.amount + ' ' + req.body.color;	//make the transaction
					const child2 = exec(cmd,
					  (error, stdout, stderr) => {
					    if (error !== null) {
					      console.log('conduct tx error: ', error);
					      res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:'Error conducting the transaction'});
					      res.end();
					    }
					    else{
					    	res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:'Transaction complete with ID: '+stdout});
						}
					});
				break;
				}
			}
	});
});
router.post('/mint',function(req, res){						//mint coins, if you have license
	var cmd = 'gcoin-cli mint ' + req.body.amount + ' ' + req.body.color;
	
	const child = exec(cmd,
	  (error, stdout, stderr) => {
	    if (error !== null) {
	      console.log('mint error: ', error);
	      res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:'Error minting'});
	      res.end();
	    }
	    else{
	    	res.render('tx', {title: "Gcoin", page_title:"Transaction" , addresslist:addressList, new_address:'', replyMsg:'Successfully Mint!'});
		}
	});
});

module.exports = router;