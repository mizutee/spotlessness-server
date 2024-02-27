const db = require("../db/config/mongodbConnection");
const { ObjectId } = require("mongodb");

module.exports = class Schedule {
  static async getAllSchedule() {
    const result = await db.collection("Schedule").find().toArray();

    return result;
  }

  static async getScheduleByUser(userId) {
    const result = await db
      .collection("Schedule")
      .find({
        userId: new ObjectId(String(userId)),
      })
      .toArray();

    return result;
  }

  static async getScheduleById(id) {
    const result = await db.collection("Schedule").findOne(
        {
            _id: new ObjectId(String(id))
        }
    )

    if(!result) throw {error: "Data not found", status: 400}

    return result
  }
};
