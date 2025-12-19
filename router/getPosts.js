const express=require('express');
const { getPosts } = require('../controller/posts');
const postRouter=express.Router()

postRouter.get('/getPosts',getPosts)

module.exports=postRouter