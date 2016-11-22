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
  app.listen(port);

  if (swaggerConnect.runner.swagger.paths['/hello']) {
    console.log('listening on port: %s', port);
  }
});
