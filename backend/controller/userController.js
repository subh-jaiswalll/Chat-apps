const User = require("../models/userModels.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");


const createUser = async (req, res) => {

    const { name, email, number, password } = req.body;

    // 1. Check required fields
    if (!name || !email || !number || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    // 2. Validate name
    if (name.length < 3) {
        return res.status(400).json({
            message: "Name must be at least 3 characters"
        });
    }

    // 3. Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            message: "Enter a valid email"
        });
    }

    // 4. Validate phone
    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(number)) {
        return res.status(400).json({
            message: "Phone number must contain 10 digits"
        });
    }

    // 5. Validate password
    if (password.length < 4) {
        return res.status(400).json({
            message: "Password must be at least 4 characters"
        });
    }

    // 6. Check existing email
    const existingEmail = await User.findOne({
        where: {
            email: email
        }
    });

    if (existingEmail) {
        return res.status(400).json({
            message: "Email already registered"
        });
    }

    // 7. Check existing phone
    const existingPhone = await User.findOne({
        where: {
            number: number
        }
    });

    if (existingPhone) {
        return res.status(400).json({
            message: "Phone number already registered"
        });
    }

    // 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Create user
    const user = await User.create({
        name: name,
        email: email,
        number: number,
        password: hashedPassword
    });

    // 10. Send response
    res.status(201).json({
        message: "User created successfully"
    });
};


const loginUser = async (req, res) => {

    const { identifier, password } = req.body;

    // 1. Check fields
    if (!identifier || !password) {
        return res.status(400).json({
            message: "Email/Phone and password are required"
        });
    }

    // 2. Find user using email OR phone
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email: identifier },
                { number: identifier }
            ]
        }
    });

    // 3. Check user
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid password"
        });
    }

    // 5. Create JWT
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    // 6. Send response
    res.status(200).json({
        message: "Login successful",
        token: token
    });
};


const getProfile = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        number: user.number
    });
};

module.exports = {
    createUser,
    loginUser,
    getProfile
};