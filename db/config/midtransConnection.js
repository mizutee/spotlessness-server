const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.API_KEY_serverKey,
  clientKey: process.env.API_KEY_clientKey,
});

module.exports = snap;
