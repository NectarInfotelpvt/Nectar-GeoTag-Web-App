const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  label: String,
  url: String
});

const submissionSchema = new mongoose.Schema({
  erpId: { type: String, required: true },
  dccb: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  locationName: String,
  latitude: Number,
  longitude: Number,
  photos: [
  {
    url: String,
    label: String,
  }
],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Submission", submissionSchema);