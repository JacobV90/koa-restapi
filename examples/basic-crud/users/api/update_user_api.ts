import { RestApiEndpoint, ResourceService, HttpAction } from "../../../../src";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { UpdateUser, User } from '../model/models';

export class UpdateUserApi extends RestApiEndpoint<UpdateUser, User>{
  public routePath: string = '/users/:id';
  public httpAction: HttpAction = HttpAction.PATCH;

  constructor(service: UpdateUserService) {
    super(service, 'UpdateUserApi');
  }
}

export class UpdateUserService extends ResourceService<Database, User> {
  constructor(userService: Database) {
    super(userService);
  }

  public async run(ctx: Context){
    return await this.provider.updateUser(ctx.params);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


