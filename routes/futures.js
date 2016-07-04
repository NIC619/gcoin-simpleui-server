var mongoose = require('mongoose');
var contracts = mongoose.model('contracts');
var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;


function randomString(length) {						//initialize random id for contract initiaciation
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

var full_contract_list = [];						//tmp list to store contracts

/*  contract status
Open
Expired
Expired and Violated
Violated
Delivered
Expired
*/
//fiat coin is set to be 3333

router.get('/' , function(req , res){
	var date = Date.now()+60*60*8*1000;				//add 8 hours to UTC Time to match time zone in TW
	var closed_contract_list = [];
	//contracts.find().remove().exec();return;		//clear data base
	full_contract_list.splice(0, full_contract_list.length);	//initialize tmp list
	contracts.find(function(err, contracts){
		contracts.forEach(function(contract){		//first traverse over all contracts for status update
			if((contract.status!=='Expired and Violated')&&(contract.status!=='Delivered')&&(contract.status!=='Expired')){
				if((contract.date+contract.strike*1000)<date){
					if(contract.status=='Open'){
						contract.status = 'Expired';
						contract.save();
						closed_contract_list.push(contract);	//if contract is either Expired, Violated or delivered, put it into closed contract list
					}
				
					else{
						contract.status = 'Expired and Violated';
						contract.save();
						closed_contract_list.push(contract);	//if contract is either Expired, Violated or delivered, put it into closed contract list
					}
				}
				else{
					full_contract_list.push(contract);
				}
			}
			else
				closed_contract_list.push(contract);	//if contract is either Expired, Violated or delivered, put it into closed contract list
		});
		res.render('futures', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:full_contract_list.reverse(), closed_contract_list:closed_contract_list , replyMsg:''});
	});
	
});

router.post('/sellgoods', function(req , res){			//contruct a sell goods contract
	var contract = new contracts();
	contract.buyer = '';
	contract.seller = req.body.seller;
	contract.goods = req.body.goods;
	contract.goods_token = req.body.goods_token;
	contract.quantity = req.body.quantity;
	contract.price = req.body.price;
	contract.strike = req.body.strike;
	contract.status = 'Open';
	contract.id = randomString(15);
	contract.date = Date.now()+60*60*8*1000;
	contract.save();

	res.redirect('/futures');
	res.end();
});
router.post('/buygoods', function(req , res){
	var contract = new contracts();
	contract.seller = '';
	contract.buyer = req.body.buyer;
	contract.goods = req.body.goods;
	contract.goods_token = req.body.goods_token;
	contract.quantity = req.body.quantity;
	contract.price = req.body.price;
	contract.strike = req.body.strike;
	contract.status = 'Open';
	contract.id = randomString(15);
	contract.date = Date.now()+60*60*8*1000;
	contract.save();

	res.redirect('/futures');
	res.end();
});

router.post('/apply',function(req, res){				//query for certain contract with contract id
	var contract_list = [];
	contracts.find(function(err, contracts){
		contracts.forEach(function(contract){
			if(contract.id==req.query.id){
				contract_list.push(contract);
				res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:''});
				res.end();
				return;
			}
		});
		
	});
});
router.post('/update',function(req, res){				//update certain contract
	var contract_list = [];
	contracts.find(function(err, contracts){
		contracts.forEach(function(contract){
			if(contract.id==req.query.id){				//search for specified contract id
				contract_list.push(contract);
				switch(req.query.stage) {
					case '0': 							//stage 0 : open for sell
						//console.log('stage open');
						if(req.body.address == contract.seller){
							res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'You can\'t buy from yourself!'});
						    res.end();
						    return;
						}
						var cmd = 'gcoin-cli sendtoaddress ' + req.body.address + ' 1 2';	//contract build, send coin 2 to represent contract proof
						const child = exec(cmd,
						  (error, stdout, stderr) => {
						    if (error !== null) {
						      console.log('send coin 2 error: ', error);
						      res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Error sending contract proof'});
						      res.end();
						    }
						    else{						//updating the contract
						    	contract.buyer = req.body.address;
								contract.status = 'Negotiating';
								contract.id = stdout.replace(/[\n\r]/g, '');	//replace contract id with transaction hash
								contract.save();
								contract_list.push(contract);
								res.redirect('/futures');
								res.end();
							}
						});
						break;
					case '1': 							//stage 1 : open for buy
						if(req.body.address == contract.buyer){
							res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'You can\'t buy from yourself!'});
						    res.end();
						    return;
						}
						var cmd = 'gcoin-cli sendtoaddress ' + req.body.address + ' 1 2';	//contract build, send coin 2 to represent contract proof
						const child2 = exec(cmd,
						  (error, stdout, stderr) => {
						    if (error !== null) {
						      console.log('send coin 2 error: ', error);
						      res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Error'});
						      res.end();
						    }
						    else{
						    	contract.seller = req.body.address;
								contract.status = 'Negotiating';
								contract.id = stdout.replace(/[\n\r]/g, '');	//replace contract id with transaction hash
								contract.save();
								res.redirect('/futures');
								res.end();
							}
						});
						break;
					case '2': 							//stage 2 : negotiating
						for (i in full_contract_list){
							if(full_contract_list[i].payment_id == req.body.txid){
								console.log('Double spending!');
								res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Do not try Double Spening!'});
								res.end();
								return;
							}
						}
						var cmd = 'gcoin-cli getrawtransaction ' + req.body.txid + ' 1';	//get the transaction detail with tx hash to verify
						const child3 = exec(cmd,
						  (error, stdout, stderr) => {
						    if (error !== null) {
						      console.log('get raw tx error: ', error);
						      res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Error retriving raw transaction'});
						      res.end();
						    }
						    else{
						    	var vout = JSON.parse(stdout).vout;
						    	vout.forEach(function(tx){			//traverse trough each tx output
						    		if(tx.scriptPubKey.addresses){
						    			//console.log('address:' + tx.scriptPubKey.addresses + ',' + contract.seller);
						    			//console.log('color:' + tx.color);
						    			//console.log('amount:' + tx.value/100000000 + ',' + contract.price);
						    			if((tx.scriptPubKey.addresses==contract.seller)&&(tx.color==3333)&&(tx.value/100000000==contract.price)){
						    				contract.payment_id = req.body.txid;
						    				contract.status = 'Paid';
						    				contract.save();
						    				res.redirect('/futures');
						    				res.end();

						    			}
						    		}
						    	});
						    	res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Can not verify!' });
							}
						});
						break;
					case '3': 							//stage 3 : paid
						for (i in full_contract_list){
							if(full_contract_list[i].delivery_id == req.body.txid){
								console.log('Double spending!');
								res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Do not try Double Spening!'});
								res.end();
								return;
							}
						}
						
						var cmd = 'gcoin-cli getrawtransaction ' + req.body.txid + ' 1';	//get the transaction detail with tx hash to verify
						const child4 = exec(cmd,
						  (error, stdout, stderr) => {
						    if (error !== null) {
						      console.log('get raw tx error: ', error);
						      res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Error retriving raw transaction'});
						      res.end();
						    }
						    else{
						    	var vout = JSON.parse(stdout).vout;
						    	vout.forEach(function(tx){	//traverse trough each tx output
						    		if(tx.scriptPubKey.addresses){
						    			//console.log('address:' + tx.scriptPubKey.addresses + ',' + contract.buyer);
						    			//console.log('color:' + tx.color + ',' + contract.goods_token);
						    			//console.log('amount:' + tx.value/100000000 + ',' + contract.quantity);
						    			if((tx.scriptPubKey.addresses==contract.buyer)&&(tx.color==contract.goods_token)&&(tx.value/100000000==contract.quantity)){
						    				contract.delivery_id = req.body.txid;
						    				contract.status = 'Delivered';
						    				contract.save();
						    				res.redirect('/futures');
						    				res.end();
						    			}
						    		}
						    	});
						    	res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Can not verify!' });
							}
						});
						break;
					default:
						res.render('futures_contract', {title: "Gcoin", page_title:"FuturesTrade" , contract_list:contract_list, replyMsg:'Stage Wrong' });			
				}
			}
		});
	});
});

module.exports = router;