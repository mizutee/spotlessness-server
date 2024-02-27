const db = require("../db/config/mongodbConnection");
const Profile = require("../models/profile");

module.exports = class ProfileController {
  static async getProfile(req, res, next) {
    try {
      const result = await Profile.getUserProfile(req.user.email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async patchProfile(req, res, next) {
    try {
      const userData = await db.collection("User").findOne({
        email: req.user.email,
      });

      const data = {
        ...req.body,
        userId: userData._id,
      };

      const result = await Profile.patchProfile(data);

      if (result) {
        return res
          .status(201)
          .json({ message: "Profile has been created successfully!" });
      }
    } catch (error) {
      next(error);
    }
  }
};
