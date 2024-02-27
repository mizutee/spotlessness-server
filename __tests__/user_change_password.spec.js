
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
    })
});

describe("User Change Password Test", () => {
    test("should change user password successfully", async () => {
        // const user = {
        //     email: "testingserver@mail.com",
        //     password: "testingserver",
        // }
        const response = await request(app)
            .put("/change-password")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                oldPassword: "password123",
                newPassword: "password321"
            })

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message");

    });
});

afterAll(async () => {
    await db.collection('User').deleteOne({
        email: "test@example.com"
    });
})