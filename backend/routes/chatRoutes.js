const express = require("express");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const { ChatOpenAI } = require('@langchain/openai');
const router = express.Router();

const truncateMessage = (message, maxLength) => {
  if (message.length <= maxLength) return message;

  let truncated = message.substring(0, maxLength);
  let lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex !== -1) {
    truncated = truncated.substring(0, lastSpaceIndex); // Cut at the last space
  }

  return truncated + "...";
};

// Initialize LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4-1106-preview",
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7
});


router.post('/chatResponse', async (req, res) => {
  try {
    const { question, chat_history = [] } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const response = await llm.invoke([
      { role: "system", content: "Answer the user's query directly." },
      { role: "user", content: question }
    ]);

    // Prepare Response
    res.json({
      answer: response.content,
      chat_history: [...chat_history, 
        { type: "human", content: question }, 
        { type: "ai", content: response.content }
      ]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Save chat message
router.post("/save", async (req, res) => {
  const { userId, chatId, message, aiResponse } = req.body;

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
      // Create a new chat if chatId is not found or not provided
      selectedChat = {
        _id: new mongoose.Types.ObjectId(),
        title: truncateMessage(message, 32), // Use first few words as title
        messages: [],
        createdAt: new Date(),
      };
      chat.chats.push(selectedChat);
    }

    // Push messages to the selected chat
    // selectedChat.messages.push({ role: "user", content: message });
    // selectedChat.messages.push({ role: "bot", content: botResponse });
    let chatIndex = chat.chats.findIndex(c => c._id.toString() === selectedChat._id.toString());
    
    if (chatIndex !== -1) {
      chat.chats[chatIndex].messages.push({ role: "human", content: message });
      chat.chats[chatIndex].messages.push({ role: "ai", content: aiResponse });
    }

    await chat.save();
    res.json({ success: true, chat, chatId: selectedChat._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to save chat" });
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
    res.json(selectedChat ? selectedChat.messages : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve chat messages" });
  }
});



module.exports = router;
