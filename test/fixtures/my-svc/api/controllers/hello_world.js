'use strict';

var util = require('util');

module.exports = {
  hello: hello
};

function hello(req, res, next) {
  req.ctrl = true;

  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('Hello, %s!', name);


  next(null, hello);
}
