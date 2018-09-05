import { RestApiEndpoint, HttpAction } from "../../../../src/rest_api_endpoint";
import { ResourceService} from "../../../../src/service";
import { Context } from "koa";
import { HttpError } from 'http-errors';
import { Database } from "../../common/user_service";
import { CreateUser, User } from '../interface/interfaces';

export class CreateUserApi extends RestApiEndpoint<CreateUser, User>{

  public routeName: string = 'Create User';
  public routePath: string = '/users';
  public httpAction: HttpAction = HttpAction.POST;

  constructor(service: CreateUserService) {
    super(service, 'CreateUserApi');
    this.addMiddleware(this.fetchMetadata);
  }

  private async fetchMetadata(ctx: Context, next: () => Promise<void>): Promise<void> {
      ctx.params.id = '4';
      ctx.params.firstName = 'User';
      ctx.params.lastName = 'Four';
      await next();
  }
}

export class CreateUserService extends ResourceService<User> {

  constructor(userService: Database) {
    super(userService);
  }

  public async run(ctx: Context){
    return await this.provider.createUser(ctx.params);
  }

  public async handleError(error: Error) {
    let httpError = error as HttpError;
    httpError.statusCode = 400;
    return httpError;
  }
}


