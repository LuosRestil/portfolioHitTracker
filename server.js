const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nunjucks = require("nunjucks");
const Hit = require("./models/hit");

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

var corsOptions = {
  origin: "https://www.briansmithdev.com",
  optionsSuccessStatus: 200,
};

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", cors(corsOptions), (req, res) => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  mongoose.connection.on("connected", () => {
    console.log("Database connection successful!");
  });

  Hit.find((err, hits) => {
    if (err) {
      mongoose.connection.close();
      res.render("error.html");
    }
    if (hits.length > 0) {
      let hit = hits[0];
      mongoose.connection.close();
      res.render("index.html", { hits: hit.hits });
    } else {
      mongoose.connection.close();
      res.render("index.html", { hits: "no hits" });
    }
  });
});

app.post("/hit", cors(corsOptions), (req, res) => {
  console.log("hit route...");
  // add hit to db
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  mongoose.connection.on("connected", () => {
    console.log("Database connection successful!");
  });

  console.log("querying db...");
  Hit.find((err, hits) => {
    if (err) {
      console.log("Error getting hits from db...");
      mongoose.connection.close();
      return res.status(400);
    }
    if (hits.length > 0) {
      console.log("Hits found...");
      let hit = hits[0];
      hit.hits += 1;
      hit.save((err, docs) => {
        if (err) {
          mongoose.connection.close();
          return res.status(400);
        }
        mongoose.connection.close();
      });
    } else {
      console.log("No hits found, creating hits for first time...");
      let hit = new Hit({ hits: 1 });
      hit.save((err, docs) => {
        if (err) {
          mongoose.connection.close();
          return res.status(400);
        }
        mongoose.connection.close();
      });
    }
  });
  return res.status(200);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
const listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
