import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Input, Button, ErrorMessage } from "./Register.styles";
import { FooterText } from '../Login/Login.styles'

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
      });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response.data.error || "Registration failed!");
    }
  };

  return (
    <Container>
      <h2>Register</h2>
      <Form onSubmit={handleRegister}>
        <Input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <Input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} required />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Register</Button>
      </Form>
      <FooterText>
        Already have an account? <Link to="/login">Log in</Link>
      </FooterText>
    </Container>
  );
};

export default Register;