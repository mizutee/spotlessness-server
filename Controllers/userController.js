const db = require("../db/config/mongodbConnection");
const Profile = require("../models/profile");
const User = require("../models/users");

module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const register = await User.register(req.body);
      res.status(201).json({ message: "User has been created!" });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const login = await User.login(req.body);
      res.status(200).json({ access_token: login });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userData = req.user;
      const newPassword = req.body.newPassword;
      const oldPassword = req.body.oldPassword;
      const result = await User.changePassword(
        userData,
        oldPassword,
        newPassword
      );

      if (result.modifiedCount > 0) {
        return res.status(200).json({ message: "Password has been updated!" });
      }
    } catch (error) {
      next(error);
    }
  }

  // static async getUser(req, res, next) {
  //   try {
  //     const userData = await db.collection("User").find().toArray();
  //     console.log(userData, "<<< ini userdata");

  //     res.status(200).json(userData);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async getEmployee(req, res, next) {
    try {
      const result = await User.getEmployee();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addEmployee(req, res, next) {
    try {
      const result = await User.addEmployee(req.body);

      if (result) {
        return res.status(201).json({ message: "Employee has been added" });
      }
    } catch (error) {
      next(error);
    }
  }

  static async getTokenResetPassword(req, res, next) {
    console.log(req.body);
    console.log("masuk ke routingan");
    try {
      const result = await User.generateTokenResetPassword(req.body.email);

      res.status(201).json({ message: `Reset token: ${result.insertedId}` });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const token = req.params.token;
      const newPassword = req.body.password;
      const result = await User.resetPassword(token, newPassword);

      if (result) {
        res
          .status(200)
          .json({ message: "Password has been changed successfully" });
      }
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const token = req.params.token;
      console.log(token, "<< ini token dari controller");
      const result = await User.verifyEmail(token);

      res.status(200).json({ message: "User has been verified successfully!" });
    } catch (error) {
      next(error);
    }
  }
};
