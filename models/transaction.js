const snap = require("../db/config/midtransConnection");
const { ObjectId } = require("mongodb");
const db = require("../db/config/mongodbConnection");
const sendMessage = require("../helper/nodemailerFunction");
const fs = require("fs");

module.exports = class Transaction {
  static async createTransaction(service, userInfo) {
    if (service.length < 1) {
      throw { error: "Service is required!", status: 400 };
    }

    const instanceData = service.map((el) => {
      return {
        id: new ObjectId(String(el.id)),
        date: el.date,
        hour: el.hour,
      };
    });

    const serviceList = await db
      .collection("Service")
      .find({
        _id: { $in: [...new Set(instanceData.map((x) => x.id))] },
      })
      .toArray();

    const resultServiceList = serviceList.map((data, idx) => {
      return {
        ...data,
        date: instanceData[idx].date,
        hour: instanceData[idx].hour,
      };
    });

    let totalAmount = 0;

    resultServiceList.forEach((el) => {
      totalAmount += el.Price;
    });

    const { id } = userInfo;

    const currentDate = new Date();

    const expiredDate = new Date(currentDate);
    expiredDate.setHours(currentDate.getHours() + 1);

    const createTransaction = await db.collection("Transaction").insertOne({
      userId: new ObjectId(String(id)),
      serviceList: resultServiceList,
      status: "pending",
      amount: totalAmount,
      transactionDate: currentDate,
      transactionExpired: expiredDate,
      transactionIdMidtrans: null,
    });

    const parameter = {
      transaction_details: {
        order_id: createTransaction.insertedId,
        gross_amount: totalAmount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        email: userInfo.email,
        first_name: userInfo.username,
      },
      page_expiry: {
        duration: 1,
        unit: "hour",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    let transactionToken = transaction.token;

    const updateTransaction = await db.collection("Transaction").updateOne(
      {
        _id: createTransaction.insertedId,
      },
      {
        $set: {
          transactionIdMidtrans: transactionToken,
        },
      }
    );

    return {
      transactionToken,
      orderId: createTransaction.insertedId,
    };
  }

  static async updateTransaction(body) {
    if (
      body.transaction_status === "capture" &&
      body.fraud_status === "accept"
    ) {
      await db.collection("Transaction").updateOne(
        {
          _id: new ObjectId(String(body.order_id)),
        },
        {
          $set: {
            status: "success",
            paidDate: new Date(),
          },
        }
      );

      const transactionData = await db.collection("Transaction").findOne({
        _id: new ObjectId(String(body.order_id)),
      });

      const userData = await db.collection("User").findOne({
        _id: transactionData.userId,
      });

      const emailTemplate = fs.readFileSync(
        "../db/emailTemplate.html",
        "utf-8"
      );

      const renderedEmail = emailTemplate
        .replace("{{recipient_name}}", userData.username)
        .replace("{{order_id}}", transactionData._id);

      await sendMessage(renderedEmail, userData.email, 'Payment Invoice');

      const scheduleList = transactionData.serviceList;

      const resultSchedule = scheduleList.map((el) => {
        let scheduleDate = new Date(`${el.date}T${el.hour}:00`);
        return {
          serviceId: el._id,
          userId: transactionData.userId,
          Service: el.Service,
          Price: el.Price,
          ImageUrl: el.ImageUrl,
          Description: el.Description,
          status: "Ongoing",
          scheduleTime: scheduleDate,
        };
      });

      await db.collection("Schedule").insertMany(resultSchedule);

      return true;
    } else {
      return false;
    }
  }

  static async getAllTransaction() {
    const data = await db
      .collection("Transaction")
      .aggregate([
        {
          $lookup: {
            from: "User",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $lookup: {
            from: "Profile",
            localField: "userId",
            foreignField: "_id",
            as: "userProfile",
          },
        }
      ])
      .toArray();

    return data;
  }

  static async getTransactionById(id) {
    const data = await db.collection("Transaction").findOne({
      _id: new ObjectId(String(id)),
    });

    if (!data) throw { error: "Data not found", status: 400 };

    return data;
  }

  static async getSuccessTransaction() {
    const data = await db
      .collection("Transaction")
      .find({
        status: "success",
      })
      .toArray();

    return data;
  }

  static async getSuccessTransactionUser(id) {
    const data = await db
      .collection("Transaction")
      .find({
        userId: new ObjectId(String(id)),
      })
      .toArray();

    return data;
  }
};
