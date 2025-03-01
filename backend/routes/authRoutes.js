const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const dns = require("dns");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});
transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is ready to take messages");
  }
});

// Function to check if the email domain is valid
const isValidEmailDomain = (email) => {
  const domain = email.split("@")[1];
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) {
        reject(new Error("Invalid email domain"));
      } else {
        resolve(true);
      }
    });
  });
};

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Validate email domain
    await isValidEmailDomain(email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({email}, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Create and save user
    const newUser = new User({ email, password: hashedPassword, isVerified: false });
    await newUser.save();

    const verificationLink = `http://localhost:3000/verify-email/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      text: `Click the link to verify your email: ${verificationLink}. The link will expire in 24 hours.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Verification email sent! Please check your inbox." });

  } catch (err) {
    if (err.message === "Invalid email domain") {
      return res.status(400).json({ error: "Invalid email domain" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/verify-email', async (req, res) => {

  try {
    const {token} = req.query; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
  
    const user = await User.findOne({email});
  
    if (!user) {
      res.status(400).json({error: 'User not found'});
    }
    user.isVerified = true;
    await user.save();
    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
})

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.isVerified) {
      const token = jwt.sign({email}, process.env.JWT_SECRET, { expiresIn: "24h" });
      const verificationLink = `http://localhost:3000/verify-email/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        text: `Click the link to verify your email: ${verificationLink}. The link will expire in 24 hours.`,
      };
  
      await transporter.sendMail(mailOptions);
      return res.status(400).json({ error: "Your email is not verified. A verification email has been sent. please check your inbox." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({ user, token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Generate a password reset token (you can use JWT or any other method)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Create a reset link
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Send email with the reset link
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetLink}. The link will expire in 24 hours.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ error: "User not found" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
