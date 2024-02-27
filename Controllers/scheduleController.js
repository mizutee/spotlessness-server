const db = require("../db/config/mongodbConnection");
const { getAllSchedule, getScheduleByUser, getScheduleById } = require("../models/schedule");

module.exports = class ScheduleController {
  static async getAllSchedule(req, res, next) {
    try {
      const result = await getAllSchedule();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getScheduleByUser(req, res, next) {
    try {
        const {id} = req.user

        const result = await getScheduleByUser(id)

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
  }

  static async getScheduleById(req, res, next) {
    try {
        const {id} = req.params;

        const result = await getScheduleById(id);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
  }
};
