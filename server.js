const express = require("express");
const cors = require("cors");
const db = require("./models/index");
const bodyparser = require('body-parser');
const config = require('config');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

var corsOptions = {
  origin: "http://localhost:8080"
};

const PORT = process.env.PORT || 8080;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


app.get("/", (req, res) => {
  res.json({ message: "Welcome!" });
});

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

require("./routes/routes")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;