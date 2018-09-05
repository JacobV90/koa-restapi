import { RestApiEndpoint, HttpAction } from "../../../../src/rest_api_endpoint";
import { ResourceService} from "../../../../src/service";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { UpdateUser, User } from '../interface/interfaces';

export class UpdateUserApi extends RestApiEndpoint<UpdateUser, User>{

  public routeName: string = 'Update User';
  public routePath: string = '/users/:id';
  public httpAction: HttpAction = HttpAction.PATCH;

  constructor(service: ResourceService<User>) {
    super(service, 'UpdateUserApi');
  }
}

export class UpdateUserService extends ResourceService<User> {

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


