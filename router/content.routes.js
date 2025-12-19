const express = require("express");
const saveContentFromN8n = require("../controller/content.controller");

const router = express.Router();

router.post("/save-content", saveContentFromN8n);

module.exports = router;
