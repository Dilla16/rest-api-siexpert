const cors = require("cors");

const corsOptions = {
  origin: "*", // Adjust this to specify which domains can access your API
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

module.exports = cors(corsOptions);
