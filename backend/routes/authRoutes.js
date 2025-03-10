const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const dns = require("dns");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

const router = express.Router();

const FRONTEND_URL = process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : process.env.LOCAL_URL;

// Configure CORS
router.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add security headers middleware
router.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Nodemailer configuration for Zoho
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', // Use smtp.zoho.in for Indian accounts
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER, // Your Zoho email address
    pass: process.env.EMAIL_PASS, // Your Zoho password or app-specific password
  },
  tls: {
    rejectUnauthorized: false // Helps with self-signed certificates
  },
  debug: true // Enable for detailed logs during development
});

// Verify SMTP connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
    console.log('Email Configuration:', {
      host: 'smtp.zoho.in',
      port: 465,
      user: process.env.EMAIL_USER,
      passProvided: !!process.env.EMAIL_PASS
    });
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Helper function to send emails with better error handling
const sendEmail = async (options) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        reject(error);
      } else {
        console.log('Email sent successfully:', info.messageId);
        resolve(info);
      }
    });
  });
};

// Test email route - add this to test your configuration
router.get("/test-email", async (req, res) => {
  try {
    const testMailOptions = {
      from: `"BhimGPT" <${process.env.EMAIL_USER}>`, // Format with name and email
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "Nodemailer Test with Zoho",
      text: "If you receive this email, your Nodemailer configuration with Zoho is working correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2196f3;">Nodemailer Test Successful!</h2>
          <p>If you're reading this, your email configuration is working correctly.</p>
          <p>You can now use this setup to send verification emails, password reset links, and other communications.</p>
          <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #2196f3;">
            <p style="margin: 0;">This is a test email from BhimGPT.</p>
          </div>
        </div>
      `
    };
    
    const info = await sendEmail(testMailOptions);
    res.json({ 
      success: true,
      message: "Test email sent successfully", 
      messageId: info.messageId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to send test email", 
      details: error.message
    });
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
router.use(limiter);

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

    const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: `"BhimGPT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - BhimGPT",
      text: `Click the link to verify your email: ${verificationLink}. The link will expire in 24 hours.`
    };

    try {
      await sendEmail(mailOptions);
      res.json({ message: "Verification email sent! Please check your inbox or spam folder." });
    } catch (emailError) {
      // Still create the user but inform about email issues
      console.error("Failed to send verification email:", emailError);
      res.status(201).json({ 
        message: "Account created but verification email could not be sent. Please contact support.",
        user: { email: newUser.email }
      });
    }

  } catch (err) {
    if (err.message === "Invalid email domain") {
      return res.status(400).json({ error: "Invalid email domain" });
    }
    console.error("Registration error:", err);
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
      const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;
      const mailOptions = {
        from: `"BhimGPT" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email - BhimGPT",
        text: `Click the link to verify your email: ${verificationLink}. The link will expire in 24 hours.`
      };
  
      await sendEmail(mailOptions);
      return res.status(400).json({ error: "Your email is not verified. A verification email has been sent. please check your inbox or spam folder." });
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
    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

    // Send email with the reset link
    const mailOptions = {
      from: `"BhimGPT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - BhimGPT",
      text: `Click the link to reset your password: ${resetLink}. The link will expire in 24 hours.`
    };

    await sendEmail(mailOptions);
    res.json({ message: "Password reset link sent to your email. Please check your inbox or spam folder." });
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
