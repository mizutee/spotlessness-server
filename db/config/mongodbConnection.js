require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URL;
    
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = process.env.NODE_ENV === "test" ? client.db("FinalProjectTest") : client.db("FinalProject");

module.exports = db
