const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io');
const { initSocket } = require('./sockets/socket.js');
const http = require('http');
const mongoose = require('mongoose');
const Grid = require("gridfs-stream");

require('dotenv').config({ path: '../.env' });

const songRoutes = require('./routes/songRoute');
const artistRoutes = require('./routes/artistRoute');
const notifyRoutes = require("./routes/NotifyRoute.js");
const reportRoutes = require("./routes/ReportRoute.js");
const commentRoutes = require("./routes/CommentRoute.js");
const userRoutes = require('./routes/userRoute');
const followRoutes = require('./routes/followRoute');
const albumRoutes = require('./routes/albumRoute');
const playlistRoutes = require('./routes/playlistRoute');
const favoriteRoutes = require('./routes/favoriteRoute');
const connection = require("./config/db.js");

const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"], 
  }
});

app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"], 
  credentials: true, 
}));
let gfs;
connection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(bodyParser.json());

// Routes
app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/notifies', notifyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);

// Kết nối đến MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

const conn = mongoose.connection;
conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("audios");
});

// Khởi tạo socket
initSocket(io);

// Khởi động server
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port: ${process.env.PORT || 5000}`);
});
