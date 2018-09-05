import { RestApiEndpoint, ResourceService, HttpAction } from "../../../../src";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { DeleteUser, DeleteUserResponse } from '../model/models';

export class DeleteUserApi extends RestApiEndpoint<DeleteUser, DeleteUserResponse>{

  public routePath: string = '/users/:id';
  public httpAction: HttpAction = HttpAction.DEL;

  constructor(service: ResourceService<DeleteUserResponse>) {
    super(service, 'DeleteUserApi');
  }
}

export class DeleteUserService extends ResourceService<DeleteUserResponse> {

  constructor(database: Database) {
    super(database);
  }

  public async run(ctx: Context){
    return await this.provider.deleteUser(ctx.params.id);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}
