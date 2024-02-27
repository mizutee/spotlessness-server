const db = require("../db/config/mongodbConnection");
const bcrypt = require("bcrypt");
const validateEmail = require("../helper/emailValidator");
const jwt = require("jsonwebtoken");
const { comparePassword, hashPassword } = require("../helper/bcryptFunctions");
const { ObjectId } = require("mongodb");
const sendMessage = require("../helper/nodemailerFunction");
const fs = require("fs");

class User {
  static async register(form) {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 1);

    console.log(form, "<<< ini form");

    if (form.password.length < 8) {
      throw {
        error: "Password must be at least 8 characters long",
        status: 401,
      };
    }

    const validateEmailFormat = validateEmail(form.email);

    if (!validateEmailFormat)
      throw { error: "Invalid email format", status: 400 };

    const checkEmail = await db
      .collection("User")
      .find({
        email: form.email,
      })
      .toArray();

    if (checkEmail.length > 0) {
      throw { error: "Email already registered", status: 401 };
    }

    let formRegister = {
      ...form,
      password: bcrypt.hashSync(form.password, bcrypt.genSaltSync(8)),
      role: "user",
      status: "unverified",
    };

    const response = await db.collection("User").insertOne(formRegister);

    console.log(response, "<<< ini response");

    if (!response) throw { error: "Internal server error", status: 500 };

    const verifyRegisterToken = await db.collection("VerifyToken").findOne({
      userId: response.insertedId,
      status: "unclaimed",
    });

    console.log(verifyRegisterToken, "<<< ini verifytoken");

    if (verifyRegisterToken)
      throw {
        error: "Token already exist! please check your email!",
        status: 400,
      };

    const addToken = await db.collection("VerifyToken").insertOne({
      userId: response.insertedId,
      userEmail: form.email,
      status: "unclaimed",
      expirationDate: futureDate,
    });

    console.log(addToken, "<<< ini addtoken");

    const emailTemplate = fs.readFileSync("../db/verifyEmail.html", "utf-8");

    const sendEmailTemplate = emailTemplate.replace(
      "{{verify_link}}",
      `http://localhost:5173/verify-email/${addToken.insertedId}`
    );

    await sendMessage(
      sendEmailTemplate,
      form.email,
      "One more step to get yourself verified!"
    );

    return response;
  }

  static async login(form) {
    const validateEmailFormat = validateEmail(form.email);

    if (!validateEmailFormat) {
      throw { error: "Invalid email format!", status: 401 };
    }

    const userData = await db.collection("User").findOne({
      email: form.email,
    });

    if (!userData) {
      throw { error: "Email/Password is incorrect.", status: 401 };
    }

    if (
      (userData.status === "unverified" || !userData.status) &&
      userData.role === "user"
    )
      throw { error: "Please verify your email!", status: 400 };

    const validatePassword = comparePassword(form.password, userData.password);

    if (!validatePassword) {
      throw { error: "Email/Password is incorrect.", status: 401 };
    }

    const token = jwt.sign(
      {
        id: userData._id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
      },
      process.env.HASH_SECRET
    );

    return token;
  }

  static async changePassword(userData, oldPassword, newPassword) {
    const validateUser = await db
      .collection("User")
      .findOne({ email: userData.email });

    if (!validateUser) throw { error: "User not found!", status: 401 };

    const verifyOldPassword = comparePassword(
      oldPassword,
      validateUser.password
    );

    if (!verifyOldPassword)
      throw { error: "Old password is incorrect!", status: 401 };

    const verifyNewPassword = comparePassword(
      newPassword,
      validateUser.password
    );

    if (verifyNewPassword)
      throw {
        error: "New password cannot be the same as old password!",
        status: 401,
      };

    const updatePassword = await db.collection("User").updateOne(
      {
        email: userData.email,
      },
      {
        $set: {
          password: String(hashPassword(newPassword)),
        },
      }
    );

    if (updatePassword.modifiedCount === 0)
      throw { error: "Failed to change password", status: 400 };

    return updatePassword;
  }

  static async getEmployee() {
    const result = await db
      .collection("User")
      .aggregate([
        {
          $match: {
            role: "employee",
          },
        },
        {
          $lookup: {
            from: "Profile",
            localField: "_id",
            foreignField: "userId",
            as: "employeeProfile",
          },
        },
      ])
      .toArray();

    return result;
  }

  static async addEmployee(form) {
    const checkEmailFormat = form.email;

    if (!checkEmailFormat)
      throw { error: "Invalid email format!", status: 400 };

    if (!form.username) throw { error: "Username required!", status: 400 };

    if (!form.password) throw { error: "Password required!", status: 400 };

    form.password = hashPassword(form.password);
    form.role = "employee";

    const result = await db.collection("User").insertOne(form);

    return result;
  }

  static async generateTokenResetPassword(email) {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 1);

    const checkUserByEmail = await db.collection("User").findOne({
      email: email,
    });

    if (!checkUserByEmail)
      throw { error: "Email does not exist!", status: 400 };

    const checkExistingToken = await db.collection("ResetToken").findOne({
      userId: checkUserByEmail._id,
      status: "unclaimed",
    });

    if (checkExistingToken)
      throw {
        error: "Token already exist, please try again later",
        status: 400,
      };

    const result = await db.collection("ResetToken").insertOne({
      userId: checkUserByEmail._id,
      userEmail: checkUserByEmail.email,
      status: "unclaimed",
      expirationDate: futureDate,
    });

    const emailTemplate = fs.readFileSync("../db/resetPassword.html", "utf-8");

    const emailForSend = emailTemplate.replace(
      "{{link_resetpassword}}",
      `http://localhost:5173/resetPassword/${result.insertedId}`
    );

    await sendMessage(emailForSend, email, "Reset Password");

    return result;
  }

  static async resetPassword(token, password) {
    const validateValidToken = await db.collection("ResetToken").findOne({
      _id: new ObjectId(String(token)),
      status: "unclaimed",
    });

    if (!validateValidToken)
      throw { error: "Token does not exist!", status: 400 };

    await db.collection("User").updateOne(
      {
        email: validateValidToken.userEmail,
      },
      {
        $set: {
          password: hashPassword(password),
        },
      }
    );

    await db.collection("ResetToken").updateOne(
      {
        _id: new ObjectId(String(token)),
      },
      {
        $set: {
          status: "claimed",
        },
      }
    );

    return true;
  }

  static async verifyEmail(token) {
    const checkToken = await db.collection("VerifyToken").findOne({
      _id: new ObjectId(String(token)),
      status: "unclaimed",
    });

    if (!checkToken) throw { error: "Invalid Token!", status: 400 };

    const checkUser = await db.collection("User").findOne({
      email: checkToken.userEmail,
      status: "unverified",
    });

    if (!checkUser) throw { error: "No unverified user found!", status: 400 };

    const result = await db.collection("User").updateOne(
      {
        email: checkToken.userEmail,
      },
      {
        $set: {
          status: "verified",
        },
      }
    );

    const updateToken = await db.collection("VerifyToken").updateOne(
      {
        _id: new ObjectId(String(token)),
        status: "unclaimed",
      },
      {
        $set: {
          status: "claimed",
        },
      }
    );
    return result;
  }
}

module.exports = User;
