// const orm = require('orm');

//   var mw = orm.express('mysql://mjdc_dev_admin:password@localhost/test_mjdc',
//   define : function (db, next){
//     var repos = db.define("repos", {
//       id: Number,
//       name: String
//     });

//     db.sync(function (err){
//       if(err) throw cb(err);
//       console.log('connection done');
//     })
//     next(repos);
//   })
// module.exports = mw;

let config = {
  host    : 'localhost',
  user    : 'mjdc_dev_admin',
  password: 'password',
  database: 'test_mjdc'
};
 
module.exports = config;