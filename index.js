const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./app/routes/appRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Bad Request" });
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
