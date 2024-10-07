/* eslint-disable no-console */
const http = require("http");

const { PORT = 80 } = process.env;

const options = {
  host: "0.0.0.0",
  port: PORT,
  timeout: 3000
};

const healthCheck = http.request(options, (res) => {
  console.log(`HEALTH CHECK STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on("error", (err) => {
  console.error("ERROR", err);
  process.exit(1);
});

healthCheck.end();
