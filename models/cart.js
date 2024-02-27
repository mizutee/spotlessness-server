const db = require("../db/config/mongodbConnection");
const {ObjectId} = require('mongodb');

module.exports = class Cart {
  static async getCart(data) {
    // console.log(data)
    const resultData = data.map((el) => {
      return new ObjectId(String(el.id));
    });
    const result = await db
      .collection("Service")
      .find({
        _id: { $in: resultData },
      })
      .toArray();

    return result;
  }
};
