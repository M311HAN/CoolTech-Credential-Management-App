import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

// Import Boostrap components.
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export default function Login({ setUserData, setIsLoggedIn }) {
  // ---------- Set States ----------
  // For login/register credentials.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // For error messages.
  const [error, setError] = useState();

  // Boolean state for switching between login and register forms.
  const [signIn, setSignIn] = useState(true);

  // Effect to clear the error message after 3 seconds.
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear the error after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount or when error changes
    }
  }, [error]);

  // ---------- Handle Login ----------
  const handleLogin = async (e) => {
    e.preventDefault();

    let userCredentials = {
      username: username,
      password: password,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    };

    try {
      const response = await fetch(
        "http://localhost:3001/login",
        requestOptions
      );
      const jsonData = await response.json();

      if (!response.ok) {
        setError(jsonData.message || "Invalid credentials. Please try again.");
        toast.error("Invalid credentials. Please try again.");
        return;
      }

      if (jsonData.message.includes("Login successful")) {
        setError(null); // Clear the UI error message
        setIsLoggedIn(true);

        // If login is successful and a token is present
        if (jsonData.token) {
          const token = jsonData.token.split(" ")[1]; // Extract just the token part from 'Bearer <token>'

          // Decode the token to extract the user data
          const decodedToken = jwtDecode(token);

          // Save the token and decoded user data in both localStorage and state
          localStorage.setItem("token", token); // Save token in localStorage
          localStorage.setItem("username", decodedToken.username); // Save username in localStorage
          localStorage.setItem("role", decodedToken.role); // Save role in localStorage

          // Set user data in state
          setUserData({
            token: token,
            username: decodedToken.username,
            role: decodedToken.role,
          });

          toast.success("Login successful!");
        }
      } else {
        setError(jsonData.message || "Something went wrong. Please try again.");
        toast.error(
          jsonData.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    // Check localStorage for token and user data
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (token && username && role) {
      // Set the user data in state if it exists in localStorage
      setUserData({
        token: token,
        username: username,
        role: role,
      });
      setIsLoggedIn(true); // Mark the user as logged in
    }
  }, [setIsLoggedIn, setUserData]); // Add these as dependencies

  // ---------- Handle Register ----------
  const handleRegister = async (e) => {
    e.preventDefault();

    let userCredentials = {
      username,
      password,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    };

    try {
      const response = await fetch(
        "http://localhost:3001/register",
        requestOptions
      );
      const jsonRegisterData = await response.json();

      if (!response.ok) {
        setError(
          jsonRegisterData.message ||
            "Registration failed. Please check your input."
        );
        toast.error("Registration failed. Please check your input.");
        return;
      }

      // Set logged in state and user data on successful registration.
      setError(null);
      setIsLoggedIn(true);

      // If registration is successful and a token is present
      if (jsonRegisterData.token) {
        const token = jsonRegisterData.token.split(" ")[1]; // Extract just the token part from 'Bearer <token>'

        // Decode the token to extract the user data
        const decodedToken = jwtDecode(token);

        // Save the token and decoded user data in both localStorage and state
        localStorage.setItem("token", token); // Save token in localStorage
        localStorage.setItem("username", decodedToken.username); // Save username in localStorage
        localStorage.setItem("role", decodedToken.role); // Save role in localStorage

        // Set user data in state
        setUserData({
          token: token,
          username: decodedToken.username,
          role: decodedToken.role,
        });
      } else {
        setUserData(jsonRegisterData); // Fallback in case the token format is unexpected
      }

      toast.success("Registration successful!");
    } catch (error) {
      console.error("Error:", error.message);
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    }
  };

  // If signIn state is true, return the login form.
  if (signIn) {
    return (
      <div className="py-5 my-5" id="login">
        <Container className="loginForm mx-auto w-50">
          <p className="text-center my-3 py-3 fw-bold">
            Please login to your account:
          </p>
          <Form onSubmit={handleLogin}>
            {/* Username input */}
            <Form.Group
              as={Row}
              className="justify-content-center"
              controlId="formUsername"
            >
              <Form.Label column sm={3}>
                Username:
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="text"
                  name="username"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  required
                />
              </Col>
            </Form.Group>

            {/* Password input */}
            <Form.Group
              as={Row}
              className="my-3 pt-2 justify-content-center"
              controlId="formPassword"
            >
              <Form.Label column sm={3}>
                Password:
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </Col>
            </Form.Group>

            {/* Log in button and Register option */}
            <Form.Group as={Row} className="my-3 justify-content-center">
              <Col sm={{ span: 6 }}>
                <Button
                  type="submit"
                  className="my-4 loginButton"
                  style={{ cursor: "pointer" }}
                >
                  LOG IN
                </Button>
                <p
                  onClick={() => setSignIn(false)}
                  style={{ cursor: "pointer" }}
                >
                  Register
                </p>

                {/* When error state is true, display error message */}
                {error && (
                  <Container className="error border border-danger border-2">
                    <Row>
                      <Col>
                        <p>{error}</p>
                      </Col>
                    </Row>
                  </Container>
                )}
              </Col>
            </Form.Group>
          </Form>
        </Container>
      </div>
    );
  } else {
    // If signIn state is false, return the register form.
    return (
      <div className="py-5 my-5">
        <Container className="loginForm mx-auto w-50">
          <p className="text-center my-3 py-3 fw-bold">
            Register your new account:
          </p>
          <Form onSubmit={handleRegister}>
            {/* Username input */}
            <Form.Group
              as={Row}
              className="my-3 justify-content-center"
              controlId="formUsername"
            >
              <Form.Label column sm={3}>
                Username:
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="text"
                  name="username"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  required
                />
              </Col>
            </Form.Group>

            {/* Password input */}
            <Form.Group
              as={Row}
              className="my-3 pt-2 justify-content-center"
              controlId="formPassword"
            >
              <Form.Label column sm={3}>
                Password:
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </Col>
            </Form.Group>

            {/* Register button and Log in option */}
            <Form.Group as={Row} className="my-3 justify-content-center">
              <Col sm={{ span: 6 }}>
                <Button
                  type="submit"
                  className="my-4 loginButton"
                  style={{ cursor: "pointer" }}
                >
                  REGISTER & LOG IN
                </Button>
                <p
                  onClick={() => setSignIn(true)}
                  style={{ cursor: "pointer" }}
                >
                  Log in with existing account
                </p>

                {/* When error state is true, display error message */}
                {error && (
                  <Container className="error border border-danger border-2">
                    <Row>
                      <Col>
                        <p>{error}</p>
                      </Col>
                    </Row>
                  </Container>
                )}
              </Col>
            </Form.Group>
          </Form>
        </Container>
      </div>
    );
  }
}
