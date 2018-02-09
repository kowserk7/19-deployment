'use strict';

let eH = require('../../lib/error-handler');
require('jest');


class Res {
  constructor (err) {
    this.error = err;
    this.code = null;
    this.message = null;
  }
  
  status (code) {
    this.code = code;
    return this;
  }
  
  send (message) {
    this.message = message;
    return this;
  }
}

let validation = new Res(new Error('validation'));
let authorization = new Res(new Error('authorization'));
let path = new Res(new Error('path error'));
let object = new Res(new Error('objectid failed'));
let duplicate = new Res(new Error('duplicate key'));
let generic = new Res(new Error('generic'));

describe('Error Handler', () => {
  it('should return an error 400 for any error containing Validation Error', () => {
    expect(eH(validation.error, validation).code).toBe(400);
  });
  it('should return an error 400 for any error containing Validation Error', () => {
    expect(eH(authorization.error, authorization).code).toBe(401);
  });
  it('should return an error 401 for any error containing Path Error', () => {
    expect(eH(path.error, path).code).toBe(404);
  });
  it('should return an error 404 for any error containing Objectid Error', () => {
    expect(eH(object.error, object).code).toBe(404);
  });
  it('should return an error 409 for any error containing Duplicate Key Error', () => {
    expect(eH(duplicate.error, duplicate).code).toBe(409);
  });
  it('should return an error 500 for any other errors that occur', () => {
    expect(eH(generic.error, generic).code).toBe(500);
  });
});