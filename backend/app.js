require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");

const { Server } = require("socket.io");

const sequelize = require("./utils/db");

const User = require("./models/userModels.js");
const Message = require("./models/messageModels.js");

const userRoutes = require("./routes/userRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");


const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());


// ========================================
// ROUTES
// ========================================

app.use("/user", userRoutes);

app.use("/message", messageRoutes);


// ========================================
// HOME ROUTE
// ========================================

app.get("/", function (req, res) {

    res.send("Hello Chats");

});


// ========================================
// CREATE HTTP SERVER
// ========================================

const server =
    http.createServer(app);


// ========================================
// CREATE SOCKET.IO SERVER
// ========================================

const io =
    new Server(server, {

        cors: {
            origin: "*"
        }

    });


// ========================================
// SOCKET.IO AUTHENTICATION
// ========================================

io.use(function (socket, next) {

    // Get JWT token

    const token =
        socket.handshake.auth.token;


    // Check token

    if (!token) {

        return next(
            new Error(
                "Authentication token is required"
            )
        );

    }


    try {

        // Verify JWT

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store decoded user information

        socket.user =
            decoded;


        // Authentication successful

        next();

    } catch (error) {

        next(
            new Error(
                "Invalid authentication token"
            )
        );

    }

});


// ========================================
// SOCKET.IO CONNECTION
// ========================================

io.on(
    "connection",
    function (socket) {

        console.log(
            "User connected:",
            socket.id
        );


        console.log(
            "User ID:",
            socket.user.id
        );


        console.log(
            "User Email:",
            socket.user.email
        );


        // ========================================
        // SEND MESSAGE
        // ========================================

        socket.on(
            "sendMessage",
            async function (data) {

                console.log(
                    "Message received:",
                    data.message
                );


                // Find authenticated user

                const user =
                    await User.findByPk(
                        socket.user.id
                    );


                if (!user) {

                    return;

                }


                // Save message

                const newMessage =
                    await Message.create({

                        userId:
                            socket.user.id,

                        message:
                            data.message

                    });


                // ========================================
                // SEND MESSAGE TO ALL CLIENTS
                // ========================================

                io.emit(
                    "newMessage",
                    {

                        id:
                            newMessage.id,

                        userId:
                            newMessage.userId,

                        userName:
                            user.name,

                        message:
                            newMessage.message,

                        createdAt:
                            newMessage.createdAt

                    }
                );

            }
        );


        // ========================================
        // DISCONNECT
        // ========================================

        socket.on(
            "disconnect",
            function () {

                console.log(
                    "User disconnected:",
                    socket.id
                );

            }
        );

    }
);


// ========================================
// DATABASE CONNECTION
// ========================================

sequelize
    .sync({ alter: true })

    .then(
        function () {

            console.log(
                "Database is connected"
            );


            console.log(
                "Tables created"
            );


            // Start server

            server.listen(
                process.env.PORT,
                function () {

                    console.log(
                        `Server is running at PORT ${process.env.PORT}`
                    );

                }
            );

        }
    )

    .catch(
        function (err) {

            console.log(
                "Database error:",
                err
            );

        }
    );
















// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const WebSocket = require("ws");

// const sequelize = require("./utils/db");
// const User = require("./models/userModels.js");
// const Message = require("./models/messageModels.js");

// const userRoutes = require("./routes/userRoutes.js");
// const messageRoutes = require("./routes/messageRoutes.js");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/user", userRoutes);
// app.use("/message", messageRoutes);

// app.get("/", (req, res) => {
//     res.send("Hello Chats");
// });


// // Create HTTP server

// const server = http.createServer(app);


// // Create WebSocket server

// const wss = new WebSocket.Server({
//     server: server
// });


// // WebSocket connection

// wss.on("connection", function (socket) {

//     console.log("User connected");

    
//     socket.on("message", async function (data) {

//         const messageData =
//             JSON.parse(data);


//         const newMessage =
//             await Message.create({
//                 userId: messageData.userId,
//                 message: messageData.message
//             });


//         // Send message to all connected users

//         wss.clients.forEach(function (client) {

//             if (client.readyState === WebSocket.OPEN) {

//                 client.send(
//                     JSON.stringify({
//                         id: newMessage.id,
//                         userId: newMessage.userId,
//                         message: newMessage.message,
//                         createdAt: newMessage.createdAt
//                     })
//                 );

//             }

//         });

//     });


//     socket.on("close", function () {

//         console.log("User disconnected");

//     });

// });


// sequelize.sync({ alter: true })
//     .then(() => {

//         console.log("Database is connected");
//         console.log("Tables created");


//         server.listen(
//             process.env.PORT,
//             function () {

//                 console.log(
//                     `Server is running at PORT ${process.env.PORT}`
//                 );

//             }
//         );

//     })
//     .catch(function (err) {

//         console.log(
//             "Database error:",
//             err
//         );

//     });