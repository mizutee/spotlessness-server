const Cart = require("../models/cart");

module.exports = class CartController {
  static async getCart(req, res, next) {
    try {
      const data = req.body;
      //   console.log(req.body);
      const result = await Cart.getCart(data);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
