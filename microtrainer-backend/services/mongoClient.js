/**
 * Optional MongoDB — connects when MONGODB_URI is set.
 * Persistence remains file-based until services opt into this client.
 */

let client = null;
let connecting = null;

async function initOptionalMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("ℹ️  MongoDB: MONGODB_URI not set (file-based storage only)");
    return null;
  }

  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const { MongoClient } = require("mongodb");
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      await client.db().admin().command({ ping: 1 });
      console.log("✅ MongoDB: connected");
      return client;
    } catch (e) {
      console.warn("⚠️  MongoDB: connection failed, continuing without DB:", e.message);
      client = null;
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

function getMongoClient() {
  return client;
}

module.exports = { initOptionalMongo, getMongoClient };
