var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;

/*
currently hidden from user
 */

var new_address;	
var addressList = [];
router.get('/' , function(req , res){	//get the addresses
	const child = exec("gcoin-cli getaddressesbyaccount ''",
	  (error, stdout, stderr) => {
	    addressList = JSON.parse(stdout);
	    if (error !== null) {
	      console.log('get addresses by account error: ', error);
	      res.render('license', {title: "Gcoin", page_title:"License" , addresslist:[], new_address:'', licenseinfo:''});
	      res.end();
	    }
	    else{
			res.render('license', {title : "Gcoin" , page_title:"License" , addresslist:addressList, new_address:'', licenseinfo:''}); 
		}
	});
});
router.post('/', function(req , res){
	
	const child = exec('gcoin-cli getnewaddress',
	  (error, stdout, stderr) => {
	    new_address = stdout;
	    if (error !== null) {
	      console.log('get new address error: ', error);
	      res.render('license', {title: "Gcoin", page_title:"License" , addresslist:[], new_address:'', licenseinfo:''});
	      res.end();
	    }
	    else{
	    	const child2 = exec("gcoin-cli getaddressesbyaccount ''",
			  (error, stdout, stderr) => {
			    addressList = JSON.parse(stdout);
			    if (error !== null) {
			      console.log('get addresses by account error: ', error);
			      res.render('license', {title: "Gcoin", page_title:"License" , addresslist:[], new_address:new_address, licenseinfo:''});
			      res.end();
			    }
			    else{
					res.render('license', {title : "Gcoin" , page_title:"License" , addresslist:addressList, new_address:new_address, licenseinfo:''}); 
				}
			});
		}
	});
	
});


router.post('/getlicense',function(req, res){
	var cmd = 'gcoin-cli sendlicensetoaddress ' + req.body.license_address + ' ' + req.body.license_color + ' ' + req.body.license_info;
	
	const child = exec(cmd,
	  (error, stdout, stderr) => {
	    if (error !== null) {
	      console.log('send license error: ', error);
	      res.render('license', {title: "Gcoin", page_title:"License" , addresslist:[], new_address:'', licenseinfo:'Error'});
	      res.end();
	    }
	    else{
	    	res.render('license', {title: "Gcoin", page_title:"License" , addresslist:addressList, new_address:'', licenseinfo:stdout});
		}
	});
});


module.exports = router;