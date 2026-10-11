require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const { Server } = require("socket.io");

const sequelize = require("./utils/db.js");

const userRoutes = require("./routes/userRoutes.js");

const messageRoutes = require("./routes/messageRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");


const setupSocket = require("./socket.io/index.js");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);

app.use("/message", messageRoutes);

app.use("/group", groupRoutes);

app.use("/ai", aiRoutes);


app.get("/", function (req, res) {
  res.send("Hello Chats");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupSocket(io);

sequelize
  .sync()

  .then(function () {
    console.log("Database is connected");

    console.log("Tables created");

    server.listen(process.env.PORT, function () {
      console.log(`Server is running at PORT ${process.env.PORT}`);
    });
  })

  .catch(function (err) {
    console.log("Database error:", err);
  });

