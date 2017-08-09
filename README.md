# gcoin-simpleui-server
It's a gcoin blockchain-explorere-like UI running on nodejs server.  
First you need to start gcoin server and mongodb. The port is open on 4000.  
If you want to link database from outside, rename `db_to_mongodb.js` to `db.js`. If not, rename `db_to_localhost.js` to `db.js`
  
Make sure generate is set to true by `gcoin-cli setgenerate true` and keypool is not empty by `gcoin-cli keypoolrefill`.  
For docker image containing both gcoin server and simple UI server, please refer to [repo](https://hub.docker.com/r/nic619/gcoin-simpleui-test/).
