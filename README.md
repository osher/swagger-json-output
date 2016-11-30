#swagger-json-output

Used with [`swagger-node-runner`][1], this is a cherry picked pipe fitting to handle
yielded errors and/or yielded results to JSON.


This fitting is useful only for projects that are using [`swagger-node-runner`][1]
version `0.7` or above.


### Important

Generally, the fitting sets for [`swagger-node-runner`][1] the `ctx.statusCode`
and `ctx.output` based on `ctx.error` and `ctx.output` that it is provided with,
which in turn are used by [`swagger-node-runner`][1] it to emit the response, as 
seen at the [`_finish` handler][2] of the underlying `connect_middleware`.


This pipe works with `error`, `statusCode`, and `output` that it finds on the 
context that it's given.
As a result, it cannot work with data passed to `response.write` nor to 
`response.writeHead`.

**In order for the fitting to work as expected user controllers should 
communicate with the runner using the `context` object and the value yielded to
the `next` callback, and should not use not use the response object to write to
the response or response headers.**

If you cannot work this way, this fitting is not for you :(

We recommend to work with [`controllerInterface: pipe`][3].


## installing
```bash
npm install swagger-json-output --save
```

## Using it as an `onError` handler

Pass it as `onError` handler to your main pipe.

If you're using the template created by `swagger` cli:

1. Find the definition of your main pipe
2. replace
```yaml
      - onError: json_error_handler
```      
with
```yaml
      - onError: swagger-json-output
```      

## Using it as output JSON formatter
1. add this fitting as a last step to your main pipe:
```yaml
      - swagger-json-output
```

## How does it work

Whenever an error is thrown in any of the fitting in that pipe, `bagpipes` 
captures the error as `context.error` and passes the cotnext to this 
fitting.

Regardless to errors, user controllers are expected to pass the response body 
as 2nd argument to the `next` callback. This value is passed by `bagpipes` to 
this fitting as `context.output`.

As this fitting finishes, wether by error or not - the context has:
 - a defined statusCode
 - a defined response content-type, matching `Accept` http header **and** the 
   `produces` defined on the operation.
 - a well-formatted body (currently guaranteed only for application/json)


Flow:
 - **In case of error**, make sure statusCode is escalated to `>= 400` by using the first code
   that is indeed set and is `>= 400`:
    - `context.statusCode` 
    - `context.response.statusCode`
    - `context.error.statusCode`
    - use 500 as default error code
 - assure that the `content-type` of the response matches the content-type
   defined by the `produces` section of the `openapi-spec` of the processed
   operation.
 - ** In case of error**, AND `includeErrObject` is truthful: 
    - creates `context.output` as a serializable clone of the error, making
      sure the clone will include the `err.message` and `err.stack` if any,
      together with any enumerable property that the error is decorated with.
 - if `ctx._preOutput` handler is found - execute it, and pass it the context as argument.
   The handler is executed synchronously (no callback involved).
 - if the `content-type` of the response should be JSON - it formats the  
   output as JSON.
   Whenever the serialization fails 
    - the response code escalates to 500
      response body will be a beautified JSON object which includes:
        - `message`: `unable to stringify body properly`,
        - `stringifyErr`: the stringification error message
        - `bodyInspect`: Array lines resulted by `util.inspect`ing the `body`.

       
## Configuring the fitting 
Supported options:
 - `includeErrObject` - whenever truthful, errors are captured and format
 - `beautifyJson` - meant for Dev/Integration envs, where you want to `curl` your API and just read.
   The error-stack is optimized for this beautification.

1. Create a fitting definition before your pipe
2. Use the configured fitting instead the raw fitting name. 

Example:

in `default.yaml`
```yaml
  bagpipes: 
    _output:
      name:                   swagger-json-output
      beautifyJson:           false
      includeErrObject:       false

    _router:
      name:                   swagger_router
      controllersInterface:   pipe

    swagger_controllers:
      - onError:              _output
      - swagger_cors
      - swagger_params_parser
      - swagger_security
      - swagger_validate
      - express_compatibility
      - _router
      - _output
``` 

in `dev.yaml`
```yaml
  bagpipes: 
    _output:
      beautifyJson:           true
      includeErrObject:       true
```      

## Last minute modifications to output

If you need to perform a last-minute modification to the output, you can 
provide a synchronous handler and place it on the context as `ctx._preOutput`.

The function is provided one argument - the context itself, so you don't have
to use the keyword `this`.

Example:

```javascript
module.exports = function(fittingDef) {
  return function(ctx, next) {
      ctx._preOutput = lastMomentModifyCtx
  }
}

function lastMomentModifyCtx(ctx) {
    //ctx.output - will contain the output, or the output created 
    //  from a thrown/yielded error
}
```

The usecase that brought this feature is a proprietary fitting that executes 
early in the pipeline, collects tools (di) and prepares an envelope response,
where by corporate rules any reponse provided by any step must be contained in
this envelope.

So, in fact, the fitting does all the di and prepare the envelope before 
all user-code parts (mainly security-handlers and router controllers), gathers
data to this envelope as execution of the request progresses, and uses the hook 
to enrich and contain the response using the `ctx._preOutput` hook.
 
## Future
 - design handling of multiple content-types

## Contribute
 - Using PRs :).
   If you intend to add functionality - please discuss it with us first on an 
   issue - just to help maintain the spirit of the project :)
 - make sure all tests pass
 
 Thanks!

## Lisence

MIT, and that's it :)
 
[1]: https://www.npmjs.com/package/swagger-node-runner
[2]: https://github.com/theganyo/swagger-node-runner/blob/master/lib/connect_middleware.js#L68
[3]: https://github.com/theganyo/swagger-node-runner/wiki/Controllers-Interface
