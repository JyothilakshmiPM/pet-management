const app = require('../server');
const mongoose = require('mongoose');
const Model = require('../models/model');
const request = require("supertest");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const modelUser = mongoose.model('user');
const modelCat = mongoose.model('category');
const modelPet = mongoose.model('pet');


let auth = {};

beforeAll(async () => {
  const response = await request(app).post("/api/signup")
    .send({ first_name: "Benny", last_name: "Daniel", password: "bookworm",
      email: 'benny.daniel@gmail.com', age: 45, country: "India", role: 2 });
});

beforeEach(async () => {
  const response = await request(app).post("/api/login")
    .send({
      email: "benny.daniel@gmail.com",
      password: "bookworm"
    });
  auth.token = response.text;
  expect(response.statusCode).toBe(200);
});

afterAll(async () => {
  const deleted_user = await modelUser.deleteOne({ email: 'benny.daniel@gmail.com' });
  const deleted_category = await modelCat.deleteOne({ name: 'Squirrel' });
  const deleted_pet = await Pet.deleteOne( { name: 'Gillu' });
});

describe("checking SuperAdmin", () => {

  test("checking role of user", async() => {
    const result = await modelUser.findOne({}).where('role').equals(1);
    expect(result).not.toEqual(null);
  });

});

describe("POST Methods", () => {
  
  test("POST Category", async() => {
    const response = await request(app).post('/api/category')
      .send({ name: "Squirrel", status: 1 }).set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
  });

  test("POST Pet", async() => {
    const response = await request(app).post('/api//category/62c2771cfa16980d377eb89b/pet')
    .send({ name: "Gillu", status: 1, breed:"Eastern Gray", age: 0.5 }).set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
  });

});

describe("GET Methods", () => {
  
  test("GET All Categories", async() => {
    const response = await request(app).get("/api/category").set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toBeGreaterThan(1);
  });

  test("GET Category By ID", async() => {
    const response = await request(app).get("/api/category/62c2771cfa16980d377eb897").set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.name).toBe('Dogs');
  });
  
  test("GET Pet By ID", async() => {
    const response = await request(app).get("/api/pet/62c2772dfa16980d377eb89f").set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.name).toBe('Hachi');
    expect(response.body.breed).toBe('Husky');
  });

  test("GET Pet by Category ID", async() => {
    const response = await request(app).get("/api//category/62c2771cfa16980d377eb898/pet")
      .set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toBeGreaterThan(1);
    expect(response.body[0]).toHaveProperty("breed");
    expect(response.body[1].breed).toBe('Persian');
  });

});

describe("PUT Category & Pet", () => {

  test("PUT Category", async() => {
    const response = await request(app).put('/api/category/62c292ec73d76a3ddcc0a033')
      .send({ status: 0 }).set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.name).toBe('Horses');
  });

  test("PUT Pet", async() => {
    const response = await request(app).put('/api/pet/62c2772dfa16980d377eb8a4')
      .send({ age: 0.3 }).set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.breed).toBe('Parrot');
  });

});

describe("Delete Category & Pet", () => {

  test("Delete Category", async() => {
    const response = await request(app).delete('/api/category/62d7d7681aa2671e6fe55c0b')
      .set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.text).toBe('"Deleted category and Pets of Category id 62d7d7681aa2671e6fe55c0b"');
  });

  test("Delete Pet", async() => {
    const response = await request(app).delete('/api/pet/62d7a507e2b962cca5e37c4e')
      .set("authorization", auth.token);
    expect(response.statusCode).toEqual(200);
    expect(response.text).toBe('"Deleted Pet of id 62d7a507e2b962cca5e37c4e"');
  });

});
jest.clearAllTimers()

  