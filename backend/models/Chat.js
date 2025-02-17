const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: String, // "user" or "bot"
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chats: [
    {
      title: String, // Chat title for sidebar
      messages: [messageSchema], // Array of messages
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
