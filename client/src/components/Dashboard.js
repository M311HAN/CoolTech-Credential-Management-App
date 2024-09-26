import React, { useState, useEffect } from "react";

// Import components.
import OuCard from "./OuCard";
import AddRepoForm from "./AddRepoForm";
import EditRepoForm from "./EditRepoForm";
import UsersCard from "./UsersCard";

// Import Bootstrap components.
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Dashboard({
  isLoggedIn,
  userData,
  ouData,
  setOuData,
  allUsersData,
  setAllUsersData,
}) {
  console.log("userData:", userData);
  // Rest of your code...

  // ---------- Set states ----------
  // For storing OU data from forms (in OuCard, AddRepoForm and EditRepoForm components).
  const [formOuName, setFormOuName] = useState("");
  const [formDivisionName, setFormDivisionName] = useState("");
  const [formRepoName, setFormRepoName] = useState("");
  const [showAddRepoForm, setShowAddRepoForm] = useState(false);
  // Error handling for API requests
  const [showEditRepoForm, setShowEditRepoForm] = useState(false);

  // For displaying error messages.
  const [error, setError] = useState(null);

  // ---------- User Token ----------
  // Store user token for API requests.
  const userToken = userData.token;

  // ---------- Use Effect ----------
  // Fetch all OUs the user has access to when the component first loads.
  useEffect(() => {
    const getAllOrgUnits = async () => {
      try {
        // Request options for fetching organisational units
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`, // Ensure 'Bearer' prefix if required
          },
        };

        // Fetch organisational units from the API.
        const response = await fetch("/organisational-units", requestOptions);

        // Check if the response is not OK
        if (!response.ok) {
          // Parse and throw error if request fails
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch organisational units."
          );
        }

        // Parse JSON data from response.
        const jsonData = await response.json();

        // Store fetched OU data in state
        setOuData(jsonData);
        // Clear any existing errors
        setError(null);
      } catch (err) {
        console.error("Error fetching organisational units:", err);
        setError(err.message);
      }
    };

    // Fetch OU data only if the user is logged in and the token exists
    if (isLoggedIn && userToken) {
      getAllOrgUnits();
    }
  }, [isLoggedIn, userToken, setOuData]);

  // ---------- Render Dashboard ----------
  // If ouData contains data and the user is logged in, return the dashboard containing
  // a welcome message with cards for OU/User data and forms, based on the user's role.
  if (isLoggedIn && ouData) {
    return (
      <div id="dashboard" className="my-5 py-3">
        {/* ---------- Error Message container ---------- */}
        {/* Displays error message if there's an error with the GET OUs request. */}
        {error && (
          <Container className="error border border-danger border-2 p-3 mb-3">
            <Row>
              <Col className="text-end">
                <button
                  className="closeMessageButton btn btn-sm btn-outline-danger"
                  onClick={() => setError(null)}
                >
                  &times; Close
                </button>
              </Col>
            </Row>
            <Row>
              <Col>
                <p>{error}</p>
              </Col>
            </Row>
          </Container>
        )}

        {/* ---------- Welcome container ---------- */}
        <Container fluid className="pt-5">
          <Row>
            <Col>
              <h1 className="display-6">
                Welcome to your dashboard, {userData.username}.
              </h1>
              <p className="text-muted py-2 fs-4">Role: {ouData.role}</p>
            </Col>
          </Row>
        </Container>

        {/* ---------- Cards and Forms container ---------- */}
        <Container fluid>
          <Row className="mx-5">
            {/* --- OU Data column --- */}
            <Col sm={7}>
              <div className="cardContainer">
                {/* OU Data Card (with divisions and credential repos). */}
                <OuCard
                  ouData={ouData}
                  userData={userData}
                  setOuData={setOuData}
                  setFormOuName={setFormOuName}
                  setFormDivisionName={setFormDivisionName}
                  setFormRepoName={setFormRepoName}
                  setShowAddRepoForm={setShowAddRepoForm}
                  setShowEditRepoForm={setShowEditRepoForm}
                />
              </div>
            </Col>

            {/* --- Forms and Users Data column --- */}
            <Col sm={5} id="formsColumn">
              {/* Users Data Card for Admin only. */}
              <UsersCard
                ouData={ouData}
                setOuData={setOuData}
                userData={userData}
                allUsersData={allUsersData}
                setAllUsersData={setAllUsersData}
              />

              {/* Add New Credential Repo Form. */}
              <AddRepoForm
                userData={userData}
                ouData={ouData}
                setOuData={setOuData}
                formOuName={formOuName}
                setFormOuName={setFormOuName}
                formDivisionName={formDivisionName}
                setFormDivisionName={setFormDivisionName}
                setFormRepoName={setFormRepoName}
                showAddRepoForm={showAddRepoForm}
                setShowAddRepoForm={setShowAddRepoForm}
              />

              {/* Update Credential Repo Form. */}
              <EditRepoForm
                userData={userData}
                ouData={ouData}
                setOuData={setOuData}
                formOuName={formOuName}
                setFormOuName={setFormOuName}
                formDivisionName={formDivisionName}
                setFormDivisionName={setFormDivisionName}
                formRepoName={formRepoName}
                setFormRepoName={setFormRepoName}
                showEditRepoForm={showEditRepoForm}
                setShowEditRepoForm={setShowEditRepoForm}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Optionally, display a loading state or a message when no data is available
  if (isLoggedIn && ouData && !error) {
    return (
      <div id="dashboard" className="my-5 py-3">
        <p>Loading organisational units...</p>
      </div>
    );
  }

  // Optionally, handle cases where `isLoggedIn` is false
  return null;
}
