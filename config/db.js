const mongoose = require('mongoose')
require('dotenv').config()

const dbConnection = async() => {
 await   mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Database Connected successfully'))
        .catch((e) => console.log('Database connection error')
        )
}

module.exports = dbConnection