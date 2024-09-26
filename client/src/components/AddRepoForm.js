// AddRepoForm.js

import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { toast } from "react-toastify";

export default function AddRepoForm({
  userData,
  ouData,
  setOuData,
  formOuName,
  setFormOuName,
  formDivisionName,
  setFormDivisionName,
  setFormRepoName,
  showAddRepoForm,
  setShowAddRepoForm,
}) {
  // Set input fields for OU, Division, and Repo details
  const [inputOuName, setInputOuName] = useState("");
  const [inputDivisionName, setInputDivisionName] = useState("");
  const [inputRepoName, setInputRepoName] = useState("");
  const [inputRepoUsername, setInputRepoUsername] = useState("");
  const [inputRepoEmail, setInputRepoEmail] = useState("");
  const [inputRepoPassword, setInputRepoPassword] = useState("");

  // States for handling success and error messages
  const [error, setError] = useState();
  const [success, setSuccess] = useState();

  // Populate input fields based on the OU and division data
  useEffect(() => {
    ouData.orgUnits.forEach((orgUnit) => {
      if (orgUnit.ouName === formOuName) {
        orgUnit.divisions.forEach((division) => {
          if (division.divisionName === formDivisionName) {
            setInputOuName(formOuName);
            setInputDivisionName(formDivisionName);
          }
        });
      }
    });
  }, [formDivisionName, formOuName, ouData.orgUnits]);

  // User token for authorization
  const userToken = userData.token;

  // Handle form submission to add a new repo
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create an object for the new repo details
    const repo = {
      inputOuName,
      inputDivisionName,
      inputRepoName,
      inputRepoUsername,
      inputRepoEmail,
      inputRepoPassword,
    };

    // Request options for POST request
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(repo),
    };

    try {
      // Send POST request to add a new credential repo
      const response = await fetch("/add-credential-repo", requestOptions);
      const jsonAddRepoData = await response.json();

      if (!response.ok) {
        // Handle error response and display a toast message
        setError(jsonAddRepoData.message || "An unknown error occurred");
        toast.error(jsonAddRepoData.message || "An unknown error occurred");
      } else {
        // Handle success response and display a toast message
        setSuccess(jsonAddRepoData.message);
        toast.success(jsonAddRepoData.message);

        // Clear the form inputs after successful repo addition
        setFormOuName("");
        setFormDivisionName("");
        setFormRepoName("");
        setInputOuName("");
        setInputDivisionName("");
        setInputRepoName("");
        setInputRepoUsername("");
        setInputRepoEmail("");
        setInputRepoPassword("");

        // Fetch updated OU data after adding the repo
        const getOUsRequestOptions = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        };

        const ouResponse = await fetch(
          "/organisational-units",
          getOUsRequestOptions
        );
        const updatedOuData = await ouResponse.json();
        // Update the OU data immediately
        setOuData(updatedOuData);

        // Close the form after successful repo addition
        setShowAddRepoForm(false);
      }
      // Handle network or server error
    } catch (error) {
      setError("An error occurred while adding the repo.");
      toast.error("An error occurred while adding the repo.");
    }
  };

  return (
    <>
      {/* Error/Success Messages */}
      <div className="addRepoFormMessages mx-auto">
        {error && (
          <Container className="error border border-danger border-2 p-3 mb-3">
            <Row>
              <Col className="text-end">
                <p
                  className="closeMessageButton"
                  onClick={() => setError(null)}
                  style={{ cursor: "pointer" }} // Added inline style
                >
                  &times;
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p>{error}</p>
              </Col>
            </Row>
          </Container>
        )}

        {success && (
          <Container className="success border border-success border-2 p-3 mb-3">
            <Row>
              <Col className="text-end">
                <p
                  className="closeMessageButton"
                  onClick={() => setSuccess(null)}
                  style={{ cursor: "pointer" }} // Added inline style
                >
                  &times;
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p>{success}</p>
              </Col>
            </Row>
          </Container>
        )}
      </div>

      {/* Add Repo Form */}
      {showAddRepoForm && (
        <Card className="addRepoForm my-4">
          <Card.Header>Add a new credential repository:</Card.Header>
          <Card.Body>
            <p className="text-muted">
              Organisational Unit: "{formOuName}"
              <br />
              Division: "{formDivisionName}"
            </p>

            <Form onSubmit={handleSubmit} className="addRepoForm">
              <Form.Group as={Row} className="mb-3" controlId="formRepoName">
                <Form.Label column sm={5}>
                  Repo Name:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="text"
                    name="repoName"
                    onChange={(e) => setInputRepoName(e.target.value)}
                    value={inputRepoName}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formRepoUsername"
              >
                <Form.Label column sm={5}>
                  Repo Username:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="text"
                    name="repoUsername"
                    onChange={(e) => setInputRepoUsername(e.target.value)}
                    value={inputRepoUsername}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="formRepoEmail">
                <Form.Label column sm={5}>
                  Repo Email:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="email"
                    name="repoEmail"
                    onChange={(e) => setInputRepoEmail(e.target.value)}
                    value={inputRepoEmail}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formRepoPassword"
              >
                <Form.Label column sm={5}>
                  Repo Password:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="password"
                    name="repoPassword"
                    onChange={(e) => setInputRepoPassword(e.target.value)}
                    value={inputRepoPassword}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Col sm={{ span: 12 }}>
                  <Button type="submit" className="my-4">
                    Add Repo
                  </Button>
                </Col>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
