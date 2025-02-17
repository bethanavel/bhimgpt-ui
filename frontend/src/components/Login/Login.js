import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Input, Button, FooterText } from "./Login.styles";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      alert(res.data.message);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <Container>
      <h2>Login</h2>
      <Form onSubmit={handleLogin}>
        <Input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit">Login</Button>
      </Form>
      <FooterText>
        New to our platform? <Link to="/register">Sign up</Link>
      </FooterText>
    </Container>
  );
};

export default Login;