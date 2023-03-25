const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongodb = require('mongodb');
var cors = require('cors')
const app = express();

app.use(cors({
  origin: '*'
}));

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    // credentials: true
  }
});

const secret = '7d8c06ed-70a1-4a6e-8748-f83c32acead0';
const mongoUrl = process.env.MONGO_URI;
console.log(mongoUrl);
const dbName = 'chat';
const usersCollection = 'users';
const messagesCollection = 'messages';

const mongoClient = new mongodb.MongoClient(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectToDatabase() {
  await mongoClient.connect();
  db = mongoClient.db(dbName);
}

app.use(express.json());

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await db.collection(usersCollection).findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = {
    name,
    email,
    password: hash,
  };

  await db.collection(usersCollection).insertOne(user);

  res.json({ message: 'User created successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.collection(usersCollection).findOne({ email });

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });

  res.json({ token });
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const decoded = jwt.verify(token, secret);
    const userId = new mongodb.ObjectId(decoded.id);
    const user = await db.collection(usersCollection).findOne({ _id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error(err);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`${socket.user.name} connected`);

  socket.join('chat');

  socket.on('message', async (text) => {
    const message = {
      userId: socket.user._id,
      text,
      timestamp: new Date(),
    };

    await db.collection(messagesCollection).insertOne(message);

    io.to('chat').emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.user.name} disconnected`);
  });
});

(async () => {
  await connectToDatabase();
  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
})();
