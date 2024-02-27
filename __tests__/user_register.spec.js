const request = require("supertest");
const app = require("../app");
const db = require("../db/config/mongodbConnection");
const { hashPassword } = require("../helper/bcryptFunctions");

// let user;
// beforeAll(async () => {
//     const insertUser = {
//         email: "test@example.com",
//         password: "password123",
//         username: "testingexample",
//         role: 'user'
//     }
//     user = await db.collection('User').insertOne(insertUser);
// });

describe("User Register Test", () => {
    test("should fail register a user because email already registered", async () => {
        const user = {
            email: "userbaru2@mail.com",
            password: "password123",
            role: 'user'
        }
        const response = await request(app)
            .post("/register")
            .send(user);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    })
    test("should register a user successfully", async () => {
        const user = {
            email: "userbarulagi@mail.com",
            password: "password123",
            role: 'user'
        }
        const response = await request(app)
            .post("/register")
            .send(user);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("message");
    })
    test('should fail register because user not inputting email', async () => {
        const user = {
            password: "password123",
            role: 'user'
        }
        const response = await request(app)
            .post("/register")
            .send(user);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    })
    test('should fail register because user not inputting password', async () => {
        const user = {
            email: "userbarulagi@mail.com",
            role: 'user'
        }
        const response = await request(app)
            .post("/register")
            .send(user);

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("error");
    })
})

afterAll(async () => {
    await db.collection('User').deleteOne({
        email: "userbarulagi@mail.com"
    });
})