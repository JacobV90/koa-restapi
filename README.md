# Koa-Restapi
[![Build Status](https://travis-ci.org/JacobV90/koa-restapi.svg?branch=master)](https://travis-ci.org/JacobV90/koa-restapi)
[![Coverage Status](https://coveralls.io/repos/github/JacobV90/koa-restapi/badge.svg?branch=master)](https://coveralls.io/github/JacobV90/koa-restapi?branch=master)

A simple, lightweight, robust and versatile framework for building REST Api services on top of Koa with the developer experience at heart.

The **Koa-Restapi** framework comes shipped with a built in json schema validator for validating http requests and service layer responses at runtime using [AJV](https://github.com/epoberezkin/ajv). Which is currently the fastest json schema validator.

By leveraging Typescripts abstract classes and generic types, it provides compile time type checking and auto generation of json schemas.

## Install

```
yarn add @ninsho/koa-restapi
```

## Usage
Write an api endpoint class that extends the RestApiEndpoint abstract class.
- CreateUser - http request object type
- User - http response object type

Now create a resource service class that extends the ResourceService abstract class.
- Database - data prvoider class type
- User - type of object the provider will return

```
export class CreateUserApi extends RestApiEndpoint<CreateUser, User>{
  public routePath: string = '/users';
  public httpAction: HttpAction = HttpAction.POST;

  constructor(service: CreateUserService) {
    super(service, 'CreateUserApi');
  }
}

export class CreateUserService extends ResourceService<Database, User>{
  constructor(userService: Database) {
    super(userService);
  }

  public async run(ctx: Context){
    return await this.provider.createUser(ctx.params);
  }

  public async handleError(error: Error) {
    const httpError = error as HttpError;
    httpError.statusCode = 500;
    return httpError;
  }
}
```
Load the api middlware into a Koa application

```
import { getRouter } from '@ninsho/koa-restapi'

const provider = new Database();
const create_user_service = new CreateUserService(provider);
const create_user_api  = new CreateUserApi(create_user_service);

app.use(bodyParser());
app.use(getRouter(create_user_api));
server = app.listen(3000);
```

## Configure
Next create a `.restapi.json` file in the same directory as the package.json
```
{
    "include": "./users/api/*.ts",       // api files
    "models": "./users/model/models.ts", // model files
    "outDir": "./"                       // output for the api.schema.json file
}
```

Finally parse the api file to determine the request and response types that the rest api is 'constrained' by and generate the json schemas for the validators

./package.json
```
"scripts": {
    "parse": restapi
}

yarn parse
```

And thats all to it! The framework has created a request and response validator based on the types provided to the RestApiEndpoint class

### There are more examples in the examples folder!


# Benefits
### Speed up development
- By abstracting out the common functionality of restful api endpoints, developers just have to focus on whats most important.
- Combining the abstraction with the type constraints provides request and response validation out of the box which will help catch bugs early on and save on development time.
### Improve code structure and maintainability
- This framework was built to improve the development experience. It encourages writing readable, reusable and maintainable code. 
### Isolate functionality
- Hone in on core functionality for a given api endpoint. Helps with developing microservices. 
### Expandable and portable
- Create and add your own custom middlware for a particular endpoint
### Robust
- Using abstraction, contraints and validation, you can ben sure that your endpoint will work correctly.


# Some things to know
### The Context Object
- The "koa-restapi" framework takes advantage of Koa's context object. Request parameters are stored in `ctx.params` after validation and responses are stored in `ctx.state.response` after validation.
  -  see [Koa's documentation](https://koajs.com/#context) for more details about the context object
### The Middleware Stack
- If a class extends the 'RestApiEndpoint' class, it already has 3 layers of stacked middleware.
- When adding custom middleware, it is inserting in a 'stacked' fashion. First in, last out.
- Middleware is ran starting from the top of the stack towerds the bottom and then back up.
  - see [Koa's documentation](https://koajs.com/#application) for more details on how cascading middleware works
```
[
  requestValidator,
        .
        .            <-- custom middleware added here
  resourceService,
  responseHandler,
]
```

### **DO NOT** provide a primitive type for a 'RestApiEndpoint' class
- It will cause the API parser to throw an error. Instead use a type alias
-  e.g. `type Response = { result: boolean }`