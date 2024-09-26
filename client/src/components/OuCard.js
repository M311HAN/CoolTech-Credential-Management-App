import React from "react";

// Import Bootstrap components
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ListGroup from "react-bootstrap/ListGroup";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";

// Import toast from react-toastify for notifications
import { toast } from "react-toastify";

export default function OuCard({
  ouData,
  userData,
  setOuData,
  setFormOuName,
  setFormDivisionName,
  setFormRepoName,
  setShowAddRepoForm,
  setShowEditRepoForm,
}) {
  // Handle displaying the 'Add New Repo' form, setting the division and OU names
  const displayAddRepoForm = async (divisionName, ouName) => {
    setFormDivisionName(divisionName);
    setFormOuName(ouName);
    setShowAddRepoForm(true);
    // Scroll to the top of the page when the form is displayed
    window.scrollTo(0, 0);
  };

  // Handle unassigning a user from an OU (OU Users tab)
  const displayEditRepoForm = async (repoName, divisionName, ouName) => {
    setFormRepoName(repoName);
    setFormDivisionName(divisionName);
    setFormOuName(ouName);
    setShowEditRepoForm(true);
    window.scrollTo(0, 0);
  };

  // Handle unassigning a user from an OU (OU Users tab)
  const unassignFromOu = async (userName, ouName) => {
    const userToken = userData.token;
    let requestBody = { userName: userName, ouName: ouName };

    // Prepare request options with the user's token for authorization
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    };

    // Make the request to unassign the user from the OU
    const response = await fetch("/unassign-from-ou", requestOptions);
    const jsonUnassignData = await response.json();

    // Notify the user if there was an error, otherwise refresh the OU data
    if (!response.ok) {
      toast.error(jsonUnassignData.message || "An error occurred.");
    } else {
      toast.success(jsonUnassignData.message);
      // Fetch updated OU data after the user is unassigned
      const getOUsRequestOptions = {
        method: "GET",
        headers: { Authorization: `Bearer ${userToken}` },
      };
      const ouResponse = await fetch(
        "/organisational-units",
        getOUsRequestOptions
      );
      const jsonOUsData = await ouResponse.json();
      setOuData(jsonOUsData);
    }
  };

  // Handle unassigning a user from a division (Division Users tab)
  const unassignFromDivision = async (userName, ouName, divisionName) => {
    const userToken = userData.token;
    let requestBody = {
      userName: userName,
      ouName: ouName,
      divisionName: divisionName,
    };
    // Prepare request options with the user's token for authorization
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    };
    // Make the request to unassign the user from the division
    const response = await fetch("/unassign-from-division", requestOptions);
    const jsonUnassignData = await response.json();

    // Notify the user if there was an error, otherwise refresh the OU data
    if (!response.ok) {
      toast.error(jsonUnassignData.message || "An error occurred.");
    } else {
      toast.success(jsonUnassignData.message);
      // Fetch updated OU data after the user is unassigned
      const getOUsRequestOptions = {
        method: "GET",
        headers: { Authorization: `Bearer ${userToken}` },
      };
      const ouResponse = await fetch(
        "/organisational-units",
        getOUsRequestOptions
      );
      const jsonOUsData = await ouResponse.json();
      setOuData(jsonOUsData);
    }
  };

  // Display loading message if the OU data is still being fetched
  if (!ouData || !ouData.orgUnits) {
    return <p>Loading Organizational Units...</p>;
  }

  // Handle the case when the user is not assigned to any OU or division
  if (ouData.orgUnits.length === 0) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center text-center"
        style={{ minHeight: "30vh" }}
      >
        <div>
          <p className="fs-5">
            You are currently not assigned to any Organizational Unit (OU) or
            Division.
          </p>
          <p className="fs-5">
            Please wait for an administrator to assign you.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* ---------- OU Cards ---------- */}
      {ouData.orgUnits.map((orgUnit, unitIndex) => {
        const divisions = orgUnit.divisions || [];
        const isAssignedToDivs = divisions.length > 0;

        if (isAssignedToDivs) {
          return (
            <Card key={unitIndex} className="my-4 ms-4 me-3">
              <Tabs defaultActiveKey="overview" className="tabs">
                <Tab
                  eventKey="overview"
                  title="Overview"
                  className="overviewTab"
                >
                  <Card.Body className="overviewDetails">
                    <Card.Title>
                      Organisational Unit: {orgUnit.ouName}
                    </Card.Title>
                    <Card.Subtitle className="py-3 text-start">
                      You have access to the following divisions:
                    </Card.Subtitle>

                    <ListGroup
                      variant="flush"
                      className="divisionsList text-start "
                    >
                      {divisions.map((division, divisionIndex) => {
                        return (
                          <ListGroup.Item key={divisionIndex}>
                            {division.divisionName}
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </Card.Body>
                </Tab>

                <Tab
                  eventKey="credentialRepos"
                  title="Credential Repos"
                  className="credentialReposTab"
                >
                  <Card.Body key={unitIndex} className="overviewDetails">
                    <Card.Title>
                      List of Credential Repositories for: {orgUnit.ouName}
                    </Card.Title>

                    {divisions.map((division, divisionIndex) => {
                      const credentialRepos = division.credentialRepos || [];

                      return (
                        <Accordion key={divisionIndex}>
                          <Accordion.Item eventKey={divisionIndex}>
                            <Accordion.Header>
                              Division: {division.divisionName}
                            </Accordion.Header>

                            <Accordion.Body>
                              <Table
                                striped
                                bordered
                                hover
                                className="ouTable align-middle"
                              >
                                <thead>
                                  <tr className="text-center">
                                    <th>Repository Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                    {(ouData.role === "admin" ||
                                      ouData.role === "management") && (
                                      <th>Update Credentials</th>
                                    )}
                                  </tr>
                                </thead>

                                <tbody>
                                  {credentialRepos.map((repo, repoIndex) => (
                                    <tr key={repoIndex}>
                                      <td>{repo.repoName}</td>
                                      <td>{repo.repoUsername}</td>
                                      <td>{repo.repoEmail}</td>
                                      <td>{repo.repoPassword}</td>
                                      {(ouData.role === "admin" ||
                                        ouData.role === "management") && (
                                        <td>
                                          <Button
                                            variant="success"
                                            size="sm"
                                            className="editRepoButton"
                                            onClick={() =>
                                              displayEditRepoForm(
                                                repo.repoName,
                                                division.divisionName,
                                                orgUnit.ouName
                                              )
                                            }
                                          >
                                            Update
                                          </Button>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                  <tr>
                                    <td colSpan={5}>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="addRepoButton"
                                        onClick={() =>
                                          displayAddRepoForm(
                                            division.divisionName,
                                            orgUnit.ouName
                                          )
                                        }
                                      >
                                        Add new repo
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      );
                    })}
                  </Card.Body>
                </Tab>

                {/* --- OU Users Tab (Only for Admin) --- */}
                {ouData.role === "admin" && (
                  <Tab
                    eventKey="ouUsersList"
                    title="OU Users"
                    className="ouUsersTab"
                  >
                    <Card.Body key={unitIndex} className="ouUsersDetails">
                      <Card.Title className="pt-2 pb-4">
                        List of Users assigned to: {orgUnit.ouName}
                      </Card.Title>

                      <Table
                        striped
                        bordered
                        hover
                        className="ouTable align-middle"
                      >
                        <thead>
                          <tr className="text-center">
                            <th>Username</th>
                            <th>Unassign from this OU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orgUnit.ouUsers?.length > 0 ? (
                            orgUnit.ouUsers.map((userName, userIndex) => (
                              <tr key={userIndex}>
                                <td>{userName}</td>
                                <td>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="unassignUserButton"
                                    onClick={() =>
                                      unassignFromOu(userName, orgUnit.ouName)
                                    }
                                  >
                                    Unassign
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="text-center">
                                No users assigned to this OU.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Tab>
                )}

                {/* --- Division Users Tab (Only for Admin) --- */}
                {ouData.role === "admin" && (
                  <Tab
                    eventKey="divisionUsersList"
                    title="Division Users"
                    className="divisionUsersTab"
                  >
                    <Card.Body key={unitIndex} className="divisionUsersDetails">
                      <Card.Title>
                        List of Division Users for: {orgUnit.ouName}
                      </Card.Title>

                      {divisions.map((division, divisionIndex) => (
                        <Accordion key={divisionIndex}>
                          <Accordion.Item eventKey={divisionIndex}>
                            <Accordion.Header>
                              Division: {division.divisionName}
                            </Accordion.Header>

                            <Accordion.Body>
                              <Table
                                striped
                                bordered
                                hover
                                className="ouTable align-middle"
                              >
                                <thead>
                                  <tr>
                                    <th colSpan={3}>
                                      Division: {division.divisionName}
                                    </th>
                                  </tr>
                                  <tr className="text-center">
                                    <th>Username</th>
                                    <th>Unassign from this Division</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {division.divisionUsers?.length > 0 ? (
                                    division.divisionUsers.map(
                                      (userName, userIndex) => (
                                        <tr key={userIndex}>
                                          <td>{userName}</td>
                                          <td>
                                            <Button
                                              variant="primary"
                                              size="sm"
                                              className="addCredentialRepoButton"
                                              onClick={() =>
                                                unassignFromDivision(
                                                  userName,
                                                  orgUnit.ouName,
                                                  division.divisionName
                                                )
                                              }
                                            >
                                              Unassign User
                                            </Button>
                                          </td>
                                        </tr>
                                      )
                                    )
                                  ) : (
                                    <tr>
                                      <td colSpan={2} className="text-center">
                                        No users assigned to this division.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      ))}
                    </Card.Body>
                  </Tab>
                )}
              </Tabs>
            </Card>
          );
        } else {
          // If the user is assigned to the OU but not to any divisions, display this message.
          return (
            <Card key={unitIndex} className="my-4">
              <Tabs defaultActiveKey="overview" className="tabs">
                <Tab
                  eventKey="overview"
                  title="Overview"
                  className="overviewTab"
                >
                  <Card.Body className="overviewDetails">
                    <Card.Title>
                      Organisational Unit: {orgUnit.ouName}
                    </Card.Title>
                    <p className="py-3 text-center">
                      You are assigned to this OU but you are not assigned to
                      any of its Divisions, so you do not have access to its
                      Divisions or Credential Repositories.
                    </p>
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card>
          );
        }
      })}
    </>
  );
}
