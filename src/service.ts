import { HttpError } from 'http-errors';
import { Context } from 'koa';

export abstract class ResourceService<Provider, Out>{

  public abstract run(ctx: Context): Promise<Out>;
  public abstract handleError?(error: Error): Promise<HttpError>;

  protected provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }
}

