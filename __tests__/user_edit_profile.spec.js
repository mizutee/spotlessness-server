
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
        role: 'user'
    }
    user = await db.collection('User').insertOne(insertUser);
    access_token = signToken({
        id: user.insertedId,
        email: insertUser.email,
        username: insertUser.username,
        role: insertUser.role
    });
});


describe("Edit Profile Test", () => {
    test("should edit user profile successfully", async () => {
        const response = await request(app)
            .patch("/profile")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                email: "test@example.com",
                username: "testingexample"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("message");
    });
});