const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = 4000;
let db;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.put("/coupon", (req, res) => {
  // PUT /coupon - create a new coupon
  const { date, isRedeem } = req.body;
  const code = Math.floor(Math.random() * 9999 + 1000);
  db.collection("myFirstCollection")
    .insertOne({ date, isRedeem, code })
    .then((report) => {
      res.sendStatus(201).send(report.ops[0]);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(500);
    });
});
app.get("/coupon", (req, res) => {
  // GET /coupon - list all of the coupons
  db.collection("myFirstCollection")
    .find()
    .toArray()
    .then((users) => {
      res.send(users);
    });
});

app.get("/coupon/:id", (req, res) => {
  // GET /coupon/:id - return a coupon
  console.log(parseInt(req.params.id));
  db.collection("myFirstCollection")
    .findOne({ code: parseInt(req.params.id) })
    .then((coupon) => {
      if (!coupon) {
        res.sendStatus(404);
        return;
      }
      res.send(coupon);
    });
});

app.post("/coupon/:id", (req, res) => {
  //POST /coupon/:id - edit a coupon
  db.collection("myFirstCollection")
    .updateOne({ code: parseInt(req.params.id) }, { $set: req.body })
    .then((report) => {
      if (report.matchedCount === 0) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(200);
    });
});

app.delete("/coupon/:id", (req, res) => {
  // DELETE /coupon/:id - delete a coupon
  db.collection("myFirstCollection")
    .deleteOne({ code: parseInt(req.params.id) })
    .then((report) => {
      if (report.deletedCount === 0) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(204);
    });
});
app.post("/coupon/:id/redeem", (req, res) => { // POST /coupon/:id/redeem - Redeems the coupon code. If the coupon has been redeemed before already, return status code 400.
  db.collection("myFirstCollection")
    .findOne({ code: parseInt(req.params.id) })
    .then((coupon) => {
      let check = coupon;
      if (check.isRedeem === false) {
        db.collection("myFirstCollection").updateOne(
          { code: parseInt(req.params.id) },
          { $set: { isRedeem: true } }
        )
        
  res.sendStatus(200);;
      } else {
        res.sendStatus(404);
        return;
      }
    });

});

app.get("/coupon/search/:code", (req,res)=>{ // BONUS (Optional!): GET /coupon/search/:code - returns if a certain coupon code exists or not (200/404).
    db.collection("myFirstCollection")
    .findOne({ code: parseInt(req.params.code) })
    .then((coupon)=>{
        if (coupon===null){
            res.sendStatus(404);
        return;
        } else {
            res.sendStatus(200);
        }
    }
    )
})

const client = new MongoClient("mongodb://localhost:27017", {
  useUnifiedTopology: true,
});
client
  .connect()
  .then(() => {
    db = client.db("raphael_app");
    console.log("Connected to DB");
    app.listen(port, () => console.log(`Server listening on port ${port}!`));
  })
  .catch((e) => console.log("could not connect to MongoDB", e));