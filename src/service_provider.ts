import { HttpError } from 'http-errors';
import { Context } from 'koa';

export abstract class MiddlewareService{

  abstract run(ctx: Context): Promise<void>;
  abstract handleError?(error: Error): Promise<HttpError>;
}

export abstract class ServiceProvider<T> extends MiddlewareService{

  protected provider: T;

  constructor(provider: T) {
    super();
    this.provider = provider;
  }
}

