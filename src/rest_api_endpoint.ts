import { Context, Middleware } from 'koa';
import { ResourceService } from './service';
import * as Ajv from 'ajv';
import { resolve } from 'path';
import { SchemaDoc, HttpAction } from './types';
const apiSchema: SchemaDoc = require(resolve(process.cwd(), './.api.schemas.json'));

/**
 * This abstract class provides the contract for an api endpoint. It utilizes the Koa framework to handle all requests,
 * responses, and errors. It it represented by a grouped stack of cascading middleware that share data using the
 * context object.
 *
 * Koa context details:
 * https://koajs.com/#context
 *
 * The typed parameters are used to represent the contract of the api service
 * - In: required request data
 * - Out: the response data
 *
 * All rest api endpoints must inherit from this class.
 */
export abstract class RestApiEndpoint<In, Out> {

  /**
   * This routes path
   */
  public abstract routePath: string;

  /**
   * The Http command for this route
   */
  public abstract httpAction: HttpAction;

  /**
   * The service provider for the inherited api endpoint class that performs the requested operation.
   */
  private _resourceService: ResourceService<Out>;

  /**
   * A list containing middleware services that will run when this endpoint is invoked
   */
  private _middlewareStack: Middleware[];

  /**
   * The validator function for this routes request parameters
   */
  private _requestValidator: Ajv.ValidateFunction;


  /**
   * The validator function for this routes response data
   */
  private _responseValidator: Ajv.ValidateFunction;


  /**
   * Handles the errors from the request validation and can be overridden
   */
  protected requestValidationErrorHandler = (ctx: Context, errors: Ajv.ErrorParameters ) => {
    ctx.throw(400, errors)
  };

  /**
   * Handles the errors from the response validation and can be overridden
   */
  protected responseValidationErrorHandler = (ctx: Context, errors: Ajv.ErrorParameters ) => {
    ctx.throw(500, errors)
  };

  /**
   * Adds data to the response body from the response by default if not overridden
   */
  protected responseHandler = async (ctx: Context): Promise<void> => {
    ctx.body = ctx.state.response;
  };

  /**
   * Combines the query and request body parameters into one object and validates it
   */
  private requestValidation = async (ctx: Context, next: () => Promise<void>): Promise<void> =>{
    ctx.params = {...ctx.params, ...ctx.request.body};
    const isValid = this._requestValidator(ctx.params);
    if (!isValid)
      this.requestValidationErrorHandler(ctx, this._requestValidator.errors);

    await next()
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

  private async runResourceService(service: ResourceService<Out>, ctx: Context): Promise<Out> {
    let responseData: Out;
    try {
      responseData = await service.run(ctx);
    } catch (error) {
      throw await service.handleError(error);
    }
    const isValid = this._responseValidator(responseData);
    if (!isValid)
      this.responseValidationErrorHandler(ctx, this._responseValidator.errors);

    return responseData;
  }
}
