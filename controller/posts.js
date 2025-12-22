const excel = require("../models/Excel")

const getPosts = async (req, res) => {
    
    const data = await excel.find()
    
    if (!data) {
        return res.status(400).json({
            success: false,
            message: "No data present please enter the data"
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Data fetch successfully',
        data: data
    })

}

module.exports = { getPosts }