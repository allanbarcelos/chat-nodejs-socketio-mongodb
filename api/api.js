// api.js

const dotenv = require('dotenv');
const path = require('path');
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cron = require("node-cron");

const { connectToDatabase } = require("./db");
const { checkExistUserByEmail, createNewUser, getUserById } = require("./user");
const { makeid, sanitizeImage } = require("./utils");

const imageRegex = /\b(https?|ftp):\/\/[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|gif)\b|data:image\/(jpeg|png|gif);base64,[^\s]+\b/i;

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

(async () => {
  const db = await connectToDatabase();

  app.get("/api/", async (req, res) => {
    res.json({ message: "Chat API" });
  });

  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (await checkExistUserByEmail(email, db))
      return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hash,
    };

    await createNewUser(user, db);

    res.json({ message: "User created successfully" });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password, typeRoom, roomID } = req.body;

    const user = await checkExistUserByEmail(email, db);

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword)
      return res.status(400).json({ message: "Invalid email or password" });

    let _room = "general";

    if (typeRoom === "room-id") {
      _room = (await db.collection("rooms").findOne({ roomID }))?.roomID;
      if (!_room)
        return res.status(400).json({ message: "Room not exist" });
    }

    if (typeRoom === "new-room") {
      do {
        _room = makeid(8);
      } while (await db.collection("rooms").findOne({ roomID: _room }));
      await db.collection("rooms").insertOne({ roomID: _room });
    }

    const token = jwt.sign({ id: user._id, room: _room }, process.env.API_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      const { id, room, expiresIn } = jwt.verify(token, process.env.API_SECRET);
      const user = await getUserById(id, db);

      if (!user) throw new Error("User not found");

      socket.user = user;
      socket.room = room;

      if (expiresIn < new Date())
        io.to(socket.room).emit("expired_session", socket.room);

      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const { room, user } = socket;

    socket.join(room);

    const history = await db.collection("messages").find({ room: room }).toArray();

    io.to(room).emit("room", room);
    io.to(room).emit("history", history);

    socket.on("message", async (text) => {
      let imageUrl = text.match(imageRegex);

      if (imageUrl) {
        imageUrl = imageUrl[0];
        const sanitizedImage = await sanitizeImage(imageUrl);
        text = text.replace(imageRegex, ' ' + sanitizedImage + ' ');
      }

      const messageObj = {
        userId: user._id,
        userName: user.name,
        room,
        text,
        timestamp: new Date(),
      };

      await db.collection("messages").insertOne(messageObj);

      io.to(socket.room).emit("message", messageObj);
    });

    socket.on("disconnect", () => {
      console.log(`${socket.user.name} disconnected`);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // clean up messages
  cron.schedule('*/15 * * * *', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await db.collection("messages").deleteMany({ timestamp: { $lt: yesterday } });
  });
})();
