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
  display: flex;
  justify-content: space-between;
  align-items: center;

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
`;

export const MessagesContainer = styled.div`
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

export const Input = styled.input`
  flex: 1;
  font-size: 16px;
  border: 1px solid rgb(221, 221, 221); 
  border-radius: 8px; 
  padding: 1rem;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s;

  &:focus {
    border-color: #2196f3;
  }
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

export const SourcesContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

export const SourcesTitle = styled.h4`
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
`;

export const SourcesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

export const SourceItem = styled.li`
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 14px;
  color: #333;

  span {
    margin-right: 5px;
  }

  &:hover {
    background-color: #e0e0e0;
    border-radius: 4px;
  }
`;

export const ThreeDotMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 24px;
  height: 24px;

  span {
    font-size: 20px;
    color: #333;
    margin-left: auto;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d32f2f;
  }
`;
