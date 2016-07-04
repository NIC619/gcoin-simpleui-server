var mongoose = require('mongoose');
var blockinfos = mongoose.model('blockinfo');
var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;

var latestBlock;									//store the latest block, for tracing back to the genesis block
var blockList = [];									//tmp list to store blocks for response

var updateBlockchain = function(cmd, res, updateBlockchain){
			exec(cmd,
			(error, stdout, stderr) => {
				var parsed = JSON.parse(stdout);
				if(parsed.height==0){				//no any block
					res.render('blockinfo_view' , {title: 'Gcoin' ,page_title: "Blockinfo" ,blockinfos : blockList, msg:''});
					res.end();
					return;
				}
				else if (parsed.height==1){			//only one block
					res.render('blockinfo_view' , {title: 'Gcoin' ,page_title: "Blockinfo" ,blockinfos : blockList, msg:''});
					res.end();
					return;
				}
				else{								//push current block into list,recursively
					blockList.push(parsed);
					var cmds = 'gcoin-cli getblock ' + parsed.previousblockhash;
					updateBlockchain(cmds, res, updateBlockchain);
				}
			});
}


/* GET home page. */
router.get('/', function(req, res) {				//list all the blocks information 
		blockList.splice(0, blockList.length);		//initialize the tmp list
		
		const child = exec('gcoin-cli getblockchaininfo',
			(error, stdout, stderr) => {

			    latestBlock = JSON.parse(stdout).bestblockhash;
			    if (error !== null) {
			      	console.log('exec error: ', error);
			      	res.render('blockinfo_view' , {title: 'Gcoin' ,page_title: "Blockinfo" ,blockinfos : [], msg: 'Error updating the blockchain'});
					res.end();
			      //res.render('blockinfo_view', {title: "Gcoin", logged : req.session.logined , msg : '' , blockinfos: 'Error Reading Blockchain!'});
			      //res.end();
			    }
			    var cmd = 'gcoin-cli getblock ' + latestBlock;
			    updateBlockchain(cmd,res,updateBlockchain);
			    
			});
});

router.get('/query' , function(req , res){			//query for cetain block with block hash
	if(req.query.hash){
		console.log(req.query.hash);
		var cmd = 'gcoin-cli getblock ' + req.query.hash;
		var queryList = []
		const child = exec(cmd,
		  (error, stdout, stderr) => {
		    console.log('stdout: ', stdout);

		    console.log('stderr: ', stderr);
		    if (error !== null) {
		      console.log('exec error: ', error);
		      res.render('blockinfo_query_view', {title: "Gcoin", page_title:"Blockinfo", blockinfos: [], msg:'Error retriving blocks'});
		      res.end();
		    }
		    else{
		    	queryList.push(JSON.parse(stdout));
		    	res.render('blockinfo_query_view', {title: "Gcoin", page_title:"Blockinfo", blockinfos: queryList});
			}
		});
	}
	else
		res.render('blockinfo_query_view', {title : "Gcoin" , page_title: "Blockinfo", blockinfos:[], msg:'No block hash specified'});
});

router.post('/query' , function(req , res){			//query for cetain block with specific key & value
	console.log(req.body.query_type);
	console.log(req.body.query_value);
	//if(req.body.query_value)
	var queryList = [];
	blockList.forEach(function(block){
		switch(req.body.query_type){
			case 'Hash':
				if(block.hash == req.body.query_value)
					queryList.push(block);
				break;
			case 'Height':
				if(block.height == req.body.query_value)
					queryList.push(block);
				break;
			case 'Confirmations':
				if(block.confirmations == req.body.query_value)
					queryList.push(block);
				break;
			case 'Difficulty':
				if(block.difficulty == req.body.query_value)
					queryList.push(block);
				break;
			case 'Previous Block Hash':
				if(block.previousblockhash == req.body.query_value)
					queryList.push(block);
				break;
			default:
				break;
		}
	});

  	res.render('blockinfo_query_view' , { title: 'Gcoin' , page_title:"Blockinfo" , blockinfos : queryList , msg:''});
	queryList.splice(0, queryList.length);
	
});

module.exports = router;
