import { Context, Middleware } from 'koa';
import * as Router from 'koa-router';
import { MiddlewareService, ServiceProvider } from './service_provider';

export enum HttpAction {
  GET,
  PATCH,
  POST,
  DEL,
}

/**
 * The RestApiEndpoint class utilizes the Koa framework to handle all
 * requests, responses, and errors. All of the Ninsho rest api endpoints inherit from this class.
 *
 * Koa context details:
 * https://koajs.com/#context
 */
export abstract class RestApiEndpoint<I, O> {

  /**
   * A before hook function can be set that will run before performing the requested
   * auth0 operation. Data returned by this function will be added to the context state.
   * e.g. (ctx.state.beforeHookData)
   */
  protected beforeHook?: MiddlewareService;

  /**
   * An after hook function can be set that will run after performing the requested auth0 operation.
   * Data returned by the before hook can be accessed here. If specified, the after hook function
   * must handle responses back to the client.
   */
  protected afterHook?: MiddlewareService;

  /**
   * The key used to store data in the context object for this route
   */
  protected routeKey: string;

  private serviceProvider: ServiceProvider<any>;
  private route: string;
  private httpAction: HttpAction;
  private routeMiddleware: Middleware[];

  constructor(route: string, action: HttpAction, serviceProvider: ServiceProvider<any>) {
    this.serviceProvider = serviceProvider;
    this.routeKey = action + route;
    this.route = route;
    this.httpAction = action;
    this.routeMiddleware = [
      this.beforeHookService,
      this.resourceService,
      this.afterHookService,
      this.responseHandler
    ]
  }

  public getRoute(): Middleware {
    return this.configureRouter().routes();
  }

  protected async responseHandler(ctx: Context): Promise<void> {
    ctx.body = ctx.request.body;//(<any>ctx).routeKey.data as O;
  }

  private beforeHookService = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    if (this.beforeHook) {
      try {
        await RestApiEndpoint.runMiddleWareService(this.beforeHook, ctx);
      } catch (error) {
        ctx.throw(error.statusCode, error);
      }
    }
    await next();
  };

  private resourceService = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    try {
      await RestApiEndpoint.runMiddleWareService(this.serviceProvider, ctx);
    } catch (error) {
      ctx.throw(error.statusCode, error);
    }
    await next()
  };

  private afterHookService = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    if (this.afterHook) {
      try {
        await RestApiEndpoint.runMiddleWareService(this.afterHook, ctx);
      } catch (error) {
        ctx.throw(error.statusCode, error);
      }
    }
    await next();
  };

  private static async runMiddleWareService(service: MiddlewareService, ctx: Context): Promise<void> {
    try {
      await service.run(ctx);
    } catch (error) {
      if (service.handleError){
        throw await service.handleError(error);
      }
      throw error;
    }
  }

  private configureRouter() {
    const router: Router = new Router();
    switch (this.httpAction) {
      case HttpAction.DEL:
        router.del(
          this.route,
          ...this.routeMiddleware
        );
        break;

      case HttpAction.GET:
        router.get(
          this.route,
          ...this.routeMiddleware
        );
        break;

      case HttpAction.POST:
        router.post(
          this.route,
          ...this.routeMiddleware
        );
        break;

      case HttpAction.PATCH:
        router.patch(
          this.route,
          ...this.routeMiddleware
        );
        break;
    }
    return router
  }


}
