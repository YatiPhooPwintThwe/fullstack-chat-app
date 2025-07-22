import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
    },

    profilePic: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: null,
    },
   

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

    // ✅ Chat Requests array goes here
    chatRequests: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
