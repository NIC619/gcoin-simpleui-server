# gcoin-simpleui-server
It's a gcoin blockchain-explorere-like UI running on nodejs server.  
First you need to start gcoin server and mongodb. The port is open on 4000.  
If you want to link database from outside, modify `mongoose.connect('mongodb://localhost/blockchain_database');` in `db.js`  
to `mongoose.connect('mongodb://'+ process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT +'/blockchain_database');`  
  
Make sure generate is set to true by `gcoin-cli setgenerate true` and keypool is not empty by `gcoin-cli keypoolrefill`.  
For docker image containing both gcoin server and simple UI server, please refer to [repo](https://hub.docker.com/r/nic619/gcoin-simpleui-test/).
