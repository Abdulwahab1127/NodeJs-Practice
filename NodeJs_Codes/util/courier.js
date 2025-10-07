const { CourierClient } = require("@trycourier/courier");

if (!process.env.COURIER_API_KEY) {
  throw new Error("Missing COURIER_API_KEY in environment variables");
}

const courier = new CourierClient({
  authorizationToken: process.env.COURIER_API_KEY
});

module.exports = courier;
