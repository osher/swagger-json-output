process.env.TEST_MODE = true;
var sut     = require('../').assureCorrectResponseContentType;
var request = require('mocha-ui-exports-request');
var e2e     = require('./util/e2e');

module.exports = { 
  "swagger-result~assureCorrectResponseContentType" : {
    "should be a function that names 1 arugment - ctx" : function() {
        Should(sut).be.a.Function().have.property("length", 1)
    },
    "when used with..." : "TBD"
  }
}
