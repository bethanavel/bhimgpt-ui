import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from '../../config'; // Import config
import {
  Container, Sidebar, ChatBox, MessagesContainer,
  Message, InputContainer, Input, SendButton, SidebarItem, NewChatButton, SourcesContainer, SourcesTitle, SourcesList, SourceItem, ThreeDotMenu, DeleteButton,
  MenuButton, Overlay, Title, ChatContainer
} from './chat.styles';
import CircularProgress from '@mui/material/CircularProgress';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  const [showDelete, setShowDelete] = useState(null); // State to track which chat's delete button to show
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar
  const navigate = useNavigate();
  const deleteButtonRef = useRef(null); // Ref for the delete button

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

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
      const response = await axios.post(`${config.API_URL}/api/chat/chatResponse`, {
        question,
        chat_history: formattedHistory
      });
      setLoading(false);
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
      const res = await axios.get(`${config.API_URL}/api/chat/${user._id}`);
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
    try {
      const res = await axios.get(`${config.API_URL}/api/chat/${user._id}/${chatId}`);
      setSelectedChatId(chatId);
      setMessages(res.data);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
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

    try {
      // Check if selectedChatId is null, indicating a new chat
      let chatIdToSave = selectedChatId;

      // If it's a new chat, we need to create it first
      if (!chatIdToSave) {
        const newChatResponse = await axios.post(`${config.API_URL}/api/chat/save`, {
          userId: user._id,
          chatId: null, // Pass null for new chat creation
          message: userMessage.content,
          aiResponse: aiMessage.content,
          sources: response.sources
        });

        // Set the selectedChatId to the new chat ID returned from the response
        chatIdToSave = newChatResponse.data.chatId;
        setSelectedChatId(chatIdToSave);
        console.log("New chat created with ID:", chatIdToSave);
      } else {
        // If it's an existing chat, just update it
        await axios.post(`${config.API_URL}/api/chat/save`, {
          userId: user._id,
          chatId: chatIdToSave,
          message: userMessage.content,
          aiResponse: aiMessage.content,
          sources: response.sources
        });
      }

      // Fetch updated chat list
      await fetchChats();

    } catch (error) {
      console.error("Error saving messages:", error);
    }
  };

  // Start new chat function
  const startNewChat = () => {
    setSelectedChatId(null); // Reset selectedChatId for new chat
    setMessages([]); // Clear messages
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default behavior (like form submission)
      handleSendMessage(); // Call the send message function
    }
  };

  // Delete chat function
  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`${config.API_URL}/api/chat/${user._id}/${chatId}`);
      fetchChats();
      loadChat(chatId);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Hide delete button when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteButtonRef.current && !deleteButtonRef.current.contains(event.target)) {
        setShowDelete(null); // Hide delete button
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar when a chat is selected on mobile
  const handleChatSelect = (chatId) => {
    loadChat(chatId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Start new chat function with sidebar toggle for mobile
  const handleNewChat = () => {
    startNewChat();
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return user ? (
    <Container>
      <MenuButton onClick={toggleSidebar}>☰</MenuButton>
      <Overlay isOpen={sidebarOpen} onClick={handleOverlayClick} />
      
      <Sidebar isOpen={sidebarOpen}>
        <NewChatButton onClick={handleNewChat}>+ New Chat</NewChatButton>
        {Object.entries(groupedChats).map(([label, chats]) =>
          chats.length > 0 && chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) && (
            <div key={label}>
              <h4>{label}</h4>
              {chats.map((chat) => (
                <SidebarItem 
                  key={chat._id} 
                  onClick={() => handleChatSelect(chat._id)}
                >
                  {chat.title}
                  <ThreeDotMenu>
                    <span onClick={(e) => {
                      e.stopPropagation();
                      setShowDelete(chat._id);
                    }}>...</span>
                    {showDelete === chat._id && (
                      <DeleteButton 
                        ref={deleteButtonRef} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat._id);
                        }}
                      >
                        Delete
                      </DeleteButton>
                    )}
                  </ThreeDotMenu>
                </SidebarItem>
              ))}
            </div>
          )
        )}
      </Sidebar>

      <ChatContainer>
        <Title>BhimGPT</Title>
        <ChatBox>
          <MessagesContainer>
            {messages.map((msg, index) => (
              <Message key={index} isbot={msg.role === "ai" ? "true" : "false"}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>{msg.content}</div>
                  {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                    <SourcesContainer>
                      <SourcesTitle>Sources:</SourcesTitle>
                      <SourcesList>
                        {msg.sources.map((source, sourceIndex) => (
                          <SourceItem key={sourceIndex}>
                            <span>📚</span>
                            <a 
                              href={source.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{color: '#2196f3' }}
                            >
                              <span>
                                {source.file_name} 
                                {source.page !== 'N/A' ? ` - Page ${source.page}` : ''}
                              </span>
                            </a>
                          </SourceItem>
                        ))}
                      </SourcesList>
                    </SourcesContainer>
                  )}
                </div>
              </Message>
            ))}
            {loading && <CircularProgress size={24} style={{ margin: "10px auto", display: "block" }} />}
          </MessagesContainer>

          <InputContainer>
            <Input
              type="text"
              className="chat-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={loading}
            />
            <SendButton onClick={handleSendMessage} disabled={loading}>
              {loading ? "Loading..." : "Send"}
            </SendButton>
          </InputContainer>
        </ChatBox>
      </ChatContainer>
    </Container>
  ) : <p>Loading...</p>;
};

export default Chat;
