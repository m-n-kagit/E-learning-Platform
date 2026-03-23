const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────────
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    // ── Duplicate Check ───────────────────────────────────────────────────────
    // Check BEFORE trying to save — avoids a DB write on duplicates
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409); // 409 Conflict — more semantically correct than 400
      throw new Error("An account with this email already exists");
    }

    // ── Create User ───────────────────────────────────────────────────────────
    // Password gets hashed automatically via pre-save hook in User model
    const user = await User.create({ name, email, password });

    // ── Response ──────────────────────────────────────────────────────────────
    // Return user data + JWT. Never return the password (select:false handles DB level,
    // but we never include it here either).
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────────
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    // ── Find User ─────────────────────────────────────────────────────────────
    // We use .select("+password") because the schema has select:false by default
    const user = await User.findOne({ email }).select("+password");

    // ── Verify Credentials ────────────────────────────────────────────────────
    // IMPORTANT: Always check BOTH user existence AND password in one condition.
    // This prevents timing-based user enumeration attacks.
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // ── Response ──────────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected route — requires JWT)
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware after token verification
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe };
