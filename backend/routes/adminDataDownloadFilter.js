const express = require('express');
const router = express.Router();

// ✅ Import the Submission model correctly
const Submission = require('../models/Submission'); // adjust path if needed

// ✅ Get all unique districts
router.get("/unique-districts", async (req, res) => {
  try {
    const districts = await Submission.distinct("district");
    res.json(districts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch districts." });
  }
});

// ✅ Get all unique states
router.get("/unique-states", async (req, res) => {
  try {
    const states = await Submission.distinct("state");
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch states." });
  }
});

// ✅ Get all unique submitted dates
router.get("/unique-dates", async (req, res) => {
  try {
    const dates = await Submission.aggregate([
      {
        $project: {
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" }
          }
        }
      },
      { $group: { _id: "$dateOnly" } },
      { $sort: { _id: -1 } }
    ]);

    const dateList = dates.map((d) => d._id);
    res.json(dateList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dates." });
  }
});

// ✅ Export the router
module.exports = router;