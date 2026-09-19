
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

    const authHeaders = req.headers.authorization;

    if(!authHeaders){
        return res.status(401).json({
            message : "Token is required"
        })
    }

    const token = authHeaders.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded;

        next();
    }

    catch(err){
         return res.status(401).json({
            message: "Invalid token"
        });
    }
}