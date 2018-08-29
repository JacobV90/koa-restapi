import { RestApiEndpoint, HttpAction } from "../../src/rest_api_endpoint";
import { ServiceProvider } from "../../src/service_provider";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { UserService } from "./user_service";

export interface DeleteUser {
  id: string;
}

export class DeleteUserApi extends RestApiEndpoint<DeleteUser, boolean>{
  constructor(service: DeleteUserService) {
    super('/users/:id', HttpAction.DEL, service);
  }
}

export class DeleteUserService extends ServiceProvider<UserService> {

  constructor(userService: UserService) {
    super(userService);
  }

  public async run(ctx: Context){
    ctx.request.body = await this.provider.deleteUser(ctx.params.id);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}
