import User from "../models/user.model.js";

export const searchUsers = async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);

  try {
    const users = await User.find({
      fullName: { $regex: query, $options: "i" },
    }).select("_id fullName profilePic lastSeen"); // Send only needed fields

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ message: "Failed to search users" });
  }
};
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("getUserById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
