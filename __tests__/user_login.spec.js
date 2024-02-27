
const request = require("supertest");
const app = require("../app");
const db = require("../db/config/mongodbConnection");

// let user;
// beforeAll(async () => {
//   const insertUser = {
//     email: "test@example.com",
//     password: "password123",
//     username: "testingexample",
//     role: 'user'
//   }
//   user = await db.collection('User').insertOne(insertUser);
// });

describe("User Login Test", () => {
  test("should login a user successfully", async () => {
    const user = {
      email: "testingserver@mail.com",
      password: "testingserver",
    }
    const response = await request(app)
      .post("/login")
      .send(user);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });
});

// afterAll(async () => {
//   await db.collection('User').deleteOne({
//     _id: user.insertedId
//   });
// });