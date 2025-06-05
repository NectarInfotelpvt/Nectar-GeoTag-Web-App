const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

/* ✅ CORS Middleware — allow requests from your frontend origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});*/
const cors = require("cors");


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


// ✅ Serve uploads folder statically so uploaded files can be accessed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Body parser middleware for JSON (supports large payloads)
app.use(express.json({ limit: "10mb" }));

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminDataDownloadFilter = require("./routes/adminDataDownloadFilter");



// ✅ Use Routes with /api prefix
app.use("/api", authRoutes);
app.use("/api", submissionRoutes);  // includes /api/erp-submission POST route
app.use("/api", adminRoutes);
app.use("/api/admin", adminDataDownloadFilter);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Nectar API is running...");
});

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
