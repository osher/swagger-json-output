swagger-json-output
===================

Used with `swagger-node-runner`, this is a cherry picked pipe fitting to handle
both errors and json results.

This fitting is useful only for projects that are using `swagger-node-runner` 
version `0.7` or above.


### Important

The fitting sets for `swagger-node-runner` the `ctx.statusCode` and `ctx.output`
which in turn are used to emit the response. 

It works with `error`, `statusCode`, and `output` that it finds on the context.
As a result, it cannot work with data passed to `response.write` nor to 
`response.writeHead`.

**In order for the fitting to work as expected user controllers should 
communicate with the runner using the `context` object and the value yielded to
the `next` callback, and should not use not use the response object to write to
the response or response headers.**

If you cannot work this way, this fitting is not for you :(

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
 - if the `content-type` of the response should be JSON - it formats the  
   output as JSON.
   Whenever the serialization fails 
    - the response code escalates to 500
      response body will be a beautified JSON object which includes:
        - `message`: `unable to stringify body properly`,
        - `stringifyErr`: the stringification error message
        - `bodyInspect`: Array lines resulted by `util.inspect`ing the `body`.

As this fitting finishes, the context has a well-formatted 
        
## Configuring the fitting 
Supported options:
 - beautifyJson
 - `includeErrObject` - whenever truthful, errors are captured and format

1. Create a fitting definition before your pipe
2. Use the configured fitting instead the raw fitting name. 

Example:
```yaml
  bagpipes: 
    _output:
      name:             swagger-json-output
      beautifyJson:     true
      includeErrObject: true

    #... more fitting definitions

    swagger_controllers:
      - onError: _output
      - swagger_cors
      - swagger_params_parser
      - swagger_security
      - swagger_validate
      - express_compatibility
      - _router
      - _output
```        



