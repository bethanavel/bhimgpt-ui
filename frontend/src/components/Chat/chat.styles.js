import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f0f0f0;
`;

export const Sidebar = styled.div`
  width: 300px;
  background-color: #ffffff;
  padding: 20px;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const NewChatButton = styled.button`
  background-color: #2196f3;
  color: white;
  font-size: 16px;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: 0.3s;

  &:hover {
    background-color: #1976d2;
  }
`;

export const SidebarItem = styled.div`
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  background: #f8f9fa;
  margin-bottom: 5px;
  transition: 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

export const ChatBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  padding: 1rem 3rem;
  overflow-y: auto;
  align-items: center;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content; center;
  flex-wrap: wrap;
`;

export const Message = styled.div`
  width: fit-content;
  max-width: 700px;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  background-color: ${({ isbot }) => (isbot === "true" ? "#e0e0e0" : "#2196f3")};
  color: ${({ isbot }) => (isbot === "true" ? "#333" : "#fff")};
`;

export const InputContainer = styled.div`
  display: flex;
  padding: 20px;
  background-color: #fff;
  width: 70%;
`;

export const Input = styled.input`
  flex: 1;
  font-size: 16px;
  border: 1px solid rgb(221, 221, 221); 
  border-radius: 8px; 
  padding: 1rem;
  outline: none;
`;

export const SendButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 10px 24px;
  margin-left: 8px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 6px;
  transition: 0.3s;

  &:hover {
    background-color: #1976d2;
  }
`;
