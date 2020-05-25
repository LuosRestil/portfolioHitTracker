const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const HitSchema = new Schema({
  hits: { type: Number, required: true },
});

const Hit = mongoose.model("Hit", HitSchema);

module.exports = Issue;
