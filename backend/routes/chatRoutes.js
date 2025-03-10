const express = require("express");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const axios = require('axios');
const router = express.Router();

const FLASK_URL = process.env.NODE_ENV === 'production' ? process.env.FLASK_URL : 'https://deaa-103-109-45-113.ngrok-free.app';

const truncateMessage = (message, maxLength) => {
  if (message.length <= maxLength) return message;

  let truncated = message.substring(0, maxLength);
  let lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex !== -1) {
    truncated = truncated.substring(0, lastSpaceIndex); // Cut at the last space
  }

  return truncated + "...";
};


router.post('/chatResponse', async (req, res) => {
  try {
    const { question, chat_history = [] } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const response = await axios.post(`${FLASK_URL}/chat`, {
      question,
      chat_history
    });

    // Prepare Response
    res.json({
      answer: response.data.answer,
      chat_history: [...chat_history, response.data.chat_history],
      sources: response.data.sources
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Save chat message
router.post("/save", async (req, res) => {
  const { userId, chatId, message, aiResponse, sources } = req.body;

  try {
    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({ userId, chats: [] });
    }

    let selectedChat;
    if (chatId) {
      selectedChat = chat.chats.id(chatId);
    }

    if (!selectedChat) {
      // Create a new chat with both initial messages
      selectedChat = {
        _id: new mongoose.Types.ObjectId(),
        title: truncateMessage(message, 32),
        messages: [
          { role: "human", content: message }
        ],
        createdAt: new Date()
      };
      // Add AI response if it exists
      if (aiResponse) {
        selectedChat.messages.push({ 
          role: "ai", 
          content: aiResponse,
          sources: sources || [] // Save sources with AI message
        });
      }
      chat.chats.push(selectedChat);
    } else {
      // For existing chats
      const chatIndex = chat.chats.findIndex(c => c._id.toString() === chatId);
      if (chatIndex !== -1) {
        // Add both messages together
        chat.chats[chatIndex].messages.push({ role: "human", content: message });
        if (aiResponse) {
          chat.chats[chatIndex].messages.push({ 
            role: "ai", 
            content: aiResponse,
            sources: sources || [] // Save sources with AI message
          });
        }
      }
    }

    await chat.save();
    res.json({ success: true, chat, chatId: selectedChat._id });
  } catch (err) {
    console.error("Error saving chat:", err);
    res.status(500).json({ error: err.message || "Failed to save chat" });
  }
});


// Fetch all chat sessions for the user
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const chat = await Chat.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    res.json(chat ? chat.chats : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve chat history" });
  }
});

// Fetch a specific chat session
router.get("/:userId/:chatId", async (req, res) => {
  try {
    const { userId, chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid user ID or Chat ID" });
    }

    const chat = await Chat.findOne({ userId });
    const selectedChat = chat?.chats.id(chatId);
    
    // Return messages with sources
    res.json(selectedChat ? selectedChat.messages : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve chat messages" });
  }
});

// Delete a specific chat session
router.delete("/:userId/:chatId", async (req, res) => {
  try {
    const { userId, chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid user ID or Chat ID" });
    }

    // Find the user's chat document
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found for this user" });
    }

    // Remove the chat with the given chatId
    chat.chats = chat.chats.filter(chatItem => chatItem._id.toString() !== chatId);

    // Save the updated chat document
    await chat.save();

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

module.exports = router;
