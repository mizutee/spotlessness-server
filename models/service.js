const db = require("../db/config/mongodbConnection");
const { ObjectId } = require("mongodb");

module.exports = class Service {
  static async getService() {
    const result = db.collection("Service").find().toArray();
    return result;
  }

  static async getServiceById(id) {
    const result = await db.collection("Service").findOne({
      _id: new ObjectId(String(id)),
    });

    if (result) {
      return result;
    }
  }

  static async addService(formData) {
    const result = await db.collection("Service").insertOne({
      Service: formData.Service,
      Price: formData.Price,
      ImageUrl: formData.ImageUrl,
      Description: formData.Description,
    });

    return result;
  }

  static async deleteService(id) {
    const result = await db.collection("Service").deleteOne({
      _id: new ObjectId(String(id)),
    });

    if (!result) throw { error: "Service not found!", status: 400 };

    return result;
  }
};
