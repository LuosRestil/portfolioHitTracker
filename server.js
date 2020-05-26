const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nunjucks = require("nunjucks");
const Hit = require("./models/hit");
const cors = require("cors");

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  cors({
    origin: "https://www.briansmithdev.com",
  })
);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Database connection successful!");
});

app.get("/", (req, res) => {
  Hit.find((err, hits) => {
    if (err) {
      return res.render("error.html");
    }
    if (hits.length > 0) {
      let hit = hits[0];
      return res.render("index.html", { hits: hit.hits });
    } else {
      return res.render("index.html", { hits: "no hits" });
    }
  });
});

app.post("/hit", (req, res) => {
  console.log("hit route...");
  // add hit to db
  console.log("querying db...");
  Hit.find((err, hits) => {
    if (err) {
      console.log("Error getting hits from db...");
      return res.status(400);
    }
    if (hits.length > 0) {
      console.log("Hits found...");
      let hit = hits[0];
      hit.hits += 1;
      hit.save((err, docs) => {
        if (err) {
          return res.status(400);
        }
      });
    } else {
      console.log("No hits found, creating hits for first time...");
      let hit = new Hit({ hits: 1 });
      hit.save((err, docs) => {
        if (err) {
          return res.status(400);
        }
      });
    }
  });
  console.log("returning status 200...");
  return res.status(200);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
const listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
