var mongoose = require('mongoose');
var blockinfos = mongoose.model('blockinfo');
var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;

var blockHashList = [];									//tmp list to store the not-updated blocks
var blockHeight, blockinfosHeight;



var updateBlockchain = function(){
	console.log(blockHashList.length);
	for (var i in blockHashList){
		var cmd = 'gcoin-cli getblock ' + blockHashList[i];
		const ch = exec(cmd,
			(error, stdout, stderr) => {
				var parsed = JSON.parse(stdout);
				var blockinfo = new blockinfos();
				blockinfo.hash = parsed.hash;
				blockinfo.confirmations = parsed.confirmations;
				blockinfo.height = parsed.height;
				blockinfo.difficulty = parsed.difficulty;
				blockinfo.previous_block_hash = parsed.previousblockhash;
				blockinfo.tx = parsed.tx;
				blockinfo.save();
			});
	}
};
var updateBlockHash = function(){
	//console.log(blockinfosHeight,blockHeight);
	blockHashList.splice(0, blockHashList.length);	//initialize the tmp list
	if(blockinfosHeight>=blockHeight){
		return;
	}
	for(var i = blockinfosHeight+1; i <= blockHeight; i++){
		var cmd = 'gcoin-cli getblockhash ' + i;
		const ch = exec(cmd,
			(error, stdout, stderr) => {
				blockHashList.push(stdout);
			});
	}

};

/* GET home page. */
router.get('/', function(req, res) {				//list all the blocks information
	//blockinfos.find().remove().exec();return;   	//clear database
	blockinfos.find(function(err , blockinfos){     //get data in database
		blockinfosHeight = blockinfos.length;		//get amount of blocks in database
		//console.log(blockinfosHeight);
		
		const child = exec('gcoin-cli getblockchaininfo',
			(error, stdout, stderr) => {
			    blockHeight = JSON.parse(stdout).blocks;	//get the block height of blockchain
			    //console.log(blockHeight);
			    if (error !== null) {
			      console.log('getblockchaininfo error: ', error);
			      res.render('blockinfo_view', {title: 'Gcoin' , blockinfos : blockinfos.reverse() , msg : 'Error updating the latest blockchain'});
			      //res.end();
			    }
			    updateBlockHash(function(){					//get latest block's hash in blockchain
					updateBlockchain(function(){			//get the new blocks that's not written into database
						console.log('update database blockchain_info complete');
					});
				});	
			});
  		res.render('blockinfo_view' , { title: 'Gcoin' , blockinfos : blockinfos.reverse() , msg : ''});

	});
	
});

router.post('/query' , function(req , res){			//query for certain block with specified key & value
	console.log('query for: ' + req.body.query_type + ', with value: ' + req.body.query_value);

	blockinfos.find().where( req.body.query_type.toLowerCase() , req.body.query_value).exec(function(err , filt_blockinfos){
		//console.log(filt_contracts);
  		res.render('blockinfo_query_view' , { title: 'Gcoin' , blockinfos : filt_blockinfos.reverse(), msg:''});
	});
	
});

module.exports = router;
