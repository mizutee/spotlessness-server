
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


describe("Get Profile Test", () => {
    test.only("should get user profile successfully", async () => {
        const response = await request(app)
            .get("/profile")
            .set("Authorization", `Bearer ${access_token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("_id");
        expect(response.body).toHaveProperty("email");
        expect(response.body).toHaveProperty("role");
        // expect(response.body).toHaveProperty("userProfile", []);
    });
});