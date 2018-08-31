import { Context, Middleware } from 'koa';
import * as Router from 'koa-router';
import * as Compose from 'koa-compose';
import { ResourceService } from './service';
import { getRouter } from './router';

export enum HttpAction {
  GET,
  PATCH,
  POST,
  DEL,
}

/**
 * This abstract class provides the contract for an api endpoint. It utilizes the Koa framework to handle all requests,
 * responses, and errors. It it represented by a grouped stack of cascading middleware that share data using the
 * context object.
 *
 * Koa context details:
 * https://koajs.com/#context
 *
 * The typed parameters are used to represent the contract of the api service
 * - In: required request object
 * - Out: the response object
 *
 * All rest api endpoints must inherit from this class.
 */
export abstract class RestApiEndpoint<In, Out> {

  public abstract routeName: string;

  public abstract routePath: string;

  public abstract httpAction: HttpAction;

  /**
   * A custom response handler function can be set to handle the response back to the client
   */
  protected _responseHandler?: (ctx: Context) => Promise<void>;

  /**
   * The service provider for the inherited api endpoint class that performs the requested operation.
   */
  protected _resourceService: ResourceService;

  /**
   * A list containing middleware services that will run when this endpoint is invoked
   */
  private _routeMiddleware: Middleware[];

  /**
   *
   * @param {string} route - the route name
   * @param {HttpAction} action - the required Http Action
   * @param {ResourceService<any>} resourceService - the required service provider to fulfill the request
   */
  constructor(resourceService: ResourceService) {
    this._resourceService = resourceService;
    this._routeMiddleware = [
      this.resourceService,
      this.responseHandler
    ];
  }

  public addMiddleware(...middleware: Middleware[]) {
    this._routeMiddleware.unshift(...middleware);
  }

  public getMiddleware():Middleware[] {
    return this._routeMiddleware;
  }

  /**
   * Adds data to the response body from the request body by default if no
   * custom response handler is set.
   */
  private responseHandler = async(ctx: Context): Promise<void> => {
    if (this._responseHandler) {
      return await this._responseHandler(ctx);
    }
    ctx.body = ctx.state.responseObj;
  };

  /**
   * Runs the resource service operation
   */
  private resourceService = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    try {
      await RestApiEndpoint.runMiddleWareService(this._resourceService, ctx);
    } catch (error) {
      ctx.throw(error.statusCode, error);
    }
    await next()
  };

  private static async runMiddleWareService(service: ResourceService, ctx: Context): Promise<void> {
    try {
      await service.run(ctx);
    } catch (error) {
      throw await service.handleError(error);
    }
  }
}
