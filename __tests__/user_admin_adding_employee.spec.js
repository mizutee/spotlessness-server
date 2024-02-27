
const request = require("supertest");
const app = require("../app");
const db = require("../db/config/mongodbConnection");

// JWT
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../helper/bcryptFunctions");
const SECRET = process.env.HASH_SECRET;

function signToken(token) {
    return jwt.sign(token, SECRET)
}

let user;
let access_token;
beforeAll(async () => {
    const insertUser = {
        email: "test@example.com",
        password: hashPassword("password123"),
        username: "testingexample",
        role: 'admin'
    }
    user = await db.collection('User').insertOne(insertUser);
    access_token = signToken({
        id: user.insertedId,
        email: insertUser.email,
        username: insertUser.username,
        role: insertUser.role
    });
});

describe("Admin Add Employee Test", () => {
    test("should add an employee successfully", async () => {
        const user = {
            email: "userbaru2@mail.com",
            password: "password123",
            username: "userbaru",
        }
        const response = await request(app)
            .post("/employee")
            .set("Authorization", `Bearer ${access_token}`)
            .send(user);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("message");

    });
});

afterAll(async () => {
    await db.collection('User').deleteOne({
        email: "test@example.com"
    });
})