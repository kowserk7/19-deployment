'use strict';

const faker = require('faker');
const mock = require('../../lib/mock');
const superagent = require('superagent');
const server = require('../../../lib/server');
require('jest');

describe('POST /api/v1/library', function() {
  beforeAll(server.start);
  beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.library.removeAll);

  describe('Valid request', () => {
    it('should return a 201 CREATED status code', () => {
      return mock.library.createOne()
        .then(mock => {
          return superagent.post(`:${process.env.PORT}/api/v1/library`)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({
              name: faker.lorem.word(),
              description: faker.lorem.words(4),
            });
        })
        .then(response => {
          expect(response.status).toEqual(201);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('description');
          expect(response.body).toHaveProperty('_id');
        });
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 NOT AuthORIZED given back token', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/library`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/library`)
        .set('Authorization', `Bearer ${this.mockAuth.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(400));
    });
  });
});