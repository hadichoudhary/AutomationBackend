const jwt = require('jsonwebtoken')
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']
    console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. no token provided please login to continue"
        })
    }
    try {
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decodeToken)
        req.userInfo = decodeToken
        next()

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Access denied. no token provided please login to continue"
        })
    }

}

module.exports = authMiddleware