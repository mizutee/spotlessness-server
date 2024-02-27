const db = require("../db/config/mongodbConnection");

class Profile {
  static async patchProfile(data) {
    const validateProfile = await db.collection("Profile").findOne({
      userId: data.userId,
    });

    if (validateProfile && data) {
      const updateProfile = await db.collection("Profile").updateOne(
        {
          userId: data.userId
        },
        {
          $set: {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            postalCode: data.postalCode,
            phoneNumber: data.phoneNumber,
            imageUrl: data.imageUrl
          }
        }
      )
      return updateProfile
    }

    if(!validateProfile) {
      const response = await db.collection("Profile").insertOne(data);
      return response;
    }

  }

  static async getUserProfile(data) {
    const userData = await db
      .collection("User")
      .aggregate([
        {
          $match: {
            email: data,
          },
        },
        {
          $lookup: {
            from: "Profile",
            localField: "_id",
            foreignField: "userId",
            as: "userProfile",
          },
        },
        {
          $project: {
            password: 0,
          },
        },
      ])
      .toArray();

    if (userData.length < 1) {
      throw { error: "User not found", status: 401 };
    }

    return userData[0];
  }
}

module.exports = Profile;
