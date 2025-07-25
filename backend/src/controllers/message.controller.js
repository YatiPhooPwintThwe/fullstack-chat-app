import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, getIO } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo ? await Message.findById(replyTo).lean() : null,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit("newMessage", newMessage);

    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Not found" });
    if (message.senderId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    message.text = req.body.text;
    message.edited = true;
    await message.save();
    res.json(message);
    // Emit updated message to the receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit("updatedMessage", message);
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
};

export const updateReaction = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { reaction: req.body.emoji },
      { new: true }
    ).lean();
    const senderId = message.senderId.toString();
    const receiverId = message.receiverId.toString();
    const io = getIO();

    // Emit to the receiver (if they are online)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      
      io.to(receiverSocketId).emit("updatedMessage", message);
    }

    // Emit to the sender too (if sender and receiver are different)
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("updatedMessage", message);
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Reaction failed" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Not found" });
    if (message.senderId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    await message.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
};
export const deleteChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.userId;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    });

    res.json({ message: "Chat deleted" });
  } catch (err) {
    console.error("Delete chat error", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
export const sendChatRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "User not found" });

    const alreadyRequested = receiver.chatRequests?.some(
      (r) => r.senderId.toString() === senderId.toString()
    );
    if (alreadyRequested)
      return res.status(400).json({ message: "Already requested" });

    receiver.chatRequests.push({ senderId });
    await receiver.save();

    // Emit chat request via socket
    const io = getIO();
    io.to(receiverId.toString()).emit("chatRequest", { senderId });

    res.status(200).json({ message: "Chat request sent" });
  } catch (err) {
    console.error("sendChatRequest error:", err.message);
    res.status(500).json({ message: "Failed to send chat request" });
  }
};

// ✅ Get chat requests
// controllers/user.controller.js
export const getChatRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("chatRequests.senderId", "fullName profilePic");

    const requests = user.chatRequests.map((r) => ({
      _id: r.senderId._id,
      fullName: r.senderId.fullName,
      profilePic: r.senderId.profilePic,
      createdAt: r.createdAt,
    }));

    res.status(200).json(requests);
  } catch (err) {
    console.error("getChatRequests error:", err.message);
    res.status(500).json({ message: "Failed to fetch chat requests" });
  }
};




// ✅ Accept chat request
export const acceptChatRequest = async (req, res) => {
  try {
    const receiver = await User.findById(req.user._id);
    receiver.chatRequests = receiver.chatRequests.filter(
      (r) => r.senderId.toString() !== req.params.senderId
    );
    await receiver.save();

    res.status(200).json({ message: "Request accepted" });
  } catch (err) {
    console.error("acceptChatRequest error:", err.message);
    res.status(500).json({ message: "Failed to accept chat request" });
  }
};







