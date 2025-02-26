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

export const SuccessMessage = styled.p`
  margin-top: 20px;
  font-size: 18px;
  color: #10a37f; // Green color for success message
`;

export const TickIcon = styled.span`
  font-size: 50px; // Size of the tick icon
  color: #10a37f; // Green color for the tick
`; 