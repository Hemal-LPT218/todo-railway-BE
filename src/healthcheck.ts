import http from "http";

const healthCheckUrl = process.env.HEALTH_CHECK_URL || "http://localhost:3000/health";

const options = {
  method: "GET",
  timeout: 2000,
};

const req = http.request(healthCheckUrl, options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on("error", () => {
  process.exit(1);
});

req.on("timeout", () => {
  req.destroy();
  process.exit(1);
});

req.end();
