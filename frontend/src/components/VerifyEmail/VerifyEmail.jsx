import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Input, Button, SuccessMessage, TickIcon } from "../ResetPassword/ResetPassword.styles";
import { WarningIcon, WarningMessage } from "./VerifyEmail.styles";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setMessage(res.data.message);
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
      } catch (err) {
        alert("The verification link is invalid or has expired. Please log in and request a new one.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <Container>
      {success && (
        <div style={{ textAlign: "center" }}>
          <TickIcon>✔️</TickIcon>
          <SuccessMessage>{message}</SuccessMessage>
        </div>
      )}
    </Container>
  )
};

export default VerifyEmail;
