import { RestApiEndpoint, HttpAction } from "../../../../src/rest_api_endpoint";
import { ResourceService } from "../../../../src/service";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { DeleteUser } from '../interface/interfaces';


export class DeleteUserApi extends RestApiEndpoint<DeleteUser, boolean>{

  public routeName: string = 'Delete User';
  public routePath: string = '/users/:id';
  public httpAction: HttpAction = HttpAction.DEL;

  constructor(service: ResourceService) {
    super(service);
  }
}

export class DeleteUserService extends ResourceService {

  constructor(database: Database) {
    super(database);
  }

  public async run(ctx: Context){
    ctx.state.responseObj = await this.provider.deleteUser(ctx.params.id);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}
