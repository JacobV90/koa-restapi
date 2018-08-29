import { RestApiEndpoint, HttpAction } from "../../src/rest_api_endpoint";
import { ServiceProvider } from "../../src/service_provider";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { UserService } from "./user_service";

export interface GetUser {
  id: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class GetUserApi extends RestApiEndpoint<GetUser, User>{
  constructor(service: GetUserService) {
    super('/users/:id', HttpAction.GET, service);
  }
}

export class GetUserService extends ServiceProvider<UserService> {

  constructor(userService: UserService) {
    super(userService);
  }

  public async run(ctx: Context){
    ctx.request.body = await this.provider.getUser(ctx.params.id);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


