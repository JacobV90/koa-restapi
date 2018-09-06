# Koa-Restapi
[![Build Status](https://travis-ci.org/JacobV90/koa-restapi.svg?branch=master)](https://travis-ci.org/JacobV90/koa-restapi)
[![Coverage Status](https://coveralls.io/repos/github/JacobV90/koa-restapi/badge.svg?branch=master)](https://coveralls.io/github/JacobV90/koa-restapi?branch=master)

A simple, lightweight, robust and versatile framework for building REST Api services on top of Koa . The framework comes shipped with a built in json schema validator for validating http requests and service layer responses at runtime. By leveraging Typescripts abstract classes and generic types, it provides compile time type checking and generation of json schemas.

## Usage
Install and save the koa-restapi as a dependency
```
yarn add koa-restapi
```
Write an api endpoint class that extends the RestApiEndpoint abstract class.
- CreateUser - the http request type
- User - the response data type

Now create a resource service class that extends the ResourceService abstract class.
- Database - the data prvoider class type
- User - the object type the providers method will return

./create_user_api.ts
```
import { RestApiEndpoint, ResourceService, HttpAction } from "koa-restapi";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { CreateUser, User } from '../model/models';

export class CreateUserApi extends RestApiEndpoint<CreateUser, User>{
  public routePath: string = '/users';
  public httpAction: HttpAction = HttpAction.POST;

  constructor(service: CreateUserService) {
    super(service, 'CreateUserApi');
    this.addMiddleware(this.fetchMetadata);
  }

  private async fetchMetadata(ctx: Context, next: () => Promise<void>): Promise<void> {
      ctx.params.id = '4';
      ctx.params.firstName = 'User';
      ctx.params.lastName = 'Four';
      await next();
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
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}
```
Load the api middlware into a Koa application

./app.ts
```
const provider = new Database();
const create_user_service = new CreateUserService(provider);
const create_user_api  = new CreateUserApi(create_user_service);

app.use(bodyParser());
app.use(getRouter(create_user_api));
server = app.listen(3000);
```
Next create a `.restapi.json` file in the same directory as the package.json
```
{
    "include": "./users/api/*.ts", // api files
    "outDir": "./",
    "models": "./users/model/models.ts" // model files
}
```

Finally parse the api file to determine the request and response types that the rest api is 'constrained' by and generate the json schemas for the validator

./package.json
```
"scripts": {
    "parse": restapi
}
//
yarn parse
```

And thats all to it! The framework has created a request and response validator based on the types provided to the RestApiEndpoint class