const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // ✅ Add bcrypt
const User = require("../models/User");

// POST /api/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // 4. Send response like login (auto-login)
    res.status(201).json({
      message: "User registered successfully.",
      isAdmin: newUser.userType === "admin",
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});


// ✅ SECURE LOGIN: bcrypt compare + isAdmin flag
router.post("/login", async (req, res) => {
  const { loginId, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: loginId }, { pacsId: loginId }],
    });

    if (!user) return res.status(400).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password); // ✅ bcrypt compare
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password." });

    res.status(200).json({
      message: "Login successful",
      isAdmin: user.userType === "admin", // ✅ For frontend routing
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = router;