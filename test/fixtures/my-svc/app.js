'use strict';

var SwaggerConnect = require('swagger-connect');
var app = require('connect')();

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerConnect.create(config, function(err, swaggerConnect) {
  if (err) { throw err; }

  // install middleware
  swaggerConnect.register(app);

  var port = process.env.PORT || 10010;
  var svr = app.listen(port);

  process.on('message', function(m) {
      if (m != 'die') return;
      
      console.log("shutting down...")
      svr.close(function() {
          console.log("server closed")
          process.exit()
      })
  })      

  require('./api/controllers/hello_world');
  
  console.log('listening on port: %s', port);
});
