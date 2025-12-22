const express=require('express');
const { getPosts } = require('../controller/posts');
const authMiddleware = require('../middlewares/authMiddleware');
const postRouter=express.Router()

postRouter.get('/getPosts',authMiddleware,getPosts)

module.exports=postRouter