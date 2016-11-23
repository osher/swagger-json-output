process.env.TEST_MODE = true;
var util    = require('util');
var sut     = require('../');
var request = require('mocha-ui-exports-request');
var e2e     = require('./util/e2e');
var SUT     = process.env.SUT || "http://localhost:10010"

module.exports = { 
  "swagger-json-output - end to end" : {
    beforeAll: e2e({
      svc:          "test/fixtures/my-svc/app.js",
      logPath:      "./e2e-log.log"
    }),
    afterAll: e2e.tearDown,
    "used as only onError pipe" : {
      "when pipe ends with no error" : runnerDefaultOutputSuite({path: "/set_only_on_error"}),
      "when pipe ends with error" : onErrorPipeSuite({path: "/set_only_on_error"})
    },
    "used as only last-fitting on main pipe" : {
      "when pipe ends with no error" : lastFittingOutputSuite({path: "/set_only_as_last_fitting" }),
      "when pipe ends with error" : runnerDefaultErrorSuite({path: "/set_only_as_last_fitting" })
    },
    "used as both onError AND last fitting" : {
      "when pipe ends with no error" : lastFittingOutputSuite({path: "/set_on_both" }),
      "when pipe ends with error" : onErrorPipeSuite({path: "/set_on_both"})
    }
  }
};

function runnerDefaultOutputSuite(options) {
    var expectBody;
    return {
      "and output serializes well" : {
        beforeAll: function(done) {
            rndFactor = Math.random();
            e2e.setupFixture({
              statusCode:   201,
              headers:      { 'content-type' : 'text/x-inspect' },
              body:         expectBody = { foo : "bar", rnd: Math.random() },
              circularBody: false,
              error:        false,
              circularErr:  false
            }, done)
        },
        "then" : request({
          url : SUT + options.path,
          qs: { name: "scott" },
          json: true
        }).responds({
          status:   201,
          responseHeaders:  { 
            "should not have 'content-type' overriden" : function(headers) {
                Should(headers).have.property('content-type', 'text/x-inspect')
            }
          },
          responseBody:     {
            "should not be valid JSON": function(body) { 
                Should( function() { JSON.parse(body) } ).throw()
             },
            "should be .inspect of what was delivered by controller" : function(body) {
                Should(body).eql(util.inspect(expectBody))
            }
          }
        })
      },
      "and output does not serialize well" : {
        beforeAll: function(done) {
            rndFactor = Math.random();
            e2e.setupFixture({
              statusCode:   201,
              headers:      { 'content-type' : 'text/x-inspect' },
              body:         expectBody = { foo : "bar", rnd: Math.random() },
              //------------------------------------------------------------------------------------
              circularBody: true, // <--- instructs test server to create circular reference in body
              //------------------------------------------------------------------------------------
              error:        false,
              circularErr:  false
            }, done)
        },
        "then" : request({
          url : SUT + options.path,
          qs: { name: "scott" },
          json: true
        }).responds({
          responseHeaders:  { 
            "should not have 'content-type' overriden" : function(headers) {
                Should(headers).have.property('content-type', 'text/x-inspect')
            }
          },
          responseBody: {
            "should not be valid JSON": function(body) { 
                Should( function() { JSON.parse(body) } ).throw()
             },
            "should be .inspect of what was delivered by controller" : function(body) {
                expectBody.circ = expectBody;
                Should(body).eql(util.inspect(expectBody))
            }
          },
          and: {
            "statusCode should stay untouched" : function(res) { 
              Should(res.statusCode).eql(201);
            }
          }
        })
      }
    }
}

function runnerDefaultErrorSuite(options) {
    return {
        "and error validation" : {
            "then" : request({
                url : SUT + options.path,
                qs: { na: "scott" },
                json: true
            }).responds({
                responseHeaders:  {
                    "should correct 'content-type' to 'application/json'" : function(headers) {
                        Should(headers).have.property('content-type', 'application/json');
                    }
                },
                and: {
                    "statusCode should be as passed with the error" : function(res) {
                        Should(res).have.property("statusCode", 400);
                    }
                },
                responseBody: {
                    "should be valid JSON" : function(body) {
                        console.log(body);
                        Should(body).be.an.Object();
                    },
                    "should have .message as the passed error's message": function(body) {
                        Should(body.message).eql("Validation errors");
                    },
                    "should have .errors": function(body) {
                        Should(body.errors).be.an.Object();
                    },
                    "should have .errors.code": function(body) {
                        Should(body.errors[0].code).eql("INVALID_REQUEST_PARAMETER");
                    }
                }
            })
        },
        "and error serializes well" : {
            beforeAll: function(done){
                rndFactor = Math.random();
                e2e.setupFixture({
                    statusCode:   201,
                    headers:      { 'content-type' : 'text/x-inspect' },
                    body:         expectBody = { foo : "bar", rnd: Math.random() },
                    circularBody: false,
                    error:        { message: "oupsy", statusCode: 505, data: "debugme"},
                    circularErr:  false
                }, done)

            },
            "then" : request({
                url : SUT + options.path,
                qs: { name: "scott" },
                json: true
            }).responds({
                responseHeaders:  {
                    "should correct 'content-type' to 'application/json'" : function(headers) {
                        Should(headers).have.property('content-type', 'application/json');
                    }
                },
                and: {
                    "statusCode should be as passed with the error" : function(res) {
                        Should(res).have.property("statusCode", 505)
                    }
                },
                responseBody: {
                    "should be valid JSON" : function(body) {
                        Should(body).be.an.Object()
                    },
                    "should have .message as the passed error's message": function(body) {
                        Should(body.message).eql("oupsy")
                    },
                    "should have .data": function(body) {
                        Should(body.data).eql("debugme")
                    }
                }
            })
        },
        "and error does not serializes well" : {
            beforeAll: function(done){
                rndFactor = Math.random();
                e2e.setupFixture({
                    statusCode:   201,
                    headers:      { 'content-type' : 'text/x-inspect' },
                    body:         expectBody = { foo : "bar", rnd: Math.random() },
                    circularBody: false,
                    error:        { message: "oupsy", statusCode: 505, data: "debugme"},
                    circularErr:  true
                }, done)

            },
            "then" : request({
                url : SUT + options.path,
                qs: { name: "scott" },
                json: true
            }).responds({
                responseHeaders:  {
                    "should correct 'content-type' to 'application/json'" : function(headers) {
                        Should(headers).have.property('content-type', 'application/json');
                    }
                },
                and: {
                    "statusCode should be 500 (for the serialization error)" : function(res) {
                        Should(res).have.property("statusCode", 500);
                    }
                },
                responseBody: {
                    "should be valid JSON" : function(body) {
                        Should(body).be.an.Object();
                    },
                    "should have .stringifyErr - as the message of the stringification error" : function(body) {
                        Should(body).have.property('stringifyErr', 'Converting circular structure to JSON');
                    }
                }
            })
        }

    }
}

function onErrorPipeSuite(options) {
    var expectBody;
    return {
      "and error serializes well" : {
        beforeAll: function(done) {
            rndFactor = Math.random();
            e2e.setupFixture({
              statusCode:   201,
              headers:      { 'content-type' : 'text/x-inspect' },
              body:         expectBody = { foo : "bar", rnd: Math.random() },
              circularBody: false,
              error:        { message: "oupsy", statusCode : 505, foo: "bar" },
              circularErr:  false
            }, done)
        },
        "then" : request({
          url : SUT + options.path,
          qs: { name: "scott" },
          json: true
        }).responds({
            responseHeaders:  { 
              "should correct 'content-type' to 'application/json'" : function(headers) {
                  Should(headers).have.property('content-type', 'application/json');
              }
            },
            and: { 
              "statusCode should be as passed with the error" : function(res) { 
                  Should(res).have.property("statusCode", 505)
              }
            },
            responseBody: {
              "should be valid JSON" : function(body) {
                  Should(body).be.an.Object()
              }, 
              "should have .message as the passed error's message": function(body) {
                  Should(body.message).eql("oupsy")
              },
              "should have .stack as array of lines in the stack message" : function(body) {
                  Should(body.stack).be.an.Array();
                  Should(body.stack[0]).eql("Error: oupsy");
              },
              "should have additional attributes decorating the error" : function(body) {
                  Should(body).containEql( { foo: "bar" } )
              }, 
              "should not repeat .statusCode" : function(body) {
                  Should(body).not.have.property("statusCode")
              }
            }
        })
      },
      "and error does not serialize well" : {
        beforeAll: function(done) {
            rndFactor = Math.random();
            e2e.setupFixture({
              statusCode:   201,
              headers:      { 'content-type' : 'text/x-inspect' },
              body:         expectBody = { foo : "bar", rnd: Math.random() },
              circularBody: false,
              error:        { message: "oupsy", statusCode : 505 },
              circularErr:  true
            }, done)
        },
        "then" : request({
          url : SUT + options.path,
          qs: { name: "scott" },
          json: true
        }).responds({
            responseHeaders:  { 
              "should correct 'content-type' to 'application/json'" : function(headers) {
                  Should(headers).have.property('content-type', 'application/json');
              }
            },
            and: {
              "statusCode should be 500 (for the serialization error)" : function(res) {
                  Should(res.statusCode).eql(500)
              }
            },
            responseBody: {
              "should still be valid JSON" : function(body) {
                  Should(body).be.an.Object()
              },
              "should have .messge : 'unable to stringify body properly'": function(body) {
                  Should(body).have.property('message', 'unable to stringify body properly')
              },
              "should have .stringifyErr - as the message of the stringification error" : function(body) {
                  Should(body).have.property('stringifyErr', 'Converting circular structure to JSON')
              },
              "should have .inspect - as the inspection of the output, split by new line" : function(body) {
                  Should(body.inspect).be.an.Array();
                  Should(body.inspect.slice(0,3)).eql([
                     '{ message: \'oupsy\',',
                     '  stack: ',
                     '   [ \'Error: oupsy\','
                  ])
              }
            }
        })
      }
    }
}

function lastFittingOutputSuite(options) {
    var expectBody;
    return {
        "and output serializes well" : {
            beforeAll: function(done) {
                rndFactor = Math.random();
                e2e.setupFixture({
                    statusCode:   201,
                    headers:      { 'content-type' : 'text/x-inspect' },
                    body:         expectBody = { foo : "bar", rnd: Math.random() },
                    circularBody: false,
                    error:        false,
                    circularErr:  false
                }, done)
            },
            "then" : request({
                url : SUT + options.path,
                qs: { name: "scott" },
                json: true
            }).responds({
                status:   201,
                responseHeaders:  {
                    "should correct 'content-type' to 'application/json'" : function(headers) {
                        Should(headers).have.property('content-type', 'application/json');
                    }
                },
                responseBody:     {
                    "should  be valid JSON": function(body) {
                        Should(body).be.an.Object();
                    },
                    "should be equal to expectBody" : function(body) {
                        Should(body).eql(expectBody);
                    }
                }
            })
        },
        "and output does not serialize well" : {
            beforeAll: function(done) {
                rndFactor = Math.random();
                e2e.setupFixture({
                    statusCode:   201,
                    headers:      { 'content-type' : 'text/x-inspect' },
                    body:         expectBody = { foo : "bar", rnd: Math.random() },
                    //------------------------------------------------------------------------------------
                    circularBody: true, // <--- instructs test server to create circular reference in body
                    //------------------------------------------------------------------------------------
                    error:        false,
                    circularErr:  false
                }, done)
            },
            "then" : request({
                url : SUT + options.path,
                qs: { name: "scott" },
                json: true
            }).responds({
                responseHeaders:  {
                    "should correct 'content-type' to 'application/json'" : function(headers) {
                        Should(headers).have.property('content-type', 'application/json');
                    }
                },
                responseBody: {
                    "should be valid JSON": function(body) {
                        Should(body).be.an.Object();
                    },
                    "should have .message": function(body) {
                        Should(body.message).eql("unable to stringify body properly");
                    },
                    "should have .stringifyErr": function(body) {
                        Should(body.stringifyErr).eql("Converting circular structure to JSON");
                    }
                },
                and: {
                    "statusCode should be 500" : function(res) {
                        Should(res.statusCode).eql(500);
                    }
                }
            })
        }
    }
}