const {linkedinCallback,getPlatformStatus,facebookCallback, disconnectPlatform}=require('../controller/platformController')
 const express=require('express');
const authMiddleware = require('../middlewares/authMiddleware');
 const platformRoutes=express.Router()

 platformRoutes.get('/linkedinCallback',linkedinCallback
 )
 platformRoutes.post('/facebookCallback', authMiddleware,facebookCallback);

 platformRoutes.get('/linkedinStatus',authMiddleware,getPlatformStatus)

 platformRoutes.patch(
  "/disconnect/:platform",
  authMiddleware,
  disconnectPlatform
);

 

 module.exports=platformRoutes