import { RestApiEndpoint, HttpAction } from "../../src/rest_api_endpoint";
import { MiddlewareService, ServiceProvider} from "../../src/service_provider";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { UserService } from "./user_service";

export interface UpdateUser {
  id: string
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class UpdateUserApi extends RestApiEndpoint<UpdateUser, User>{
  constructor(service: UpdateUserService) {
    super('/users/:id', HttpAction.PATCH, service);
  }

  protected beforeHook: MiddlewareService = new class {
    public async run(ctx: Context) {
      (ctx.request.body as any).id = ctx.params.id;
    }
  }
}

export class UpdateUserService extends ServiceProvider<UserService> {

  constructor(userService: UserService) {
    super(userService);
  }

  public async run(ctx: Context){
    await this.provider.updateUser(ctx.request.body as User);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


