const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const multer = require("multer");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Multer storage for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Helper to format photos into CSV string
const formatPhotoArray = (photos) => {
  if (!Array.isArray(photos)) return "";
  return photos.map((photo) => `${photo.label}: ${photo.url}`).join(" | ");
};



// Image download proxy route
router.get("/download-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).send("Image URL is required.");
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const filename = imageUrl.split("/").pop().split("?")[0];
    const contentType = response.headers["content-type"] || "image/jpeg";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    console.error("Download error:", error.message);
    res.status(500).send("Failed to download image.");
  }
});


// ✅ POST new submission
router.post("/erp-submission", upload.array("photos", 6), async (req, res) => {
  try {
    const { erpId, dccb, district, state, latitude, longitude, locationName, photoLabels = [] } = req.body;

    // Validate required fields
    if (!erpId || !dccb || !district || !state || req.files.length < 6) {
      return res.status(400).json({ message: "All fields and 6 photos are required." });
    }

    // Build photo paths with labels
    const photoPaths = req.files.map((file, index) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      label: Array.isArray(photoLabels) ? photoLabels[index] : `Photo ${index + 1}`,
    }));

    // Create and save submission
    const submission = new Submission({
      erpId,
      dccb,
      district,
      state,
      locationName,
      latitude,
      longitude,
      submittedAt: new Date(),
      photos: photoPaths,
    });

    await submission.save();
    res.status(201).json({ message: "Submission saved successfully." });

  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ message: "Server error during submission." });
  }
});


// ✅ Get all submissions
router.get("/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ submittedAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
});

// ✅ Get submissions by ERP ID
router.get("/submissions/:erpId", async (req, res) => {
  try {
    const submissions = await Submission.find({ erpId: req.params.erpId });
    if (!submissions.length) {
      return res.status(404).json({ message: "No submissions found." });
    }
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ERP submissions." });
  }
});

  // ✅ CSV Download (Admin) with direct image download URLs and filter support
router.get("/admin/download-submissions", async (req, res) => {
  try {
    const { district, state, date } = req.query;

    // ✅ Build filter object
    const filter = {};
    if (district) filter.district = district;
    if (state) filter.state = state;
    if (date) {
  const start = new Date(date); // 2024-06-01T00:00:00Z
  const end = new Date(date);
  end.setDate(end.getDate() + 1); // 2024-06-02T00:00:00Z

  filter.submittedAt = { $gte: start, $lt: end }; // ✅ date range filter
}


    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });

    const downloadBase = `${req.protocol}://${req.get("host")}/api/download-image?url=`;

    // ✅ Gather all unique photo labels
    const photoLabels = new Set();
    submissions.forEach((sub) => {
      sub.photos.forEach((photo, i) =>
        photoLabels.add(photo.label || `Photo ${i + 1}`)
      );
    });

    const fields = [
      "erpId", "dccb", "district", "state", "locationName",
      "submittedAt", "latitude", "longitude", ...photoLabels
    ];

    const formatted = submissions.map((sub) => {
      const base = {
        erpId: sub.erpId,
        dccb: sub.dccb,
        district: sub.district,
        state: sub.state,
        locationName: sub.locationName,
        submittedAt: sub.submittedAt,
        latitude: sub.latitude,
        longitude: sub.longitude,
      };

      sub.photos.forEach((photo, i) => {
        const label = photo.label || `Photo ${i + 1}`;
        const downloadUrl = `${downloadBase}${encodeURIComponent(photo.url || "")}`;
        base[label] = downloadUrl;
      });

      return base;
    });

    const csv = new Parser({ fields: Array.from(fields) }).parse(formatted);

    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, `Filtered_ERP_Submissions.csv`);

    fs.writeFileSync(filePath, csv);
    res.setHeader("Content-Disposition", `attachment; filename=Filtered_ERP_Submissions.csv`);
    res.setHeader("Content-Type", "text/csv");

    res.sendFile(filePath, (err) => {
      if (!err) fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error("Download Filtered Submissions CSV error:", err);
    res.status(500).json({ message: "Failed to generate CSV." });
  }
});


// ✅ CSV Download by ERP ID
router.get("/admin/download-submissions/:erpId", async (req, res) => {
  try {
    const { erpId } = req.params;
    const submissions = await Submission.find({ erpId }).sort({ submittedAt: -1 });

    if (!submissions.length) {
      return res.status(404).json({ message: "No submissions found for this ERP ID." });
    }

    const formatted = submissions.map((item) => ({
      erpId: item.erpId,
      dccb: item.dccb,
      district: item.district,
      state: item.state,
      locationName: item.locationName,
      submittedAt: item.submittedAt,
      latitude: item.latitude,
      longitude: item.longitude,
      photos: formatPhotoArray(item.photos),
    }));

    const fields = [
      "erpId", "dccb", "district", "state", "locationName",
      "submittedAt", "latitude", "longitude", "photos"
    ];
    const csv = new Parser({ fields }).parse(formatted);

    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, `${erpId}_ERP_Submissions.csv`);

    fs.writeFileSync(filePath, csv);
    res.setHeader("Content-Disposition", `attachment; filename=${erpId}_ERP_Submissions.csv`);
    res.setHeader("Content-Type", "text/csv");

    res.sendFile(filePath, (err) => {
      if (!err) fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error("Download ERP CSV error:", err);
    res.status(500).json({ message: "Failed to generate CSV for ERP." });
  }
});

// ✅ Image download proxy route
router.get("/api/download-image", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send("No image URL provided");

  try {
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    const filename = imageUrl.split("/").pop().split("?")[0] || "image.jpg";
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

    response.data.pipe(res);
  } catch (err) {
    console.error("Image Download Proxy Error:", err.message);
    res.status(500).send("Failed to download image");
  }
});

module.exports = router;
