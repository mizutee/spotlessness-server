const db = require("../db/config/mongodbConnection");
const { hashPassword } = require("../helper/bcryptFunctions");
const Service = require("../models/service");

module.exports = class ServiceController {
  // static async seeding(req, res, next) {
  //   try {
  //     console.log("masuk");
  //     const dataService = require("../../db/service.json");
  //     console.log(dataService.services, "<<< ini dataService");
  //     const result = await db.collection("Service").insertMany(dataService.services);

  //     const dataEmployee = require("../../db/empolyee.json");
  //     dataEmployee.forEach((el) => {
  //       el.password = hashPassword(el.password);
  //     });
  //     const result = await db.collection("User").insertMany(dataEmployee)
  //     if (result) {
  //       res.status(200).json(result);
  //     }

  //     await db.collection("User").insertOne({
  //       username: "pulu",
  //       email: "pulu@index.co",
  //       password: hashPassword('pulupulu')
  //     })
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async getService(req, res, next) {
    try {
      const result = await Service.getService();

      if (result) {
        res.status(200).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getServiceById(req, res, next) {
    try {
      const result = await Service.getServiceById(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addService(req, res, next) {
    console.log("masuk kesini");
    console.log(req.body);
    try {
      const result = await Service.addService(req.body);

      res.status(201).json({ message: "Service has been added!", status: 201 });
    } catch (error) {
      next(error);
    }
  }

  static async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Service.deleteService(id);

      if (result) {
        res.status(200).json({ message: "Service has been deleted!" });
      }
    } catch (error) {
      next(error);
    }
  }
};
