// EditRepoForm.js

import React, { useState, useEffect } from "react";

// Import Bootstrap components.
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { toast } from "react-toastify";
import "../App.css";

export default function EditRepoForm({
  userData,
  ouData,
  setOuData,
  formOuName,
  setFormOuName,
  formDivisionName,
  setFormDivisionName,
  formRepoName,
  setFormRepoName,
  showEditRepoForm,
  setShowEditRepoForm,
}) {
  // ---------- Set States ----------
  // Input fields to manage OU, division, repo, and their details
  const [inputOuName, setInputOuName] = useState("");
  const [inputDivisionName, setInputDivisionName] = useState("");
  const [inputRepoName, setInputRepoName] = useState("");
  const [inputRepoUsername, setInputRepoUsername] = useState("");
  const [inputRepoEmail, setInputRepoEmail] = useState("");
  const [inputRepoPassword, setInputRepoPassword] = useState("");

  // States for error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------- Use Effect ----------
  // Populate form fields when the component loads based on the selected OU, division, and repo
  useEffect(() => {
    // Loop through the OUs, divisions, and credential repos to find the selected one
    ouData.orgUnits.forEach((orgUnit) => {
      if (orgUnit.ouName === formOuName) {
        orgUnit.divisions.forEach((division) => {
          if (division.divisionName === formDivisionName) {
            division.credentialRepos.forEach((repo) => {
              if (repo.repoName === formRepoName) {
                // Set form fields with the repo details
                setInputOuName(formOuName);
                setInputDivisionName(formDivisionName);
                setInputRepoName(formRepoName);
                setInputRepoUsername(repo.repoUsername);
                setInputRepoEmail(repo.repoEmail);
                setInputRepoPassword(repo.repoPassword);
              }
            });
          }
        });
      }
    });
  }, [formDivisionName, formOuName, formRepoName, ouData.orgUnits]);

  // ---------- User Token ----------
  const userToken = userData.token;

  // ---------- Handle Error Messages ----------
  const handleHideError = () => {
    setError("");
  };

  // ---------- Handle Success Messages ----------
  const handleHideSuccess = () => {
    setSuccess("");
  };

  // ---------- Handle Update Repo ----------
  // Handles form submission to update a repository
  const handleSubmit = async (e) => {
    // Prevent page reload on form submit
    e.preventDefault();

    // Prepare the updated repo data
    const updatedRepo = {
      inputOuName,
      inputDivisionName,
      inputRepoName,
      inputRepoUsername,
      inputRepoEmail,
      inputRepoPassword,
    };

    // API request options for updating the repo
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      // Convert repo data to JSON
      body: JSON.stringify(updatedRepo),
    };

    try {
      // Send the PUT request to update the repo
      const response = await fetch(`/update-credential-repo`, requestOptions);
      const jsonUpdateRepoData = await response.json();

      // Handle response: success or error
      if (!response.ok) {
        setError(jsonUpdateRepoData.message || "An unknown error occurred");
        toast.error(jsonUpdateRepoData.message || "An unknown error occurred");
      } else {
        setSuccess(jsonUpdateRepoData.message || "Repo updated successfully");
        toast.success(
          jsonUpdateRepoData.message || "Repo updated successfully"
        );

        // Clear form fields after a successful update
        setFormOuName("");
        setFormDivisionName("");
        setFormRepoName("");
        setInputOuName("");
        setInputDivisionName("");
        setInputRepoName("");
        setInputRepoUsername("");
        setInputRepoEmail("");
        setInputRepoPassword("");

        // Fetch and update the OU data after repo update
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
        // Update state with fresh OU data
        setOuData(updatedOuData);

        // Close the edit form after updating
        setShowEditRepoForm(false);
      }
    } catch (error) {
      setError("An error occurred while updating the repo.");
      toast.error("An error occurred while updating the repo.");
    }
  };

  return (
    <>
      {/* ---------- Error/Success Messages ---------- */}
      <div className="editRepoFormMessages mx-auto">
        {error && (
          <Container className="error border border-danger border-2 p-3 mb-3">
            <Row>
              <Col className="text-end">
                <p
                  className="closeMessageButton"
                  onClick={handleHideError}
                  style={{ cursor: "pointer" }} // Pointer cursor
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
                  onClick={handleHideSuccess}
                  style={{ cursor: "pointer" }} // Pointer cursor
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

      {/* ---------- Edit Repo Form ---------- */}
      {showEditRepoForm && (
        <Card className="addRepoForm my-4">
          <Card.Header>Update a credential repository:</Card.Header>
          <Card.Body>
            {/* Name of OU, Division and Credential Repo where repo will be updated. */}
            <p className="text-muted">
              Organisational Unit: "{formOuName}"<br></br>
              Division: "{formDivisionName}"<br></br>
              Credential Repo Name: "{formRepoName}"
            </p>

            {/* Form for updating repo. */}
            <Form onSubmit={handleSubmit} className="editRepoForm">
              {/* Repo Username input. */}
              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formRepoUsername"
              >
                <Form.Label column sm={5}>
                  Update Username:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="text"
                    name="repoUsername"
                    value={inputRepoUsername}
                    onChange={(e) => setInputRepoUsername(e.target.value)}
                    required
                  />
                </Col>
              </Form.Group>

              {/* Repo Email input. */}
              <Form.Group as={Row} className="mb-3" controlId="formRepoEmail">
                <Form.Label column sm={5}>
                  Update Email:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="email"
                    name="repoEmail"
                    value={inputRepoEmail}
                    onChange={(e) => setInputRepoEmail(e.target.value)}
                    required
                  />
                </Col>
              </Form.Group>

              {/* Repo Password input */}
              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formRepoPassword"
              >
                <Form.Label column sm={5}>
                  Update Password:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="password"
                    name="repoPassword"
                    value={inputRepoPassword}
                    onChange={(e) => setInputRepoPassword(e.target.value)}
                    required
                  />
                </Col>
              </Form.Group>

              {/* Submit button */}
              <Form.Group as={Row}>
                <Col sm={{ span: 12 }}>
                  <Button type="submit" className="my-4">
                    Update Repo
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
