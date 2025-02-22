const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  sources: [{
    file_name: String,
    page: String
  }],
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  title: String,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  chats: [chatSchema]
});

module.exports = mongoose.model("Chat", userChatSchema);
