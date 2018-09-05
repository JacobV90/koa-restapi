import { HttpError } from 'http-errors';
import { Context } from 'koa';

export abstract class ResourceService<Out>{

  public abstract run(ctx: Context): Promise<Out>;
  public abstract handleError?(error: Error): Promise<HttpError>;

  protected provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }
}

