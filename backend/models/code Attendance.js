const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  dccb: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  photo: {
    type: String, // Will store base64 or image URL
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
