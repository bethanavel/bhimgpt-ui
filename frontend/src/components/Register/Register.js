import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Input, Button, ErrorMessage } from "./Register.styles";
import { FooterText } from '../Login/Login.styles'
import config from '../../config'; // Import config

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({email: "", password: "", confirmPassword: ""});
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!email) errors.email = "Please enter an email address";
    if (!password) errors.password = "Please enter a password";
    if (!confirmPassword) errors.confirmPassword = "Please enter a password";
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match!";
    }
    if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }
    try {
      const res = await axios.post(`${config.API_URL}/api/auth/register`, {
        email,
        password,
      });
      alert("A verification email has been sent. Please check your inbox.");
    } catch (errorResponse) {
      if (errorResponse?.response && errorResponse?.response?.data?.error) {
        alert(errorResponse?.response?.data?.error);
      }
      console.log(errorResponse);
    }
  };

  return (
    <Container>
      <h2>Register</h2>
      <Form onSubmit={handleRegister}>
        <Input type="email" placeholder="Email" onChange={(e) => {setEmail(e.target.value); setError({...error, email: ""});}} />
        {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
        <Input type="password" placeholder="Password" onChange={(e) => {setPassword(e.target.value); setError({...error, password: ""});}} />
        {error.password && <ErrorMessage>{error.password}</ErrorMessage>}
        <Input type="password" placeholder="Confirm Password" onChange={(e) => {setConfirmPassword(e.target.value); setError({...error, confirmPassword: ""});}} />
        {error.confirmPassword && <ErrorMessage>{error.confirmPassword}</ErrorMessage>}
        <Button type="submit">Register</Button>
      </Form>
      <FooterText>
        Already have an account? <Link to="/login">Log in</Link>
      </FooterText>
    </Container>
  );
};

export default Register;