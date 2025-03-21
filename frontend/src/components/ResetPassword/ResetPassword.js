import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import config from '../../config'; // Import config
import { Container, Form, Input, Button, SuccessMessage, TickIcon } from "./ResetPassword.styles";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${config.API_URL}/api/auth/reset-password`, { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <Container>
      {success ? (
        <div style={{ textAlign: "center" }}>
          <TickIcon>✔️</TickIcon>
          <SuccessMessage>Your password has been reset successfully!</SuccessMessage>
          <p>You can now close this page.</p>
        </div>
      ) : (
        <>
          <h2>Reset Password</h2>
          <Form onSubmit={handleResetPassword}>
            <Input type="password" placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} required />
            <Input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} required />
            <Button type="submit">Reset Password</Button>
          </Form>
        </>
      )}
    </Container>
  );
};

export default ResetPassword; 