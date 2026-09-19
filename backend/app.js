require("dotenv").config();

const express = require("express");
const cors = require("cors");

const sequelize = require("./utils/db");
const User = require("./models/userModels.js");
const userRoutes = require("./routes/userRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());   // ⭐ important

app.use("/user", userRoutes);

app.get("/", (req, res) => {
    res.send("Hello Chats");
});

sequelize.sync({ alter: true })
    .then(() => {
        console.log("Database is created...");
        console.log("Tables created");

        app.listen(process.env.PORT, () => {
            console.log(`Server is running at PORT ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("Database error:", err);
    });