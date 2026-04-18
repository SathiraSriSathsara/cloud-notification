// src/routes/notification.routes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/notification.controller");

router.post("/send", controller.sendNotification);

module.exports = router;