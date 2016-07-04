var express = require('express');
var router = express.Router();

router.get('/' , function(req , res){
	res.render('commands', {title : "Gcoin" , page_title:"Command" , command_output:''});
});
router.post('/', function(req , res){
	var cmd = req.body.command_value;
	const exec = require('child_process').exec;
	const child = exec(cmd,
	  (error, stdout, stderr) => {
	    console.log('stdout: ', stdout);

	    console.log('stderr: ', stderr);
	    if (error !== null) {
	      console.log('exec error: ', error);
	      res.render('commands', {title: "Gcoin", page_title:"Command" , command_output: error});
	      res.end();
	    }
	    else{
	    	res.render('commands', {title: "Gcoin", page_title:"Command" , command_output: stdout});
		}
	});
	
});
module.exports = router;