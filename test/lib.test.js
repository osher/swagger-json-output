var sut = require('../')

module.exports = { 
  "swagger-result" : { 
    "should be a factory function that names 2 arguments - fittingDef, bagpipes" : function() {
        Should(sut)
          .be.a.Function()
          .have.property("length", 2)
    },
    ".<member>(param, param)" : {
      "when used with ..." :  {
        "should ..." : null
      }
    }
  }
}