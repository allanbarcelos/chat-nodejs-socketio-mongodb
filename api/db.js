// db.js

const { MongoClient }  = require('mongodb');

const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDatabase() {
  try {
    await mongoClient.connect();
    return mongoClient.db(process.env.MONGO_DB_NAME);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };
