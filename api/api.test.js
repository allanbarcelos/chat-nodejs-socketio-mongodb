const request = require("supertest");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const app = require("./api");

jest.mock("mongodb");
jest.mock("bcryptjs");

describe("Registration endpoint", () => {
  let db;
  let collection;

  beforeAll(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
    };

    mongodb.MongoClient.mockReturnValue({
      connect: jest.fn().mockResolvedValue(),
      db: jest.fn().mockReturnValue(db),
    });

    collection = db.collection.mockReturnValue(db);
    bcrypt.hash.mockResolvedValue("hashedPassword");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an error if user already exists", async () => {
    db.findOne.mockResolvedValue({ email: "test@example.com" });

    const response = await request(app)
      .post("/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
    expect(db.collection).toBeCalledWith("users");
    expect(db.findOne).toBeCalledWith({ email: "test@example.com" });
    expect(db.insertOne).not.toBeCalled();
    expect(bcrypt.hash).not.toBeCalled();
  });

  it("registers a new user", async () => {
    db.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User created successfully");
    expect(db.collection).toBeCalledWith("users");
    expect(db.findOne).toBeCalledWith({ email: "test@example.com" });
    expect(bcrypt.hash).toBeCalledWith("password", 10);
    expect(db.insertOne).toBeCalledWith({
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
    });
  });
});
