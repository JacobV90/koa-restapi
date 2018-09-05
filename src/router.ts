import { RestApiEndpoint, HttpAction } from "./";
import { Middleware } from 'koa';
import * as Router from 'koa-router';
import * as compose from 'koa-compose';

export function getRouter(...apis: RestApiEndpoint<any, any>[]): Middleware {
  const router: Router = new Router();
  for (let api of apis) {
    switch (api.httpAction) {
      case HttpAction.DEL:
        router.del(
          api.routePath,
          ...api.getMiddleware(),
        );
        break;

      case HttpAction.GET:
        router.get(
          api.routePath,
          ...api.getMiddleware()
        );
        break;

      case HttpAction.POST:
        router.post(
          api.routePath,
          ...api.getMiddleware()
        );
        break;

      case HttpAction.PATCH:
        router.patch(
          api.routePath,
          ...api.getMiddleware()
        );
        break;
    }
  }
  return compose([router.routes(), router.allowedMethods()]);
}

