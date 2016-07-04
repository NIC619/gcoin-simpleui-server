var mongoose = require('mongoose');
var tokens = mongoose.model('tokens');
var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;

function a2hex(str) {								//transform license string into hex data
  	var arr = [];
  	for (var i = 0, l = str.length; i < l; i ++) {
    	var hex = Number(str.charCodeAt(i)).toString(16);
    	arr.push(hex.length > 1 && hex || "0" + hex);
 	}
  	return arr.join('');
}

function encodelicense(name, description, address) {

	  raw_version = '1';
	  raw_name = name;
	  raw_discrip = description;
	  raw_issuer = address;
	  raw_div = '01';
	  raw_feeType = '00';
	  //raw_feeRate = document.Encode_FORM.color_fee_rate.value;
	  raw_feeCollector = address;
	  //raw_limit = document.Encode_FORM.color_upper_limit.value;
	  raw_schedule = '00';
	  raw_memberControl = '00';
	  raw_link = 'None';
	  //raw_meta = document.Encode_FORM.color_metadata_hash.value;
	  
	  var result = '';
	  // hardcode the init value
	  result = result.concat("72")
	  // hardcode the "version"
	  result = result.concat("110100");
	  // add the length of the name
	  len = raw_name.length.toString(16);
	  if(len.length == 1)
	    result = result.concat("0" + len);
	    else if(len.length == 2)
	        result = result.concat(len);
	  // add the "Name"
	  result = result.concat(a2hex(raw_name))
	  // add the length of the description
	  len = raw_discrip.length.toString(16);
	  if(len.length == 1)
	    result = result.concat("0" + len);
	    else if(len.length == 2)
	        result = result.concat(len);
	  // add the "Discription"
	  result = result.concat(a2hex(raw_discrip));
	  // add the issuer address
	  // hardcode a " mark
	  result = result.concat(a2hex("\"" + raw_issuer));
	  // add the divisibility
	  result = result.concat(raw_div);
	  // add the fee_type
	  result = result.concat(raw_feeType);
	  // TODO: fee rate, now hardcoded
	  result = result.concat("0000000000000000000000");
	  // add the fee collector address
	  // hardcode a " mark
	  result = result.concat(a2hex("\"" + raw_feeCollector));
	  // TODO: limit, now hardcoded
	  result = result.concat("0000000000000000");
	  // add the mint schedule
	  result = result.concat(raw_schedule);
	  // TO BE CHECK: skip 6 length 
	  result = result.concat("000000")
	  // add the member control 
	  result = result.concat(raw_memberControl);
	  // add the length of the metadata link
	  len = raw_link.length.toString(16);
	  if(len.length == 1)
	    result = result.concat("0" + len);
	    else if(len.length == 2)
	        result = result.concat(len);
	  // add the metadata link 
	  result = result.concat(a2hex(raw_link));
	  // TODO: add the metadata hash, now hardcoded
	  result = result.concat("0000000000000000000000000000000000000000000000000000000000000000")

	  return result;

}



var tokenList = [];
router.get('/' , function(req , res){					//list all token
	tokenList.splice(0, tokenList.length);				//initialize tmp list
	tokens.find(function(err, tokens){
		tokens.forEach(function(token){
			tokenList.push(token);
		});
		res.render('tokenize', {title: "Gcoin", page_title:"Tokenize" , token_list:tokenList, replyMsg:''});
	});
});

router.post('/', function(req , res){					//register a token
	var cmd = 'gcoin-cli getassetinfo ' + req.body.color;
	var hex_value = encodelicense(req.body.name, req.body.description, req.body.address);
	const child = exec(cmd,
	  (error, stdout, stderr) => {
	    if (error !== null) {							//the color of user's choice hasn't been regitered
	    	cmd = "gcoin-cli sendlicensetoaddress " + req.body.address + " " + req.body.color + " " + hex_value;	//get license
	    	const child2 = exec(cmd,
			  (error, stdout, stderr) => {
			    if (error !== null) {
			      console.log('license issue error: \n', error);
			      res.render('tokenize', {title: "Gcoin", page_title:"License" , token_list:tokenList, replyMsg:'Error issueing license'});
			      res.end();
			    }
			    else{
			    	txid = stdout;
			    	console.log('license issue success');
			    	var token = new tokens();
			    	token.issuer = req.body.name;
			    	token.address = req.body.address;
			    	token.representation = req.body.representation;
			    	token.description = req.body.description;
			    	token.color = req.body.color;
			    	token.save();
			    	tokenList.push(token);
					res.render('tokenize', {title : "Gcoin" , page_title:"License" , token_list:tokenList, replyMsg:txid}); 
					res.end();
				}
			});
	    }
	    else{
	    	console.log('color already taken: ' + hex_value);
			res.render('tokenize', {title: "Gcoin", page_title:"Tokenize" , token_list:tokenList, replyMsg:'Sorry! This color has been taken'});
	    	res.end();
		}
	});
	
});

module.exports = router;