/* tslint:disable:max-line-length*/
/* tslint:disable:ter-prefer-arrow-callback*/

import 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { GetUserApi, GetUserService } from "./examples/get_user_api";
import { UserService } from "./examples/user_service";
import {CreateUserApi, CreateUserService} from "./examples/create_user_api";
import {DeleteUserApi, DeleteUserService} from "./examples/delete_user_api";
import {UpdateUserApi, UpdateUserService} from "./examples/update_user_api";

describe('test_endpoint.spec.ts', function () {
  this.timeout(5000);
  let app: Koa;
  let server: any;
  let provider: UserService = new UserService();

  describe('Get User Api', function () {

    before(async () => {
      app = new Koa();
      let service = new GetUserService(provider);
      let api  = new GetUserApi(service);
      app.use(bodyParser());

      app.use(api.getRoute());
      server = app.listen(3000);
    });

    after(async () => {
      await server.close();
    });

    it('should get a user provided a valid user id', async function () {
      const response = await request(server).get('/users/0');
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal('0');
    });
  });

  describe('Create User Api', function () {

    before(async () => {
      app = new Koa();
      let service = new CreateUserService(provider);
      let api  = new CreateUserApi(service);
      app.use(bodyParser());

      app.use(api.getRoute());
      server = app.listen(3000);
    });

    after(async () => {
      await server.close();
    });

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

    before(async () => {
      app = new Koa();
      let service = new DeleteUserService(provider);
      let api  = new DeleteUserApi(service);
      app.use(bodyParser());

      app.use(api.getRoute());
      server = app.listen(3000);
    });

    after(async () => {
      await server.close();
    });

    it('should delete a user provided a valid user id', async function () {
      const response = await request(server).del('/users/2')
      expect(response.status).to.equal(200);
      expect(response.body).to.equal(true);
    });
  });

  describe('Update User Api', function () {

    before(async () => {
      app = new Koa();
      let service = new UpdateUserService(provider);
      let api  = new UpdateUserApi(service);
      app.use(bodyParser());

      app.use(api.getRoute());
      server = app.listen(3000);
    });

    after(async () => {
      await server.close();
    });

    it('should delete a user provided a valid user id', async function () {
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
