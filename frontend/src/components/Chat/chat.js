import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container, Sidebar, ChatBox, MessagesContainer,
  Message, InputContainer, Input, SendButton, SidebarItem, NewChatButton
} from './chat.styles';
import CircularProgress from '@mui/material/CircularProgress';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  const navigate = useNavigate();

  // Fetch AI Response
  const fetchChatResponse = async (question, chatHistory) => {
    try {
      setLoading(true);
      // Format chat history to match Flask server expectations
      const formattedHistory = chatHistory.map(msg => ({
        type: msg.role,  // 'human' or 'ai'
        content: msg.content
      }));
      // Call Flask server using axios
      const response = await axios.post("http://localhost:5001/chat", {
        question,
        chat_history: formattedHistory
      });

      // const response = await fetch("http://localhost:5000/api/chat/chatResponse", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ question, chat_history: chatHistory })
      // });
      // const data = await response.json();
      setLoading(false);
    //   return data;
    // } catch (error) {
    //   console.error("Error fetching response:", error);
    //   setLoading(false);
    //   return { error: "Server error" };
    // }
    const { answer, sources } = response.data;
      if (answer) {
        return { answer, sources: sources || [] };
      } else {
        console.error("Unexpected response format:", response.data);
        return { error: "Unexpected response format" };
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setLoading(false);
      return { error: error.message || "Server error" };
    }
  };

  const fetchChats = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${user._id}`);
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };
  
  useEffect(() => {
    fetchChats();
  }, [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  const loadChat = async (chatId) => {
    setSelectedChatId(chatId);
    const res = await axios.get(`http://localhost:5000/api/chat/${user._id}/${chatId}`);
    setMessages(res.data);
  };

  // Handle Send Message Flow
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "human", content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");

    // Fetch AI Response first
    const response = await fetchChatResponse(input, messages);
    if (response.error) return;

    const aiMessage = { 
      role: "ai", 
      content: response.answer,
      sources: response.sources
    };
    setMessages(prevMessages => [...prevMessages, aiMessage]);

    // Save both messages together
    try {
      const saveResponse = await axios.post("http://localhost:5000/api/chat/save", {
        userId: user._id,
        chatId: selectedChatId,
        message: userMessage.content,
        aiResponse: aiMessage.content
      });

      // Only set selectedChatId if this is a new conversation
      if (!selectedChatId) {
        setSelectedChatId(saveResponse.data.chatId);
        fetchChats(); // Only fetch chats when creating a new conversation
      }
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  };

  const startNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
  };

  const groupedChats = {
    Today: [],
    "Last 7 Days": [],
    "Last 30 Days": [],
    Older: [],
  };

  chats.forEach((chat) => {
    const daysAgo = (Date.now() - new Date(chat.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysAgo < 1) groupedChats.Today.push(chat);
    else if (daysAgo < 7) groupedChats["Last 7 Days"].push(chat);
    else if (daysAgo < 30) groupedChats["Last 30 Days"].push(chat);
    else groupedChats.Older.push(chat);
  });

  return user ? (
    <Container>
      <Sidebar>
        <NewChatButton onClick={startNewChat}>+ New Chat</NewChatButton>
        {Object.entries(groupedChats).map(([label, chats]) =>
          chats.length > 0 && chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) && (
            <div key={label}>
              <h4>{label}</h4>
              {chats.map((chat) => (
                <SidebarItem key={chat._id} onClick={() => loadChat(chat._id)}>
                  {chat.title}
                </SidebarItem>
              ))}
            </div>
          )
        )}
      </Sidebar>

      <ChatBox>
        <MessagesContainer>
          {messages.map((msg, index) => (
            <Message key={index} isbot={msg.role === "ai" ? "true" : "false"}>{msg.content}</Message>
          ))}
          {loading && <CircularProgress size={24} style={{ margin: "10px auto", display: "block" }} />}
        </MessagesContainer>

        <InputContainer>
          <Input
            type="text"
            className="chat-box"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading} // Disable input while loading
          />
          <SendButton onClick={handleSendMessage} disabled={loading}>
            {loading ? "Loading..." : "Send"}
          </SendButton>
        </InputContainer>
      </ChatBox>
    </Container>
  ) : <p>Loading...</p>;
};

export default Chat;
