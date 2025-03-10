import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Input, Button, FooterText, ForgotPasswordText } from "./Login.styles";
import { ErrorMessage } from "../Register/Register.styles";
import config from '../../config'; // Import config

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({email: "", password: ""});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!email) errors.email = "Please enter an email address";
    if (!password) errors.password = "Please enter a password";
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }
    try {
      const res = await axios.post(`${config.API_URL}/api/auth/login`, { email, password });
      alert(res.data.message);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError({...error, email: "Please enter an email address"});
      return;
    }
    try {
      const res = await axios.post(`${config.API_URL}/api/auth/forgot-password`, { email });
      alert(res.data.message);
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <Container>
      <h2>Login</h2>
      <Form onSubmit={handleLogin}>
        <Input type="email" placeholder="Email" onChange={(e) => {setEmail(e.target.value); setError({...error, email: ""});}} />
        {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
        <Input type="password" placeholder="Password" onChange={(e) => {setPassword(e.target.value); setError({...error, password: ""});}} />
        {error.password && <ErrorMessage>{error.password}</ErrorMessage>}
        <Button type="submit">Login</Button>
      </Form>
      <FooterText>
        New to our platform? <Link to="/register">Sign up</Link>
      </FooterText>
      <ForgotPasswordText>
        <Link onClick={handleForgotPassword}>Forgot Password?</Link>
      </ForgotPasswordText> 
    </Container>
  );
};

export default Login;