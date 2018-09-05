import { Context, Middleware } from 'koa';
import { ResourceService } from './service';
import * as Ajv from 'ajv';
import {SchemaDoc} from './types';
const apiSchema: SchemaDoc = require('../.api-schemas.json');

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
  protected _resourceService: ResourceService<Out>;

  /**
   * A list containing middleware services that will run when this endpoint is invoked
   */
  private _middlewareStack: Middleware[];

  private _requestValidator: Ajv.ValidateFunction;

  private _responseValidator: Ajv.ValidateFunction;

  constructor(resourceService: ResourceService<Out>, api_name: string) {
    const validator = new Ajv();
    this._resourceService = resourceService;
    this._requestValidator = validator.compile(apiSchema[api_name].request);
    this._responseValidator = validator.compile(apiSchema[api_name].response);
    this._middlewareStack = [
      this.requestValidation,
      this.resourceService,
      this.responseHandler
    ];
  }

  public addMiddleware(...middleware: Middleware[]) {
    this._middlewareStack.splice(1, 0, ...middleware);
  }

  public getMiddleware():Middleware[] {
    return this._middlewareStack;
  }

  protected requestValidationErrorHandler(ctx: Context, errors: Ajv.ErrorParameters ) {
    ctx.throw(400, errors)
  }

  protected responseValidationErrorHandler(ctx: Context, errors: Ajv.ErrorParameters ) {
    ctx.throw(500, errors)
  }

  /**
   * Adds data to the response body from the request body by default if no
   * custom response handler is set.
   */
  private requestValidation = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    ctx.params = {...ctx.params, ...ctx.request.body};
    const isValid = this._requestValidator(ctx.params);
    if (!isValid)
      this.requestValidationErrorHandler(ctx, this._requestValidator.errors);

    await next()
  };

  /**
   * Adds data to the response body from the request body by default if no
   * custom response handler is set.
   */
  private responseHandler = async(ctx: Context): Promise<void> => {
    if (this._responseHandler) {
      return await this._responseHandler(ctx);
    }
    ctx.body = ctx.state.response;
  };

  /**
   * Runs the resource service operation
   */
  private resourceService = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    try {
      ctx.state.response = await this.runResourceService(this._resourceService, ctx);
    } catch (error) {
      ctx.throw(error.statusCode, error);
    }
    await next()
  };

  private async runResourceService(service: ResourceService<Out>, ctx: Context): Promise<Out> {
    let responseData: Out;
    try {
      responseData = await service.run(ctx);
    } catch (error) {
      throw await service.handleError(error);
    }
    console.log(responseData);
    const isValid = this._responseValidator(responseData);
    if (!isValid)
      this.responseValidationErrorHandler(ctx, this._responseValidator.errors);

    return responseData;
  }
}
