const { ObjectId } = require('mongodb');

const usersCollection = "users";

const checkExistUserByEmail = async (email, db) => {
  try {
    return await db.collection(usersCollection).findOne({ email });
  } catch (error) {
    console.error("Error checking user by email:", error);
    throw error;
  }
};

const createNewUser = async (user, db) => {
  try {
    return await db.collection(usersCollection).insertOne(user);
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
};

const getUserById = async (userId, db) => {
  try {
    return await db.collection(usersCollection).findOne({ _id: new ObjectId(userId) });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

module.exports = { checkExistUserByEmail, createNewUser, getUserById };
