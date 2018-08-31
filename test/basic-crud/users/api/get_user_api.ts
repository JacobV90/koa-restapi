import { RestApiEndpoint, HttpAction } from "../../../../src/rest_api_endpoint";
import { ResourceService } from "../../../../src/service";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { GetUser, User } from '../interface/interfaces';

export class GetUserApi extends RestApiEndpoint<GetUser, User>{

  public routeName: string = 'Get User';
  public routePath: string = '/users/:id';
  public httpAction: HttpAction = HttpAction.GET;

  constructor(service: ResourceService) {
    super(service);
  }
}

export class GetUserService extends ResourceService {

  constructor(userService: Database) {
    super(userService);
  }

  public async run(ctx: Context){
    ctx.state.responseObj = await this.provider.getUser(ctx.params.id);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


