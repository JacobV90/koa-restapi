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

  constructor(service: ResourceService) {
    super(service);
    this.addMiddleware(this.fetchMetadata)
  }

  private async fetchMetadata(ctx: Context, next: () => Promise<void>): Promise<void> {
    ctx.state.requestObj = ctx.request.body;
    ctx.state.requestObj.id = ctx.params.id;
    await next();
  }
}

export class UpdateUserService extends ResourceService {

  constructor(userService: Database) {
    super(userService);
  }

  public async run(ctx: Context){
    ctx.state.responseObj = await this.provider.updateUser(ctx.state.requestObj);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


