const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("PATH: ", path.join(__dirname, '.env'))

const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
var cors = require("cors");
const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin: "*",
  })
);

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

const mongoClient = new mongodb.MongoClient(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectToDatabase() {
  await mongoClient.connect();
  db = mongoClient.db(process.env.MONGO_DB_NAME);
}

app.use(express.json());

// --
// Define collections name
const usersCollection = "users";
const messagesCollection = "messages";
const roomsCollection = "rooms";

// --

app.get("/api/", async (req, res) => {
  res.json({ message: "Chat API" });
})

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await db.collection(usersCollection).findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = {
    name,
    email,
    password: hash,
  };

  await db.collection(usersCollection).insertOne(user);

  res.json({ message: "User created successfully" });
});

app.post("/api/login", async (req, res) => {
  const { email, password, typeRoom, roomID } = req.body;

  const user = await db.collection(usersCollection).findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  let _room = "general";

  if(typeRoom === "room-id"){
    _room = (await db.collection(roomsCollection).findOne({ roomID }))?.roomID;
    if(!_room)
      return res.status(400).json({ message: "Room not exist" });
  }

  if(typeRoom === "new-room"){
    do {
      _room = makeid(8);
    }while (await db.collection(roomsCollection).findOne({ roomID: _room }));
    await db.collection(roomsCollection).insertOne({roomID: _room});
  }

  const token = jwt.sign({ id: user._id, room: _room }, process.env.API_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const decoded = jwt.verify(token, process.env.API_SECRET);
    const userId = new mongodb.ObjectId(decoded.id);
    const user = await db.collection(usersCollection).findOne({ _id: userId });
    if (!user) throw new Error("User not found");
    // const room = new mongodb.ObjectId(decoded.room);
    socket.user = user;
    socket.room = decoded.room;

    if(decoded.expiresIn < new Date())
      io.to(socket.room).emit("expired_session", socket.room);

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  console.log(`${socket.user.name} connected in ${socket.room}`);

  socket.join(socket.room);

  const history = (await db.collection(messagesCollection).find({room: socket.room }).toArray());

  io.to(socket.room).emit("room", socket.room);

  io.to(socket.room).emit("history", history);

  socket.on("message", async (text) => {
    const message = {
      userId: socket.user._id,
      userName: socket.user.name,
      room: socket.room,
      text,
      timestamp: new Date(),
    };

    await db.collection(messagesCollection).insertOne(message);

    io.to(socket.room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.user.name} disconnected`);
  });
});

(async () => {
  await connectToDatabase();
  server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
  });
})();


function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}


module.exports = app;