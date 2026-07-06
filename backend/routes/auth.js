const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { store } = require("../data/store");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, governmentId, department, location } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    // Check if user already exists
    const existingUser = store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      governmentId: governmentId || "",
      department: department || "",
      location: location || "",
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user info (without password) and token
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authMiddleware, (req, res) => {
  const user = store.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword,
  });
});

module.exports = router;
