process.env.TEST_MODE = true;
var sut     = require('../').beautifyJsonContents;
var request = require('mocha-ui-exports-request');
var e2e     = require('./util/e2e');

module.exports = { 
  "swagger-result~beautifyJsonContents" : {
    "should be a function that names 2 arugment - ctx, fittingDef" : function() {
        Should(sut).be.a.Function().have.property("length", 2)
    },
    "when used with..." : "TBD"
  }
}
