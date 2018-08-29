import { RestApiEndpoint, HttpAction } from "../../src/rest_api_endpoint";
import {MiddlewareService, ServiceProvider} from "../../src/service_provider";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { UserService } from "./user_service";

export interface CreateUser {
  email: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class CreateUserApi extends RestApiEndpoint<CreateUser, User>{
  constructor(service: CreateUserService) {
    super('/users', HttpAction.POST, service);
  }

  protected beforeHook: MiddlewareService = new class {
    public async run(ctx: Context): Promise<void> {
      (ctx.request.body as any)['id'] = '4';
      (ctx.request.body as any)['firstName'] = 'User';
      (ctx.request.body as any)['lastName'] = 'Four'
    }
  }
}

export class CreateUserService extends ServiceProvider<UserService> {

  constructor(userService: UserService) {
    super(userService);
  }

  public async run(ctx: Context){
    await this.provider.createUser(ctx.request.body as User);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


