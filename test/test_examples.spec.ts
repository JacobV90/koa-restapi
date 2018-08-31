/* tslint:disable:max-line-length*/
/* tslint:disable:ter-prefer-arrow-callback*/

import 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { Database } from "./basic-crud/common/user_service";
import { getRouter } from '../src/router';
import {
  CreateUserApi,
  CreateUserService,
  DeleteUserApi,
  DeleteUserService,
  UpdateUserService,
  UpdateUserApi,
  GetUserApi,
  GetUserService
} from "./basic-crud/users/";

describe('test_endpoint.spec.ts', function () {
  this.timeout(5000);
  let app: Koa;
  let server: any;
  let provider: Database = new Database();

  before(() => {
    app = new Koa();
    let create_user_service = new CreateUserService(provider);
    let create_user_api  = new CreateUserApi(create_user_service);
    let get_user_service = new GetUserService(provider);
    let get_user_api  = new GetUserApi(get_user_service);
    let delete_user_service = new DeleteUserService(provider);
    let delete_user_api  = new DeleteUserApi(delete_user_service);
    let update_user_service = new UpdateUserService(provider);
    let update_user_api  = new UpdateUserApi(update_user_service);
    app.use(bodyParser());
    app.use(getRouter(create_user_api, delete_user_api, update_user_api, get_user_api));
    server = app.listen(3000);
  });

  after(() => {
    server.close();
  });

  describe('Get User Api', function () {
    it('should get a user provided a valid user id', async function () {
      const response = await request(server).get('/users/0');
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal('0');
    });
  });

  describe('Create User Api', function () {
    it('should create a user provided a valid user id', async function () {
      const response = await request(server)
      .post('/users')
      .send({
        email: 'user4@gmail.com'
      });
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal('4');
      expect(response.body.firstName).to.equal('User');
      expect(response.body.lastName).to.equal('Four');
      expect(response.body.email).to.equal('user4@gmail.com');
    });
  });

  describe('Delete User Api', function () {
    it('should delete a user provided a valid user id', async function () {
      const response = await request(server).del('/users/2');
      expect(response.status).to.equal(200);
      expect(response.body).to.equal(true);
    });
  });

  describe('Update User Api', function () {
    it('should update a user provided a valid user id', async function () {
      const response = await request(server)
      .patch('/users/2')
      .send({
        firstName: 'Admin',
        lastName: 'Two'
      });
      expect(response.status).to.equal(200);
      expect(response.body.firstName).to.equal('Admin');
      expect(response.body.lastName).to.equal('Two');
    });
  });
});
