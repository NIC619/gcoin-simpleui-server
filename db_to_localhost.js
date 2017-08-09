var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user_profile = new Schema({
		user_name : String,
		password  : String,
		email 	  : String
});

var blockinfo = new Schema({
		hash: String,
		confirmations: Number,
		height:Number,
		difficulty:Number,
		previous_block_hash:String,
		tx:[{type: String}]
});

var contracts = new Schema({
		seller:String,
		buyer: String,
		goods: String,
		goods_token: Number,
		quantity: Number,
		price: Number,
		status: String,
		strike: Number,
		id: String,
		payment_id: String,
		delivery_id: String,
		date: Number
});

var tokens = new Schema({
		issuer:String,
		address:String,
		representation:String,
		description:String,
		color:Number
});

mongoose.model('tokens',tokens);
mongoose.model('contracts',contracts);
mongoose.model('user_profile' , user_profile);
mongoose.model('blockinfo' , blockinfo);
mongoose.connect('mongodb://localhost/blockchain_database');