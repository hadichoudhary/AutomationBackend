const express=require('express')
const {postUpdate,postUpdateForfacebook, Approve, draftPost} = require('../controller/customN8nController')
const customRoute=express.Router()

customRoute.post('/linkdlnPostUpdate',postUpdate)
customRoute.post('/facebookPostUpdate',postUpdateForfacebook)
customRoute.post('/statusApprove',Approve)
customRoute.post('/status',draftPost)

module.exports=customRoute