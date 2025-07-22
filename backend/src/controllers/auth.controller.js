import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../../mailtrap/emails.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  // ✅ Strong password regex
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // ✅ Username validation regex (letters, numbers, underscores only, 3–20 chars)
  const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_ ]{3,20}$/;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!usernameRegex.test(fullName)) {
      return res.status(400).json({
        message:
          "Username must be 3-20 characters and only include letters, numbers, and underscores",
      });
    }

    // continue hashing and saving...

    //hash passwords
    // ✅ Check password strength
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    // ✅ Check uniqueness of email and fullName
    const existingUser = await User.findOne({
      $or: [{ email }, { fullName }],
    });

    if (existingUser) {
      const msg =
        existingUser.email === email
          ? "Email already in use"
          : "Username already taken";
      return res.status(400).json({ success: false, message: msg });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await newUser.save();

    // ✅ Generate JWT cookie AFTER save (now _id is available)
    generateToken(newUser._id, res);

    // ✅ Try sending verification email
    try {
      await sendVerificationEmail(newUser.email, verificationToken);
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);
    }

    // ✅ Respond with user info
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  // 1 2 3 4 5 6
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,

      isVerified: user.isVerified,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, email } = req.body;
    const userId = req.user._id;

    if (!profilePic && !fullName && !email) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle profile picture
    if (profilePic) {
      try {
        console.log("Uploading to Cloudinary...");
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        user.profilePic = uploadResponse.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // Handle full name
    if (fullName) {
      user.fullName = fullName;
    }

    // Handle email change and re-verification
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      user.email = email;
      user.isVerified = false;
      user.verificationToken = verificationToken;
      user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (err) {
        console.error("Failed to send verification email:", err.message);
      }
    }

    await user.save();

    const io = req.app.get("io"); // if using app.set("io", io) in server.js

    io.emit("profileUpdated", {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    });

    // ✅ Send response back to the frontend
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("Error in update profile", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    //Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    //send email

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    //update password

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from the old password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in changePassword", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
