// src/services/push.service.js
const admin = require("../config/firebase");

exports.sendPush = async ({ token, title, body, data }) => {
  const message = {
    notification: { title, body },
    data: data || {},
    token,
  };

  return await admin.messaging().send(message);
};