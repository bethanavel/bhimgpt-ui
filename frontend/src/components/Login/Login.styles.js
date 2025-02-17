import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #343541;
  color: white;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
`;

export const Input = styled.input`
  padding: 10px;
  border: none;
  border-radius: 5px;
`;

export const Button = styled.button`
  padding: 10px;
  background-color: #10a37f;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
`;

export const FooterText = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: #ddd;
  a {
    color: #10a37f;
    text-decoration: none;
    font-weight: bold;
  }
  a:hover {
    text-decoration: underline;
  }
`;