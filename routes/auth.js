const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    console.log("=== REGISTER REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Headers:", req.headers);

    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      console.log("Missing required fields:", {
        username: !!username,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Checking if user exists with email:", email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log("Hashing password...");
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new user...");
    // Create user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log("User registered successfully:", {
      id: user._id,
      username: user.username,
      email: user.email,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Headers:", req.headers);
    console.log("Content-Type:", req.headers["content-type"]);

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log("Missing required fields:", {
        email: !!email,
        password: !!password,
      });
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    console.log("Searching for user with email:", email);

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found:", {
      id: user._id,
      username: user.username,
      email: user.email,
    });
    console.log("Comparing passwords...");

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Password comparison failed for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Password match successful for user:", email);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log("JWT token created successfully");

    const responseData = {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    };

    console.log("Sending successful login response:", {
      token: token ? "***TOKEN_CREATED***" : "NO_TOKEN",
      user: responseData.user,
    });

    res.json(responseData);
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
